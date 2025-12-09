/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { alert } from '../../../../../base/browser/ui/aria/aria.ts';
import { localize } from '../../../../../nls.ts';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.ts';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.ts';
import { KeybindingWeight } from '../../../../../platform/keybinding/common/keybindingsRegistry.ts';
import { KeyCode, KeyMod } from '../../../../../base/common/keyCodes.ts';
import { IChatWidgetService } from '../chat.ts';
import { ChatContextKeys } from '../../common/chatContextKeys.ts';
import { isResponseVM } from '../../common/chatViewModel.ts';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../../platform/accessibility/common/accessibility.ts';

export const ACTION_ID_FOCUS_CHAT_CONFIRMATION = 'workbench.action.chat.focusConfirmation';

class AnnounceChatConfirmationAction extends Action2 {
	constructor() {
		super({
			id: ACTION_ID_FOCUS_CHAT_CONFIRMATION,
			title: { value: localize('focusChatConfirmation', 'Focus Chat Confirmation'), original: 'Focus Chat Confirmation' },
			category: { value: localize('chat.category', 'Chat'), original: 'Chat' },
			precondition: ChatContextKeys.enabled,
			f1: true,
			keybinding: {
				weight: KeybindingWeight.WorkbenchContrib,
				primary: KeyMod.CtrlCmd | KeyCode.KeyA | KeyMod.Shift,
				when: CONTEXT_ACCESSIBILITY_MODE_ENABLED
			}
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const chatWidgetService = accessor.get(IChatWidgetService);
		const pendingWidget = chatWidgetService.getAllWidgets().find(widget => widget.viewModel?.model.requestNeedsInput.get());

		if (!pendingWidget) {
			alert(localize('noChatSession', 'No active chat session found.'));
			return;
		}

		const viewModel = pendingWidget.viewModel;
		if (!viewModel) {
			alert(localize('chatNotReady', 'Chat interface not ready.'));
			return;
		}

		// Check for active confirmations in the chat responses
		let firstConfirmationElement: HTMLElement | undefined;

		const lastResponse = viewModel.getItems()[viewModel.getItems().length - 1];
		if (isResponseVM(lastResponse)) {
			// eslint-disable-next-line no-restricted-syntax
			const confirmationWidgets = pendingWidget.domNode.querySelectorAll('.chat-confirmation-widget-container');
			if (confirmationWidgets.length > 0) {
				firstConfirmationElement = confirmationWidgets[0] as HTMLElement;
			}
		}

		if (firstConfirmationElement) {
			firstConfirmationElement.focus();
		} else {
			alert(localize('noConfirmationRequired', 'No chat confirmation required'));
		}
	}
}

export function registerChatAccessibilityActions(): void {
	registerAction2(AnnounceChatConfirmationAction);
}
