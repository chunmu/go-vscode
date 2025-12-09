/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.ts';
import { Codicon } from '../../../../base/common/codicons.ts';
import { basename } from '../../../../base/common/resources.ts';
import { ThemeIcon } from '../../../../base/common/themables.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IRange } from '../../../../editor/common/core/range.ts';
import { SymbolKinds } from '../../../../editor/common/languages.ts';
import { ITextModelService } from '../../../../editor/common/services/resolverService.ts';
import { localize } from '../../../../nls.ts';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IDraggedResourceEditorInput, MarkerTransferData, DocumentSymbolTransferData, NotebookCellOutputTransferData } from '../../../../platform/dnd/browser/dnd.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';
import { MarkerSeverity } from '../../../../platform/markers/common/markers.ts';
import { isUntitledResourceEditorInput } from '../../../common/editor.ts';
import { EditorInput } from '../../../common/editor/editorInput.ts';
import { IEditorService } from '../../../services/editor/common/editorService.ts';
import { IExtensionService, isProposedApiEnabled } from '../../../services/extensions/common/extensions.ts';
import { UntitledTextEditorInput } from '../../../services/untitled/common/untitledTextEditorInput.ts';
import { createNotebookOutputVariableEntry, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST } from '../../notebook/browser/contrib/chat/notebookChatUtils.ts';
import { getOutputViewModelFromId } from '../../notebook/browser/controller/cellOutputActions.ts';
import { getNotebookEditorFromEditorPane } from '../../notebook/browser/notebookBrowser.ts';
import { SCMHistoryItemTransferData } from '../../scm/browser/scmHistoryChatContext.ts';
import { CHAT_ATTACHABLE_IMAGE_MIME_TYPES, getAttachableImageExtension } from '../common/chatModel.ts';
import { IChatRequestVariableEntry, OmittedState, IDiagnosticVariableEntry, IDiagnosticVariableEntryFilterData, ISymbolVariableEntry, toPromptFileVariableEntry, PromptFileVariableKind, ISCMHistoryItemVariableEntry } from '../common/chatVariableEntries.ts';
import { getPromptsTypeForLanguageId, PromptsType } from '../common/promptSyntax/promptTypes.ts';
import { imageToHash } from './chatPasteProviders.ts';
import { resizeImage } from './imageUtils.ts';

export const IChatAttachmentResolveService = createDecorator<IChatAttachmentResolveService>('IChatAttachmentResolveService');

export interface IChatAttachmentResolveService {
	_serviceBrand: undefined;

	resolveEditorAttachContext(editor: EditorInput | IDraggedResourceEditorInput): Promise<IChatRequestVariableEntry | undefined>;
	resolveUntitledEditorAttachContext(editor: IDraggedResourceEditorInput): Promise<IChatRequestVariableEntry | undefined>;
	resolveResourceAttachContext(resource: URI, isDirectory: boolean): Promise<IChatRequestVariableEntry | undefined>;

	resolveImageEditorAttachContext(resource: URI, data?: VSBuffer, mimeType?: string): Promise<IChatRequestVariableEntry | undefined>;
	resolveImageAttachContext(images: ImageTransferData[]): Promise<IChatRequestVariableEntry[]>;
	resolveMarkerAttachContext(markers: MarkerTransferData[]): IDiagnosticVariableEntry[];
	resolveSymbolsAttachContext(symbols: DocumentSymbolTransferData[]): ISymbolVariableEntry[];
	resolveNotebookOutputAttachContext(data: NotebookCellOutputTransferData): IChatRequestVariableEntry[];
	resolveSourceControlHistoryItemAttachContext(data: SCMHistoryItemTransferData[]): ISCMHistoryItemVariableEntry[];
}

export class ChatAttachmentResolveService implements IChatAttachmentResolveService {
	_serviceBrand: undefined;

	constructor(
		@IFileService private fileService: IFileService,
		@IEditorService private editorService: IEditorService,
		@ITextModelService private textModelService: ITextModelService,
		@IExtensionService private extensionService: IExtensionService,
		@IDialogService private dialogService: IDialogService
	) { }

	// --- EDITORS ---

