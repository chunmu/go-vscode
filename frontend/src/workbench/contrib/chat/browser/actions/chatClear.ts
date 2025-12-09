/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Schemas } from '../../../../../base/common/network.ts';
import { generateUuid } from '../../../../../base/common/uuid.ts';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.ts';
import { IEditorService } from '../../../../services/editor/common/editorService.ts';
import { IChatEditorOptions } from '../chatEditor.ts';
import { ChatEditorInput } from '../chatEditorInput.ts';

export async function clearChatEditor(accessor: ServicesAccessor, chatEditorInput?: ChatEditorInput): Promise<void> {
	const editorService = accessor.get(IEditorService);

	if (!chatEditorInput) {
		const editorInput = editorService.activeEditor;
		chatEditorInput = editorInput instanceof ChatEditorInput ? editorInput : undefined;
	}

	if (chatEditorInput instanceof ChatEditorInput) {
		// If we have a contributed session, make sure we create an untitled session for it.
		// Otherwise create a generic new chat editor.
		const resource = chatEditorInput.sessionResource && chatEditorInput.sessionResource.scheme !== Schemas.vscodeLocalChatSession
			? chatEditorInput.sessionResource.with({ path: `/untitled-${generateUuid()}` })
			: ChatEditorInput.getNewEditorUri();

		// A chat editor can only be open in one group
		const identifier = editorService.findEditors(chatEditorInput.resource)[0];
		await editorService.replaceEditors([{
			editor: chatEditorInput,
			replacement: { resource, options: { pinned: true } satisfies IChatEditorOptions }
		}], identifier.groupId);
	}
}
