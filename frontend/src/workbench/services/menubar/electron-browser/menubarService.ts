/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMenubarService } from '../../../../platform/menubar/electron-browser/menubar.ts';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.ts';

registerMainProcessRemoteService(IMenubarService, 'menubar');
