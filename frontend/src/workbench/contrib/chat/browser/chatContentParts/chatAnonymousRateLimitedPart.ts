/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, append } from '../../../../../base/browser/dom.ts';
import { Button } from '../../../../../base/browser/ui/button/button.ts';
import { WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from '../../../../../base/common/actions.ts';
import { Codicon } from '../../../../../base/common/codicons.ts';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.ts';
import { ThemeIcon } from '../../../../../base/common/themables.ts';
import { localize } from '../../../../../nls.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.ts';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.ts';
import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.ts';
import { IChatErrorDetailsPart, IChatRendererContent } from '../../common/chatViewModel.ts';
import { IChatContentPart } from './chatContentParts.ts';

export class ChatAnonymousRateLimitedPart extends Disposable implements IChatContentPart {

	readonly domNode: HTMLElement;

	constructor(
		private readonly content: IChatErrorDetailsPart,
		@ICommandService commandService: ICommandService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IChatEntitlementService chatEntitlementService: IChatEntitlementService
	) {
		super();

		this.domNode = $('.chat-rate-limited-widget');

		const icon = append(this.domNode, $('span'));
		icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));

		const messageContainer = append(this.domNode, $('.chat-rate-limited-message'));

		const message = append(messageContainer, $('div'));
		message.textContent = localize('anonymousRateLimited', "Continue the conversation by signing in. Your free account gets 50 premium requests a month plus access to more models and AI features.");

		const signInButton = this._register(new Button(messageContainer, { ...defaultButtonStyles, supportIcons: true }));
		signInButton.label = localize('enableMoreAIFeatures', "Enable more AI features");
		signInButton.element.classList.add('chat-rate-limited-button');

		this._register(signInButton.onDidClick(async () => {
			const commandId = 'workbench.action.chat.triggerSetup';
			telemetryService.publicLog2<WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification>('workbenchActionExecuted', { id: commandId, from: 'chat-response' });

			await commandService.executeCommand(commandId);
		}));
	}

	hasSameContent(other: IChatRendererContent): boolean {
		return other.kind === this.content.kind && !!other.errorDetails.isRateLimited;
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
