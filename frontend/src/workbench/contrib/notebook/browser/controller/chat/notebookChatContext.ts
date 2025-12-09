/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../../nls.ts';
import { RawContextKey } from '../../../../../../platform/contextkey/common/contextkey.ts';

export const CTX_NOTEBOOK_CHAT_HAS_AGENT = new RawContextKey<boolean>('notebookChatAgentRegistered', false, localize('notebookChatAgentRegistered', "Whether a chat agent for notebook is registered"));
