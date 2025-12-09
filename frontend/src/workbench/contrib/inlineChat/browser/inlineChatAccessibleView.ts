/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InlineChatController } from './inlineChatController.ts';
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED } from '../common/inlineChat.ts';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.ts';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.ts';
import { AccessibleViewProviderId, AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.ts';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.ts';
import { MarkdownString } from '../../../../base/common/htmlContent.ts';
import { renderAsPlaintext } from '../../../../base/browser/markdownRenderer.ts';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.ts';

export class InlineChatAccessibleView implements IAccessibleViewImplementation {
	readonly priority = 100;
	readonly name = 'inlineChat';
	readonly when = ContextKeyExpr.or(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED);
	readonly type = AccessibleViewType.View;
	getProvider(accessor: ServicesAccessor) {
		const codeEditorService = accessor.get(ICodeEditorService);

		const editor = (codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor());
		if (!editor) {
			return;
		}
		const controller = InlineChatController.get(editor);
		if (!controller) {
			return;
		}
		const responseContent = controller.widget.responseContent;
		if (!responseContent) {
			return;
		}
		return new AccessibleContentProvider(
			AccessibleViewProviderId.InlineChat,
			{ type: AccessibleViewType.View },
			() => renderAsPlaintext(new MarkdownString(responseContent), { includeCodeBlocksFences: true }),
			() => controller.focus(),
			AccessibilityVerbositySettingId.InlineChat
		);
	}
}
