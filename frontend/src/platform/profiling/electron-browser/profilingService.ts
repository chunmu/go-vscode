/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSharedProcessRemoteService } from '../../ipc/electron-browser/services.ts';
import { IV8InspectProfilingService } from '../common/profiling.ts';

registerSharedProcessRemoteService(IV8InspectProfilingService, 'v8InspectProfiling');
