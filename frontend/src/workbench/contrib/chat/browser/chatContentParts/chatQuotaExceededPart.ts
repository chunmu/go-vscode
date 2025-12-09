/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../../base/browser/dom.ts';
import { Button } from '../../../../../base/browser/ui/button/button.ts';
import { WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from '../../../../../base/common/actions.ts';
import { Codicon } from '../../../../../base/common/codicons.ts';
import { Emitter } from '../../../../../base/common/event.ts';
import { MarkdownString } from '../../../../../base/common/htmlContent.ts';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.ts';
import { ThemeIcon } from '../../../../../base/common/themables.ts';
import { assertType } from '../../../../../base/common/types.ts';
import { IMarkdownRenderer } from '../../../../../platform/markdown/browser/markdownRenderer.ts';
import { localize } from '../../../../../nls.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.ts';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.ts';
import { asCssVariable, textLinkForeground } from '../../../../../platform/theme/common/colorRegistry.ts';
import { ChatEntitlement, IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.ts';
import { IChatErrorDetailsPart, IChatRendererContent, IChatResponseViewModel } from '../../common/chatViewModel.ts';
import { IChatWidgetService } from '../chat.ts';
import { IChatContentPart } from './chatContentParts.ts';

const $ = dom.$;

/**
 * Once the sign up button is clicked, and the retry
 * button has been shown, it should be shown every time.
 */
let shouldShowRetryButton = false;

/**
 * Once the 'retry' button is clicked, the wait warning
 * should be shown every time.
 */
let shouldShowWaitWarning = false;

export class ChatQuotaExceededPart extends Disposable implements IChatContentPart {

	readonly domNode: HTMLElement;

	private readonly _onDidChangeHeight = this._register(new Emitter<void>());
	readonly onDidChangeHeight = this._onDidChangeHeight.event;

	constructor(
		element: IChatResponseViewModel,
		private readonly content: IChatErrorDetailsPart,
		renderer: IMarkdownRenderer,
		@IChatWidgetService chatWidgetService: IChatWidgetService,
		@ICommandService commandService: ICommandService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IChatEntitlementService chatEntitlementService: IChatEntitlementService
	) {
		super();

		const errorDetails = element.errorDetails;
		assertType(!!errorDetails, 'errorDetails');

		this.domNode = $('.chat-quota-error-widget');
		const icon = dom.append(this.domNode, $('span'));
		icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));

		const messageContainer = dom.append(this.domNode, $('.chat-quota-error-message'));
		const markdownContent = this._register(renderer.render(new MarkdownString(errorDetails.message)));
		dom.append(messageContainer, markdownContent.element);

		let primaryButtonLabel: string | undefined;
		switch (chatEntitlementService.entitlement) {
			case ChatEntitlement.Pro:
			case ChatEntitlement.ProPlus:
				primaryButtonLabel = localize('enableAdditionalUsage', "Manage Paid Premium Requests");
				break;
			case ChatEntitlement.Free:
				primaryButtonLabel = localize('upgradeToCopilotPro', "Upgrade to GitHub Copilot Pro");
				break;
		}

		let hasAddedWaitWarning = false;
		const addWaitWarningIfNeeded = () => {
			if (!shouldShowWaitWarning || hasAddedWaitWarning) {
				return;
			}

			hasAddedWaitWarning = true;
			dom.append(messageContainer, $('.chat-quota-wait-warning', undefined, localize('waitWarning', "Changes may take a few minutes to take effect.")));
		};

		let hasAddedRetryButton = false;
		const addRetryButtonIfNeeded = () => {
			if (!shouldShowRetryButton || hasAddedRetryButton) {
				return;
			}

			hasAddedRetryButton = true;
			const retryButton = this._register(new Button(messageContainer, {
				buttonBackground: undefined,
				buttonForeground: asCssVariable(textLinkForeground)
			}));
			retryButton.element.classList.add('chat-quota-error-secondary-button');
			retryButton.label = localize('clickToContinue', "Click to Retry");

			this._onDidChangeHeight.fire();

			this._register(retryButton.onDidClick(() => {
				const widget = chatWidgetService.getWidgetBySessionResource(element.sessionResource);
				if (!widget) {
					return;
				}

				widget.rerunLastRequest();

				shouldShowWaitWarning = true;
				addWaitWarningIfNeeded();
			}));
		};

		if (primaryButtonLabel) {
			const primaryButton = this._register(new Button(messageContainer, { ...defaultButtonStyles, supportIcons: true }));
			primaryButton.label = primaryButtonLabel;
			primaryButton.element.classList.add('chat-quota-error-button');

			this._register(primaryButton.onDidClick(async () => {
				const commandId = chatEntitlementService.entitlement === ChatEntitlement.Free ? 'workbench.action.chat.upgradePlan' : 'workbench.action.chat.manageOverages';
				telemetryService.publicLog2<WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification>('workbenchActionExecuted', { id: commandId, from: 'chat-response' });
				await commandService.executeCommand(commandId);

				shouldShowRetryButton = true;
				addRetryButtonIfNeeded();
			}));
		}

		addRetryButtonIfNeeded();
		addWaitWarningIfNeeded();
	}

	hasSameContent(other: IChatRendererContent): boolean {
		return other.kind === this.content.kind && !!other.errorDetails.isQuotaExceeded;
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
