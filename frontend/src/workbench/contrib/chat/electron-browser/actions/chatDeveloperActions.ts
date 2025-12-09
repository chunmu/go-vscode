/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from '../../../../../base/common/codicons.ts';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.ts';
import { localize2 } from '../../../../../nls.ts';
import { Categories } from '../../../../../platform/action/common/actionCommonCategories.ts';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.ts';
import { INativeHostService } from '../../../../../platform/native/common/native.ts';
import { ChatContextKeys } from '../../common/chatContextKeys.ts';
import { IChatService } from '../../common/chatService.ts';

export function registerChatDeveloperActions() {
	registerAction2(OpenChatStorageFolderAction);
}

class OpenChatStorageFolderAction extends Action2 {
	static readonly ID = 'workbench.action.chat.openStorageFolder';

	constructor() {
		super({
			id: OpenChatStorageFolderAction.ID,
			title: localize2('workbench.action.chat.openStorageFolder.label', "Open Chat Storage Folder"),
			icon: Codicon.attach,
			category: Categories.Developer,
			f1: true,
			precondition: ChatContextKeys.enabled
		});
	}

	override async run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void> {
		const chatService = accessor.get(IChatService);
		const nativeHostService = accessor.get(INativeHostService);
		const storagePath = chatService.getChatStorageFolder();
		nativeHostService.showItemInFolder(storagePath.fsPath);
	}
}
