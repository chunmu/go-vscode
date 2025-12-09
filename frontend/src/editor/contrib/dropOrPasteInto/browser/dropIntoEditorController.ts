/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAction } from '../../../../base/common/actions.ts';
import { coalesce } from '../../../../base/common/arrays.ts';
import { CancelablePromise, createCancelablePromise, raceCancellation } from '../../../../base/common/async.ts';
import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { VSDataTransfer } from '../../../../base/common/dataTransfer.ts';
import { isCancellationError } from '../../../../base/common/errors.ts';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.ts';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.ts';
import { localize } from '../../../../nls.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.ts';
import { LocalSelectionTransfer } from '../../../../platform/dnd/browser/dnd.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { toExternalVSDataTransfer } from '../../../browser/dataTransfer.ts';
import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorOption } from '../../../common/config/editorOptions.ts';
import { IPosition } from '../../../common/core/position.ts';
import { Range } from '../../../common/core/range.ts';
import { IEditorContribution } from '../../../common/editorCommon.ts';
import { DocumentDropEdit, DocumentDropEditProvider } from '../../../common/languages.ts';
import { ITextModel } from '../../../common/model.ts';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.ts';
import { DraggedTreeItemsIdentifier } from '../../../common/services/treeViewsDnd.ts';
import { ITreeViewsDnDService } from '../../../common/services/treeViewsDndService.ts';
import { CodeEditorStateFlag, EditorStateCancellationTokenSource } from '../../editorState/browser/editorState.ts';
import { InlineProgressManager } from '../../inlineProgress/browser/inlineProgress.ts';
import { PreferredDropConfiguration } from './dropIntoEditorContribution.ts';
import { sortEditsByYieldTo } from './edit.ts';
import { PostEditWidgetManager } from './postEditWidget.ts';

export const dropAsPreferenceConfig = 'editor.dropIntoEditor.preferences';

export const changeDropTypeCommandId = 'editor.changeDropType';

export const dropWidgetVisibleCtx = new RawContextKey<boolean>('dropWidgetVisible', false, localize('dropWidgetVisible', "Whether the drop widget is showing"));

export class DropIntoEditorController extends Disposable implements IEditorContribution {

	public static readonly ID = 'editor.contrib.dropIntoEditorController';

	public static get(editor: ICodeEditor): DropIntoEditorController | null {
		return editor.getContribution<DropIntoEditorController>(DropIntoEditorController.ID);
	}

	public static setConfigureDefaultAction(action: IAction) {
		this._configureDefaultAction = action;
	}

	private static _configureDefaultAction?: IAction;

	/**
	 * Global tracking the current drop operation.
	 *
	 * TODO: figure out how to make this work with multiple windows
	 */
	private static _currentDropOperation?: CancelablePromise<void>;

	private readonly _dropProgressManager: InlineProgressManager;
	private readonly _postDropWidgetManager: PostEditWidgetManager<DocumentDropEdit>;

	private readonly treeItemsTransfer = LocalSelectionTransfer.getInstance<DraggedTreeItemsIdentifier>();

	constructor(
		editor: ICodeEditor,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService private readonly _configService: IConfigurationService,
		@ILanguageFeaturesService private readonly _languageFeaturesService: ILanguageFeaturesService,
		@ITreeViewsDnDService private readonly _treeViewsDragAndDropService: ITreeViewsDnDService
	) {
		super();

		this._dropProgressManager = this._register(instantiationService.createInstance(InlineProgressManager, 'dropIntoEditor', editor));
		this._postDropWidgetManager = this._register(instantiationService.createInstance(PostEditWidgetManager, 'dropIntoEditor', editor, dropWidgetVisibleCtx,
			{ id: changeDropTypeCommandId, label: localize('postDropWidgetTitle', "Show drop options...") },
			() => DropIntoEditorController._configureDefaultAction ? [DropIntoEditorController._configureDefaultAction] : []));

		this._register(editor.onDropIntoEditor(e => this.onDropIntoEditor(editor, e.position, e.event)));
	}

	public clearWidgets() {
		this._postDropWidgetManager.clear();
	}

	public changeDropType() {
		this._postDropWidgetManager.tryShowSelector();
	}

