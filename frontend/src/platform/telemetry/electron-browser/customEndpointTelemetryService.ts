/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSharedProcessRemoteService } from '../../ipc/electron-browser/services.ts';
import { ICustomEndpointTelemetryService } from '../common/telemetry.ts';

registerSharedProcessRemoteService(ICustomEndpointTelemetryService, 'customEndpointTelemetry');
