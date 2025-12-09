/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../../base/browser/dom.ts';
import { Button, IButtonOptions } from '../../../../../base/browser/ui/button/button.ts';
import { Emitter } from '../../../../../base/common/event.ts';
import { IMarkdownString } from '../../../../../base/common/htmlContent.ts';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.ts';
import { IMarkdownRenderer } from '../../../../../platform/markdown/browser/markdownRenderer.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.ts';
import { ChatErrorLevel, IChatResponseErrorDetailsConfirmationButton, IChatSendRequestOptions, IChatService } from '../../common/chatService.ts';
import { assertIsResponseVM, IChatErrorDetailsPart, IChatRendererContent } from '../../common/chatViewModel.ts';
import { IChatWidgetService } from '../chat.ts';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.ts';
import { ChatErrorWidget } from './chatErrorContentPart.ts';

const $ = dom.$;

export class ChatErrorConfirmationContentPart extends Disposable implements IChatContentPart {
	public readonly domNode: HTMLElement;

	private readonly _onDidChangeHeight = this._register(new Emitter<void>());
	public readonly onDidChangeHeight = this._onDidChangeHeight.event;

	constructor(
		kind: ChatErrorLevel,
		content: IMarkdownString,
		private readonly errorDetails: IChatErrorDetailsPart,
		confirmationButtons: IChatResponseErrorDetailsConfirmationButton[],
		renderer: IMarkdownRenderer,
		context: IChatContentPartRenderContext,
		@IInstantiationService instantiationService: IInstantiationService,
		@IChatWidgetService chatWidgetService: IChatWidgetService,
		@IChatService chatService: IChatService,
	) {
		super();

		const element = context.element;
		assertIsResponseVM(element);

		this.domNode = $('.chat-error-confirmation');
		this.domNode.append(this._register(new ChatErrorWidget(kind, content, renderer)).domNode);

		const buttonOptions: IButtonOptions = { ...defaultButtonStyles };

		const buttonContainer = dom.append(this.domNode, $('.chat-buttons-container'));
		confirmationButtons.forEach(buttonData => {
			const button = this._register(new Button(buttonContainer, buttonOptions));
			button.label = buttonData.label;

			this._register(button.onDidClick(async () => {
				const prompt = buttonData.label;
				const options: IChatSendRequestOptions = buttonData.isSecondary ?
					{ rejectedConfirmationData: [buttonData.data] } :
					{ acceptedConfirmationData: [buttonData.data] };
				options.agentId = element.agent?.id;
				options.slashCommand = element.slashCommand?.name;
				options.confirmation = buttonData.label;
				const widget = chatWidgetService.getWidgetBySessionResource(element.sessionResource);
				options.userSelectedModelId = widget?.input.currentLanguageModel;
				Object.assign(options, widget?.getModeRequestOptions());
				if (await chatService.sendRequest(element.sessionResource, prompt, options)) {
					this._onDidChangeHeight.fire();
				}
			}));
		});
	}

	hasSameContent(other: IChatRendererContent): boolean {
		return other.kind === this.errorDetails.kind && other.isLast === this.errorDetails.isLast;
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