	private async onDropIntoEditor(editor: ICodeEditor, position: IPosition, dragEvent: DragEvent) {
		if (!dragEvent.dataTransfer || !editor.hasModel()) {
			return;
		}

		DropIntoEditorController._currentDropOperation?.cancel();

		editor.focus();
		editor.setPosition(position);

		const p = createCancelablePromise(async (token) => {
			const disposables = new DisposableStore();

			const tokenSource = disposables.add(new EditorStateCancellationTokenSource(editor, CodeEditorStateFlag.Value, undefined, token));
			try {
				const ourDataTransfer = await this.extractDataTransferData(dragEvent);
				if (ourDataTransfer.size === 0 || tokenSource.token.isCancellationRequested) {
					return;
				}

				const model = editor.getModel();
				if (!model) {
					return;
				}

				const providers = this._languageFeaturesService.documentDropEditProvider
					.ordered(model)
					.filter(provider => {
						if (!provider.dropMimeTypes) {
							// Keep all providers that don't specify mime types
							return true;
						}
						return provider.dropMimeTypes.some(mime => ourDataTransfer.matches(mime));
					});

				const editSession = disposables.add(await this.getDropEdits(providers, model, position, ourDataTransfer, tokenSource.token));
				if (tokenSource.token.isCancellationRequested) {
					return;
				}

				if (editSession.edits.length) {
					const activeEditIndex = this.getInitialActiveEditIndex(model, editSession.edits);
					const canShowWidget = editor.getOption(EditorOption.dropIntoEditor).showDropSelector === 'afterDrop';
					// Pass in the parent token here as it tracks cancelling the entire drop operation
					await this._postDropWidgetManager.applyEditAndShowIfNeeded([Range.fromPositions(position)], { activeEditIndex, allEdits: editSession.edits }, canShowWidget, async edit => edit, token);
				}
			} finally {
				disposables.dispose();
				if (DropIntoEditorController._currentDropOperation === p) {
					DropIntoEditorController._currentDropOperation = undefined;
				}
			}
		});

		this._dropProgressManager.showWhile(position, localize('dropIntoEditorProgress', "Running drop handlers. Click to cancel"), p, { cancel: () => p.cancel() });
		DropIntoEditorController._currentDropOperation = p;
	}

	private async getDropEdits(providers: readonly DocumentDropEditProvider[], model: ITextModel, position: IPosition, dataTransfer: VSDataTransfer, token: CancellationToken) {
		const disposables = new DisposableStore();

		const results = await raceCancellation(Promise.all(providers.map(async provider => {
			try {
				const edits = await provider.provideDocumentDropEdits(model, position, dataTransfer, token);
				if (edits) {
					disposables.add(edits);
				}
				return edits?.edits.map(edit => ({ ...edit, providerId: provider.id }));
			} catch (err) {
				if (!isCancellationError(err)) {
					console.error(err);
				}
				console.error(err);
			}
			return undefined;
		})), token);

		const edits = coalesce(results ?? []).flat();
		return {
			edits: sortEditsByYieldTo(edits),
			dispose: () => disposables.dispose()
		};
	}

	private getInitialActiveEditIndex(model: ITextModel, edits: ReadonlyArray<DocumentDropEdit>): number {
		const preferredProviders = this._configService.getValue<PreferredDropConfiguration[]>(dropAsPreferenceConfig, { resource: model.uri });
		for (const config of Array.isArray(preferredProviders) ? preferredProviders : []) {
			const desiredKind = new HierarchicalKind(config);
			const editIndex = edits.findIndex(edit => edit.kind && desiredKind.contains(edit.kind));
			if (editIndex >= 0) {
				return editIndex;
			}
		}
		return 0;
	}

	private async extractDataTransferData(dragEvent: DragEvent): Promise<VSDataTransfer> {
		if (!dragEvent.dataTransfer) {
			return new VSDataTransfer();
		}

		const dataTransfer = toExternalVSDataTransfer(dragEvent.dataTransfer);

		if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
			const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
			if (Array.isArray(data)) {
				for (const id of data) {
					const treeDataTransfer = await this._treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
					if (treeDataTransfer) {
						for (const [type, value] of treeDataTransfer) {
							dataTransfer.replace(type, value);
						}
					}
				}
			}
		}

		return dataTransfer;
	}
}
