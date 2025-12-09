/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ProgressBar } from '../../../../../../base/browser/ui/progressbar/progressbar.ts';
import { decodeBase64 } from '../../../../../../base/common/buffer.ts';
import { IMarkdownString, createMarkdownCommandLink, MarkdownString } from '../../../../../../base/common/htmlContent.ts';
import { Lazy } from '../../../../../../base/common/lazy.ts';
import { toDisposable } from '../../../../../../base/common/lifecycle.ts';
import { getExtensionForMimeType } from '../../../../../../base/common/mime.ts';
import { autorun } from '../../../../../../base/common/observable.ts';
import { basename } from '../../../../../../base/common/resources.ts';
import { ILanguageService } from '../../../../../../editor/common/languages/language.ts';
import { IModelService } from '../../../../../../editor/common/services/model.ts';
import { localize } from '../../../../../../nls.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { ChatResponseResource } from '../../../common/chatModel.ts';
import { IChatToolInvocation, IChatToolInvocationSerialized, ToolConfirmKind } from '../../../common/chatService.ts';
import { IToolResultInputOutputDetails } from '../../../common/languageModelToolsService.ts';
import { IChatCodeBlockInfo } from '../../chat.ts';
import { IChatContentPartRenderContext } from '../chatContentParts.ts';
import { ChatCollapsibleInputOutputContentPart, ChatCollapsibleIOPart, IChatCollapsibleIOCodePart } from '../chatToolInputOutputContentPart.ts';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.ts';

export class ChatInputOutputMarkdownProgressPart extends BaseChatToolInvocationSubPart {
	/** Remembers expanded tool parts on re-render */
	private static readonly _expandedByDefault = new WeakMap<IChatToolInvocation | IChatToolInvocationSerialized, boolean>();

	public readonly domNode: HTMLElement;

	private _codeblocks: IChatCodeBlockInfo[] = [];
	public get codeblocks(): IChatCodeBlockInfo[] {
		return this._codeblocks;
	}

	constructor(
		toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized,
		context: IChatContentPartRenderContext,
		codeBlockStartIndex: number,
		message: string | IMarkdownString,
		subtitle: string | IMarkdownString | undefined,
		input: string,
		output: IToolResultInputOutputDetails['output'] | undefined,
		isError: boolean,
		@IInstantiationService instantiationService: IInstantiationService,
		@IModelService modelService: IModelService,
		@ILanguageService languageService: ILanguageService,
	) {
		super(toolInvocation);

		let codeBlockIndex = codeBlockStartIndex;
		const toCodePart = (data: string): IChatCollapsibleIOCodePart => {
			const model = this._register(modelService.createModel(
				data,
				languageService.createById('json'),
				undefined,
				true
			));

			return {
				kind: 'code',
				textModel: model,
				languageId: model.getLanguageId(),
				options: {
					hideToolbar: true,
					reserveWidth: 19,
					maxHeightInLines: 13,
					verticalPadding: 5,
					editorOptions: {
						wordWrap: 'on'
					}
				},
				codeBlockInfo: {
					codeBlockIndex: codeBlockIndex++,
					codemapperUri: undefined,
					elementId: context.element.id,
					focus: () => { },
					ownerMarkdownPartId: this.codeblocksPartId,
					uri: model.uri,
					chatSessionResource: context.element.sessionResource,
					uriPromise: Promise.resolve(model.uri)
				}
			};
		};

		let processedOutput = output;
		if (typeof output === 'string') { // back compat with older stored versions
			processedOutput = [{ type: 'embed', value: output, isText: true }];
		}

		const collapsibleListPart = this._register(instantiationService.createInstance(
			ChatCollapsibleInputOutputContentPart,
			message,
			subtitle,
			this.getAutoApproveMessageContent(),
			context,
			toCodePart(input),
			processedOutput && {
				parts: processedOutput.map((o, i): ChatCollapsibleIOPart => {
					const permalinkBasename = o.type === 'ref' || o.uri
						? basename(o.uri!)
						: o.mimeType && getExtensionForMimeType(o.mimeType)
							? `file${getExtensionForMimeType(o.mimeType)}`
							: 'file' + (o.isText ? '.txt' : '.bin');


					if (o.type === 'ref') {
						return { kind: 'data', uri: o.uri, mimeType: o.mimeType };
					} else if (o.isText && !o.asResource) {
						return toCodePart(o.value);
					} else {
						let decoded: Uint8Array | undefined;
						try {
							if (!o.isText) {
								decoded = decodeBase64(o.value).buffer;
							}
						} catch {
							// ignored
						}

						// Fall back to text if it's not valid base64
						const permalinkUri = ChatResponseResource.createUri(context.element.sessionId, toolInvocation.toolCallId, i, permalinkBasename);
						return { kind: 'data', value: decoded || new TextEncoder().encode(o.value), mimeType: o.mimeType, uri: permalinkUri, audience: o.audience };
					}
				}),
			},
			isError,
			ChatInputOutputMarkdownProgressPart._expandedByDefault.get(toolInvocation) ?? false,
		));
		this._codeblocks.push(...collapsibleListPart.codeblocks);
		this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
		this._register(toDisposable(() => ChatInputOutputMarkdownProgressPart._expandedByDefault.set(toolInvocation, collapsibleListPart.expanded)));

		const progressObservable = toolInvocation.kind === 'toolInvocation' ? toolInvocation.state.map((s, r) => s.type === IChatToolInvocation.StateKind.Executing ? s.progress.read(r) : undefined) : undefined;
		const progressBar = new Lazy(() => this._register(new ProgressBar(collapsibleListPart.domNode)));
		if (progressObservable) {
			this._register(autorun(reader => {
				const progress = progressObservable?.read(reader);
				if (progress?.message) {
					collapsibleListPart.title = progress.message;
				}
				if (progress?.progress && !IChatToolInvocation.isComplete(toolInvocation, reader)) {
					progressBar.value.setWorked(progress.progress * 100);
				}
			}));
		}

		this.domNode = collapsibleListPart.domNode;
	}

	private getAutoApproveMessageContent() {
		const reason = IChatToolInvocation.executionConfirmedOrDenied(this.toolInvocation);
		if (!reason || typeof reason === 'boolean') {
			return;
		}

		let md: string;
		switch (reason.type) {
			case ToolConfirmKind.Setting:
				md = localize('chat.autoapprove.setting', 'Auto approved by {0}', createMarkdownCommandLink({ title: '`' + reason.id + '`', id: 'workbench.action.openSettings', arguments: [reason.id] }, false));
				break;
			case ToolConfirmKind.LmServicePerTool:
				md = reason.scope === 'session'
					? localize('chat.autoapprove.lmServicePerTool.session', 'Auto approved for this session')
					: reason.scope === 'workspace'
						? localize('chat.autoapprove.lmServicePerTool.workspace', 'Auto approved for this workspace')
						: localize('chat.autoapprove.lmServicePerTool.profile', 'Auto approved for this profile');
				md += ' (' + createMarkdownCommandLink({ title: localize('edit', 'Edit'), id: 'workbench.action.chat.editToolApproval', arguments: [reason.scope] }) + ')';
				break;
			case ToolConfirmKind.UserAction:
			case ToolConfirmKind.Denied:
			case ToolConfirmKind.ConfirmationNotNeeded:
			default:
				return;
		}


		return new MarkdownString(md, { isTrusted: true });
	}
}
