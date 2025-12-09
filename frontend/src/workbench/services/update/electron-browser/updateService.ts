/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IUpdateService } from '../../../../platform/update/common/update.ts';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.ts';
import { UpdateChannelClient } from '../../../../platform/update/common/updateIpc.ts';

registerMainProcessRemoteService(IUpdateService, 'update', { channelClientCtor: UpdateChannelClient });
