/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerAttachPromptActions } from './attachInstructionsAction.ts';
import { registerAgentActions } from './chatModeActions.ts';
import { registerRunPromptActions } from './runPromptAction.ts';
import { registerNewPromptFileActions } from './newPromptFileActions.ts';
import { registerAction2 } from '../../../../../platform/actions/common/actions.ts';
import { SaveAsAgentFileAction, SaveAsInstructionsFileAction, SaveAsPromptFileAction } from './saveAsPromptFileActions.ts';


/**
 * Helper to register all actions related to reusable prompt files.
 */
export function registerPromptActions(): void {
	registerRunPromptActions();
	registerAttachPromptActions();
	registerAction2(SaveAsPromptFileAction);
	registerAction2(SaveAsInstructionsFileAction);
	registerAction2(SaveAsAgentFileAction);
	registerAgentActions();
	registerNewPromptFileActions();
}