	public async resolveEditorAttachContext(editor: EditorInput | IDraggedResourceEditorInput): Promise<IChatRequestVariableEntry | undefined> {
		// untitled editor
		if (isUntitledResourceEditorInput(editor)) {
			return await this.resolveUntitledEditorAttachContext(editor);
		}

		if (!editor.resource) {
			return undefined;
		}

		let stat;
		try {
			stat = await this.fileService.stat(editor.resource);
		} catch {
			return undefined;
		}

		if (!stat.isDirectory && !stat.isFile) {
			return undefined;
		}

		const imageContext = await this.resolveImageEditorAttachContext(editor.resource);
		if (imageContext) {
			return this.extensionService.extensions.some(ext => isProposedApiEnabled(ext, 'chatReferenceBinaryData')) ? imageContext : undefined;
		}

		return await this.resolveResourceAttachContext(editor.resource, stat.isDirectory);
	}

	public async resolveUntitledEditorAttachContext(editor: IDraggedResourceEditorInput): Promise<IChatRequestVariableEntry | undefined> {
		// If the resource is known, we can use it directly
		if (editor.resource) {
			return await this.resolveResourceAttachContext(editor.resource, false);
		}

		// Otherwise, we need to check if the contents are already open in another editor
		const openUntitledEditors = this.editorService.editors.filter(editor => editor instanceof UntitledTextEditorInput) as UntitledTextEditorInput[];
		for (const canidate of openUntitledEditors) {
			const model = await canidate.resolve();
			const contents = model.textEditorModel?.getValue();
			if (contents === editor.contents) {
				return await this.resolveResourceAttachContext(canidate.resource, false);
			}
		}

		return undefined;
	}

	public async resolveResourceAttachContext(resource: URI, isDirectory: boolean): Promise<IChatRequestVariableEntry | undefined> {
		let omittedState = OmittedState.NotOmitted;

		if (!isDirectory) {

			let languageId: string | undefined;
			try {
				const createdModel = await this.textModelService.createModelReference(resource);
				languageId = createdModel.object.getLanguageId();
				createdModel.dispose();
			} catch {
				omittedState = OmittedState.Full;
			}

			if (/\.(svg)$/i.test(resource.path)) {
				omittedState = OmittedState.Full;
			}
			if (languageId) {
				const promptsType = getPromptsTypeForLanguageId(languageId);
				if (promptsType === PromptsType.prompt) {
					return toPromptFileVariableEntry(resource, PromptFileVariableKind.PromptFile);
				} else if (promptsType === PromptsType.instructions) {
					return toPromptFileVariableEntry(resource, PromptFileVariableKind.Instruction);
				}
			}
		}

		return {
			kind: isDirectory ? 'directory' : 'file',
			value: resource,
			id: resource.toString(),
			name: basename(resource),
			omittedState
		};
	}

	// --- IMAGES ---

	public async resolveImageEditorAttachContext(resource: URI, data?: VSBuffer, mimeType?: string): Promise<IChatRequestVariableEntry | undefined> {
		if (!resource) {
			return undefined;
		}

		if (mimeType) {
			if (!getAttachableImageExtension(mimeType)) {
				return undefined;
			}
		} else {
			const match = SUPPORTED_IMAGE_EXTENSIONS_REGEX.exec(resource.path);
			if (!match) {
				return undefined;
			}

			mimeType = getMimeTypeFromPath(match);
		}
		const fileName = basename(resource);

		let dataBuffer: VSBuffer | undefined;
		if (data) {
			dataBuffer = data;
		} else {

			let stat;
			try {
				stat = await this.fileService.stat(resource);
			} catch {
				return undefined;
			}

			const readFile = await this.fileService.readFile(resource);

			if (stat.size > 30 * 1024 * 1024) { // 30 MB
				this.dialogService.error(localize('imageTooLarge', 'Image is too large'), localize('imageTooLargeMessage', 'The image {0} is too large to be attached.', fileName));
				throw new Error('Image is too large');
			}

			dataBuffer = readFile.value;
		}

		const isPartiallyOmitted = /\.gif$/i.test(resource.path);
		const imageFileContext = await this.resolveImageAttachContext([{
			id: resource.toString(),
			name: fileName,
			data: dataBuffer.buffer,
			icon: Codicon.fileMedia,
			resource: resource,
			mimeType: mimeType,
			omittedState: isPartiallyOmitted ? OmittedState.Partial : OmittedState.NotOmitted
		}]);

		return imageFileContext[0];
	}

