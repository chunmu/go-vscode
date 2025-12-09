/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDiagnosticsService } from '../common/diagnostics.ts';
import { registerSharedProcessRemoteService } from '../../ipc/electron-browser/services.ts';

registerSharedProcessRemoteService(IDiagnosticsService, 'diagnostics');
