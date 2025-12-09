/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../../base/common/codicons.ts';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.ts';
import { localize2 } from '../../../../../nls.ts';
import { Categories } from '../../../../../platform/action/common/actionCommonCategories.ts';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.ts';
import { ChatContextKeys } from '../../common/chatContextKeys.ts';
import { IChatService } from '../../common/chatService.ts';
import { IChatWidgetService } from '../chat.ts';

export function registerChatDeveloperActions() {
	registerAction2(LogChatInputHistoryAction);
	registerAction2(LogChatIndexAction);
}

class LogChatInputHistoryAction extends Action2 {
	static readonly ID = 'workbench.action.chat.logInputHistory';

	constructor() {
		super({
			id: LogChatInputHistoryAction.ID,
			title: localize2('workbench.action.chat.logInputHistory.label', "Log Chat Input History"),
			icon: Codicon.attach,
			category: Categories.Developer,
			f1: true,
			precondition: ChatContextKeys.enabled
		});
	}

	override async run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void> {
		const chatWidgetService = accessor.get(IChatWidgetService);
		chatWidgetService.lastFocusedWidget?.logInputHistory();
	}
}

class LogChatIndexAction extends Action2 {
	static readonly ID = 'workbench.action.chat.logChatIndex';

	constructor() {
		super({
			id: LogChatIndexAction.ID,
			title: localize2('workbench.action.chat.logChatIndex.label', "Log Chat Index"),
			icon: Codicon.attach,
			category: Categories.Developer,
			f1: true,
			precondition: ChatContextKeys.enabled
		});
	}

	override async run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void> {
		const chatService = accessor.get(IChatService);
		chatService.logChatIndex();
	}
}
