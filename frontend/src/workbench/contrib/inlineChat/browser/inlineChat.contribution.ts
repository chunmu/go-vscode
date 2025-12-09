/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorContributionInstantiation, registerEditorContribution } from '../../../../editor/browser/editorExtensions.ts';
import { IMenuItem, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.ts';
import { InlineChatController, InlineChatController1, InlineChatController2 } from './inlineChatController.ts';
import * as InlineChatActions from './inlineChatActions.ts';
import { CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_V1_ENABLED, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, INLINE_CHAT_ID, MENU_INLINE_CHAT_WIDGET_STATUS } from '../common/inlineChat.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { InlineChatNotebookContribution } from './inlineChatNotebook.ts';
import { IWorkbenchContributionsRegistry, registerWorkbenchContribution2, Extensions as WorkbenchExtensions, WorkbenchPhase } from '../../../common/contributions.ts';
import { InlineChatAccessibleView } from './inlineChatAccessibleView.ts';
import { IInlineChatSessionService } from './inlineChatSessionService.ts';
import { InlineChatEnabler, InlineChatEscapeToolContribution, InlineChatSessionServiceImpl } from './inlineChatSessionServiceImpl.ts';
import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.ts';
import { CancelAction, ChatSubmitAction } from '../../chat/browser/actions/chatExecuteActions.ts';
import { localize } from '../../../../nls.ts';
import { ChatContextKeys } from '../../chat/common/chatContextKeys.ts';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.ts';
import { InlineChatAccessibilityHelp } from './inlineChatAccessibilityHelp.ts';

registerEditorContribution(InlineChatController2.ID, InlineChatController2, EditorContributionInstantiation.Eager); // EAGER because of notebook dispose/create of editors
registerEditorContribution(INLINE_CHAT_ID, InlineChatController1, EditorContributionInstantiation.Eager); // EAGER because of notebook dispose/create of editors
registerEditorContribution(InlineChatController.ID, InlineChatController, EditorContributionInstantiation.Eager); // EAGER because of notebook dispose/create of editors

registerAction2(InlineChatActions.KeepSessionAction2);
registerAction2(InlineChatActions.UndoAndCloseSessionAction2);

// --- browser

registerSingleton(IInlineChatSessionService, InlineChatSessionServiceImpl, InstantiationType.Delayed);

// --- MENU special ---

const editActionMenuItem: IMenuItem = {
	group: '0_main',
	order: 0,
	command: {
		id: ChatSubmitAction.ID,
		title: localize('send.edit', "Edit Code"),
	},
	when: ContextKeyExpr.and(
		ChatContextKeys.inputHasText,
		CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(),
		CTX_INLINE_CHAT_EDITING,
		CTX_INLINE_CHAT_V1_ENABLED
	),
};

const generateActionMenuItem: IMenuItem = {
	group: '0_main',
	order: 0,
	command: {
		id: ChatSubmitAction.ID,
		title: localize('send.generate', "Generate"),
	},
	when: ContextKeyExpr.and(
		ChatContextKeys.inputHasText,
		CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(),
		CTX_INLINE_CHAT_EDITING.toNegated(),
		CTX_INLINE_CHAT_V1_ENABLED
	),
};

MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, editActionMenuItem);
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, generateActionMenuItem);

const cancelActionMenuItem: IMenuItem = {
	group: '0_main',
	order: 0,
	command: {
		id: CancelAction.ID,
		title: localize('cancel', "Cancel Request"),
		shortTitle: localize('cancelShort', "Cancel"),
	},
	when: ContextKeyExpr.and(
		CTX_INLINE_CHAT_REQUEST_IN_PROGRESS,
	),
};

MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, cancelActionMenuItem);

// --- actions ---

registerAction2(InlineChatActions.StartSessionAction);
registerAction2(InlineChatActions.CloseAction);
registerAction2(InlineChatActions.ConfigureInlineChatAction);
registerAction2(InlineChatActions.UnstashSessionAction);
registerAction2(InlineChatActions.DiscardHunkAction);
registerAction2(InlineChatActions.RerunAction);
registerAction2(InlineChatActions.MoveToNextHunk);
registerAction2(InlineChatActions.MoveToPreviousHunk);

registerAction2(InlineChatActions.ArrowOutUpAction);
registerAction2(InlineChatActions.ArrowOutDownAction);
registerAction2(InlineChatActions.FocusInlineChat);
registerAction2(InlineChatActions.ViewInChatAction);

registerAction2(InlineChatActions.ToggleDiffForChange);
registerAction2(InlineChatActions.AcceptChanges);

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(InlineChatNotebookContribution, LifecyclePhase.Restored);

registerWorkbenchContribution2(InlineChatEnabler.Id, InlineChatEnabler, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(InlineChatEscapeToolContribution.Id, InlineChatEscapeToolContribution, WorkbenchPhase.AfterRestored);
AccessibleViewRegistry.register(new InlineChatAccessibleView());
AccessibleViewRegistry.register(new InlineChatAccessibilityHelp());
