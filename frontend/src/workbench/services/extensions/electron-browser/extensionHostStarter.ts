/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.ts';
import { IExtensionHostStarter, ipcExtensionHostStarterChannelName } from '../../../../platform/extensions/common/extensionHostStarter.ts';

registerMainProcessRemoteService(IExtensionHostStarter, ipcExtensionHostStarterChannelName);
