/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../../../base/browser/dom.ts';
import { Emitter } from '../../../../../../base/common/event.ts';
import { Disposable, DisposableStore, IDisposable } from '../../../../../../base/common/lifecycle.ts';
import { autorun } from '../../../../../../base/common/observable.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.ts';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService.ts';
import { IChatRendererContent } from '../../../common/chatViewModel.ts';
import { CodeBlockModelCollection } from '../../../common/codeBlockModelCollection.ts';
import { isToolResultInputOutputDetails, isToolResultOutputDetails, ToolInvocationPresentation } from '../../../common/languageModelToolsService.ts';
import { ChatTreeItem, IChatCodeBlockInfo } from '../../chat.ts';
import { EditorPool } from '../chatContentCodePools.ts';
import { IChatContentPart, IChatContentPartRenderContext } from '../chatContentParts.ts';
import { CollapsibleListPool } from '../chatReferencesContentPart.ts';
import { ExtensionsInstallConfirmationWidgetSubPart } from './chatExtensionsInstallToolSubPart.ts';
import { ChatInputOutputMarkdownProgressPart } from './chatInputOutputMarkdownProgressPart.ts';
import { ChatResultListSubPart } from './chatResultListSubPart.ts';
import { ChatTerminalToolConfirmationSubPart } from './chatTerminalToolConfirmationSubPart.ts';
import { ChatTerminalToolProgressPart } from './chatTerminalToolProgressPart.ts';
import { ToolConfirmationSubPart } from './chatToolConfirmationSubPart.ts';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.ts';
import { ChatToolOutputSubPart } from './chatToolOutputPart.ts';
import { ChatToolPostExecuteConfirmationPart } from './chatToolPostExecuteConfirmationPart.ts';
import { ChatToolProgressSubPart } from './chatToolProgressPart.ts';

export class ChatToolInvocationPart extends Disposable implements IChatContentPart {
	public readonly domNode: HTMLElement;

	private _onDidChangeHeight = this._register(new Emitter<void>());
	public readonly onDidChangeHeight = this._onDidChangeHeight.event;

	public get codeblocks(): IChatCodeBlockInfo[] {
		return this.subPart?.codeblocks ?? [];
	}

	public get codeblocksPartId(): string | undefined {
		return this.subPart?.codeblocksPartId;
	}

	private subPart!: BaseChatToolInvocationSubPart;

	constructor(
		private readonly toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized,
		private readonly context: IChatContentPartRenderContext,
		private readonly renderer: IMarkdownRenderer,
		private readonly listPool: CollapsibleListPool,
		private readonly editorPool: EditorPool,
		private readonly currentWidthDelegate: () => number,
		private readonly codeBlockModelCollection: CodeBlockModelCollection,
		private readonly announcedToolProgressKeys: Set<string> | undefined,
		private readonly codeBlockStartIndex: number,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();

		this.domNode = dom.$('.chat-tool-invocation-part');
		if (toolInvocation.fromSubAgent) {
			this.domNode.classList.add('from-sub-agent');
		}
		if (toolInvocation.presentation === 'hidden') {
			return;
		}

		if (toolInvocation.kind === 'toolInvocation') {
			const initialState = toolInvocation.state.get().type;
			this._register(autorun(reader => {
				if (toolInvocation.state.read(reader).type !== initialState) {
					render();
				}
			}));
		}

		// This part is a bit different, since IChatToolInvocation is not an immutable model object. So this part is able to rerender itself.
		// If this turns out to be a typical pattern, we could come up with a more reusable pattern, like telling the list to rerender an element
		// when the model changes, or trying to make the model immutable and swap out one content part for a new one based on user actions in the view.
		const partStore = this._register(new DisposableStore());
		const render = () => {
			dom.clearNode(this.domNode);
			partStore.clear();

			if (toolInvocation.presentation === ToolInvocationPresentation.HiddenAfterComplete && IChatToolInvocation.isComplete(toolInvocation)) {
				return;
			}

			this.subPart = partStore.add(this.createToolInvocationSubPart());
			this.domNode.appendChild(this.subPart.domNode);
			partStore.add(this.subPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
			partStore.add(this.subPart.onNeedsRerender(render));

			this._onDidChangeHeight.fire();
		};
		render();
	}

	private createToolInvocationSubPart(): BaseChatToolInvocationSubPart {
		if (this.toolInvocation.kind === 'toolInvocation') {
			if (this.toolInvocation.toolSpecificData?.kind === 'extensions') {
				return this.instantiationService.createInstance(ExtensionsInstallConfirmationWidgetSubPart, this.toolInvocation, this.context);
			}
			const state = this.toolInvocation.state.get();
			if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
				if (this.toolInvocation.toolSpecificData?.kind === 'terminal') {
					return this.instantiationService.createInstance(ChatTerminalToolConfirmationSubPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.codeBlockStartIndex);
				} else {
					return this.instantiationService.createInstance(ToolConfirmationSubPart, this.toolInvocation, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.codeBlockStartIndex);
				}
			}
			if (state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
				return this.instantiationService.createInstance(ChatToolPostExecuteConfirmationPart, this.toolInvocation, this.context);
			}
		}

		if (this.toolInvocation.toolSpecificData?.kind === 'terminal') {
			return this.instantiationService.createInstance(ChatTerminalToolProgressPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockStartIndex, this.codeBlockModelCollection);
		}

		const resultDetails = IChatToolInvocation.resultDetails(this.toolInvocation);
		if (Array.isArray(resultDetails) && resultDetails.length) {
			return this.instantiationService.createInstance(ChatResultListSubPart, this.toolInvocation, this.context, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, resultDetails, this.listPool);
		}

		if (isToolResultOutputDetails(resultDetails)) {
			return this.instantiationService.createInstance(ChatToolOutputSubPart, this.toolInvocation, this.context);
		}

		if (isToolResultInputOutputDetails(resultDetails)) {
			return this.instantiationService.createInstance(
				ChatInputOutputMarkdownProgressPart,
				this.toolInvocation,
				this.context,
				this.codeBlockStartIndex,
				this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage,
				this.toolInvocation.originMessage,
				resultDetails.input,
				resultDetails.output,
				!!resultDetails.isError,
			);
		}

		if (this.toolInvocation.kind === 'toolInvocation' && this.toolInvocation.toolSpecificData?.kind === 'input' && !IChatToolInvocation.isComplete(this.toolInvocation)) {
			return this.instantiationService.createInstance(
				ChatInputOutputMarkdownProgressPart,
				this.toolInvocation,
				this.context,
				this.codeBlockStartIndex,
				this.toolInvocation.invocationMessage,
				this.toolInvocation.originMessage,
				typeof this.toolInvocation.toolSpecificData.rawInput === 'string' ? this.toolInvocation.toolSpecificData.rawInput : JSON.stringify(this.toolInvocation.toolSpecificData.rawInput, null, 2),
				undefined,
				false,
			);
		}

		return this.instantiationService.createInstance(ChatToolProgressSubPart, this.toolInvocation, this.context, this.renderer, this.announcedToolProgressKeys);
	}

	hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean {
		return (other.kind === 'toolInvocation' || other.kind === 'toolInvocationSerialized') && this.toolInvocation.toolCallId === other.toolCallId;
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
