/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.ts';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.ts';
import { ExtensionHostDebugChannelClient, ExtensionHostDebugBroadcastChannel } from '../../../../platform/debug/common/extensionHostDebugIpc.ts';

registerMainProcessRemoteService(IExtensionHostDebugService, ExtensionHostDebugBroadcastChannel.ChannelName, { channelClientCtor: ExtensionHostDebugChannelClient });
