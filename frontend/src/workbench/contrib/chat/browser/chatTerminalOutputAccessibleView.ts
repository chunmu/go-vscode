/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AccessibleContentProvider, AccessibleViewProviderId, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.ts';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.ts';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.ts';
import { ChatContextKeys } from '../common/chatContextKeys.ts';
import { ITerminalChatService } from '../../terminal/browser/terminal.ts';

export class ChatTerminalOutputAccessibleView implements IAccessibleViewImplementation {
	readonly priority = 115;
	readonly name = 'chatTerminalOutput';
	readonly type = AccessibleViewType.View;
	readonly when = ChatContextKeys.inChatTerminalToolOutput;

	getProvider(accessor: ServicesAccessor) {
		const terminalChatService = accessor.get(ITerminalChatService);
		const part = terminalChatService.getFocusedProgressPart();
		if (!part) {
			return;
		}

		const content = part.getCommandAndOutputAsText();
		if (!content) {
			return;
		}

		return new AccessibleContentProvider(
			AccessibleViewProviderId.ChatTerminalOutput,
			{ type: AccessibleViewType.View, id: AccessibleViewProviderId.ChatTerminalOutput, language: 'text' },
			() => content,
			() => part.focusOutput(),
			AccessibilityVerbositySettingId.TerminalChatOutput
		);
	}
}