	public resolveImageAttachContext(images: ImageTransferData[]): Promise<IChatRequestVariableEntry[]> {
		return Promise.all(images.map(async image => ({
			id: image.id || await imageToHash(image.data),
			name: image.name,
			fullName: image.resource ? image.resource.path : undefined,
			value: await resizeImage(image.data, image.mimeType),
			icon: image.icon,
			kind: 'image',
			isFile: false,
			isDirectory: false,
			omittedState: image.omittedState || OmittedState.NotOmitted,
			references: image.resource ? [{ reference: image.resource, kind: 'reference' }] : []
		})));
	}

	// --- MARKERS ---

	public resolveMarkerAttachContext(markers: MarkerTransferData[]): IDiagnosticVariableEntry[] {
		return markers.map((marker): IDiagnosticVariableEntry => {
			let filter: IDiagnosticVariableEntryFilterData;
			if (!('severity' in marker)) {
				filter = { filterUri: URI.revive(marker.uri), filterSeverity: MarkerSeverity.Warning };
			} else {
				filter = IDiagnosticVariableEntryFilterData.fromMarker(marker);
			}

			return IDiagnosticVariableEntryFilterData.toEntry(filter);
		});
	}

	// --- SYMBOLS ---

	public resolveSymbolsAttachContext(symbols: DocumentSymbolTransferData[]): ISymbolVariableEntry[] {
		return symbols.map(symbol => {
			const resource = URI.file(symbol.fsPath);
			return {
				kind: 'symbol',
				id: symbolId(resource, symbol.range),
				value: { uri: resource, range: symbol.range },
				symbolKind: symbol.kind,
				icon: SymbolKinds.toIcon(symbol.kind),
				fullName: symbol.name,
				name: symbol.name,
			};
		});
	}

	// --- NOTEBOOKS ---

	public resolveNotebookOutputAttachContext(data: NotebookCellOutputTransferData): IChatRequestVariableEntry[] {
		const notebookEditor = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane);
		if (!notebookEditor) {
			return [];
		}

		const outputViewModel = getOutputViewModelFromId(data.outputId, notebookEditor);
		if (!outputViewModel) {
			return [];
		}

		const mimeType = outputViewModel.pickedMimeType?.mimeType;
		if (mimeType && NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST.includes(mimeType)) {

			const entry = createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor);
			if (!entry) {
				return [];
			}

			return [entry];
		}

		return [];
	}

	// --- SOURCE CONTROL ---

	public resolveSourceControlHistoryItemAttachContext(data: SCMHistoryItemTransferData[]): ISCMHistoryItemVariableEntry[] {
		return data.map(d => ({
			id: d.historyItem.id,
			name: d.name,
			value: URI.revive(d.resource),
			historyItem: {
				...d.historyItem,
				references: []
			},
			kind: 'scmHistoryItem'
		} satisfies ISCMHistoryItemVariableEntry));
	}
}

function symbolId(resource: URI, range?: IRange): string {
	let rangePart = '';
	if (range) {
		rangePart = `:${range.startLineNumber}`;
		if (range.startLineNumber !== range.endLineNumber) {
			rangePart += `-${range.endLineNumber}`;
		}
	}
	return resource.fsPath + rangePart;
}

export type ImageTransferData = {
	data: Uint8Array;
	name: string;
	icon?: ThemeIcon;
	resource?: URI;
	id?: string;
	mimeType?: string;
	omittedState?: OmittedState;
};
const SUPPORTED_IMAGE_EXTENSIONS_REGEX = new RegExp(`\\.(${Object.keys(CHAT_ATTACHABLE_IMAGE_MIME_TYPES).join('|')})$`, 'i');

function getMimeTypeFromPath(match: RegExpExecArray): string | undefined {
	const ext = match[1].toLowerCase();
	return CHAT_ATTACHABLE_IMAGE_MIME_TYPES[ext];
}

