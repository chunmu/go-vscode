/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SyncDescriptor } from '../../../platform/instantiation/common/descriptors.ts';
import { InstantiationType, registerSingleton } from '../../../platform/instantiation/common/extensions.ts';
import { ILogService } from '../../../platform/log/common/log.ts';
import { ExtHostAuthentication, IExtHostAuthentication } from '../common/extHostAuthentication.ts';
import { IExtHostExtensionService } from '../common/extHostExtensionService.ts';
import { ExtHostLogService } from '../common/extHostLogService.ts';
import { ExtensionStoragePaths, IExtensionStoragePaths } from '../common/extHostStoragePaths.ts';
import { ExtHostTelemetry, IExtHostTelemetry } from '../common/extHostTelemetry.ts';
import { ExtHostExtensionService } from './extHostExtensionService.ts';

// #########################################################################
// ###                                                                   ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
// ###                                                                   ###
// #########################################################################

registerSingleton(ILogService, new SyncDescriptor(ExtHostLogService, [true], true));
registerSingleton(IExtHostAuthentication, ExtHostAuthentication, InstantiationType.Eager);
registerSingleton(IExtHostExtensionService, ExtHostExtensionService, InstantiationType.Eager);
registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths, InstantiationType.Eager);
registerSingleton(IExtHostTelemetry, new SyncDescriptor(ExtHostTelemetry, [true], true));
