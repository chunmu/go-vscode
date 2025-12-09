/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../platform/instantiation/common/extensions.ts';
import { ExtHostTerminalService } from './extHostTerminalService.ts';
import { ExtHostTask } from './extHostTask.ts';
import { ExtHostDebugService } from './extHostDebugService.ts';
import { NativeExtHostSearch } from './extHostSearch.ts';
import { ExtHostExtensionService } from './extHostExtensionService.ts';
import { NodeExtHostTunnelService } from './extHostTunnelService.ts';
import { IExtHostDebugService } from '../common/extHostDebugService.ts';
import { IExtHostExtensionService } from '../common/extHostExtensionService.ts';
import { IExtHostSearch } from '../common/extHostSearch.ts';
import { IExtHostTask } from '../common/extHostTask.ts';
import { IExtHostTerminalService } from '../common/extHostTerminalService.ts';
import { IExtHostTunnelService } from '../common/extHostTunnelService.ts';
import { IExtensionStoragePaths } from '../common/extHostStoragePaths.ts';
import { ExtensionStoragePaths } from './extHostStoragePaths.ts';
import { ExtHostLoggerService } from './extHostLoggerService.ts';
import { ILogService, ILoggerService } from '../../../platform/log/common/log.ts';
import { NodeExtHostVariableResolverProviderService } from './extHostVariableResolverService.ts';
import { IExtHostVariableResolverProvider } from '../common/extHostVariableResolverService.ts';
import { ExtHostLogService } from '../common/extHostLogService.ts';
import { SyncDescriptor } from '../../../platform/instantiation/common/descriptors.ts';
import { ISignService } from '../../../platform/sign/common/sign.ts';
import { SignService } from '../../../platform/sign/node/signService.ts';
import { ExtHostTelemetry, IExtHostTelemetry } from '../common/extHostTelemetry.ts';
import { IExtHostMpcService } from '../common/extHostMcp.ts';
import { NodeExtHostMpcService } from './extHostMcpNode.ts';
import { IExtHostAuthentication } from '../common/extHostAuthentication.ts';
import { NodeExtHostAuthentication } from './extHostAuthentication.ts';

// #########################################################################
// ###                                                                   ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
// ###                                                                   ###
// #########################################################################

registerSingleton(IExtHostExtensionService, ExtHostExtensionService, InstantiationType.Eager);
registerSingleton(ILoggerService, ExtHostLoggerService, InstantiationType.Delayed);
registerSingleton(ILogService, new SyncDescriptor(ExtHostLogService, [false], true));
registerSingleton(ISignService, SignService, InstantiationType.Delayed);
registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths, InstantiationType.Eager);
registerSingleton(IExtHostTelemetry, new SyncDescriptor(ExtHostTelemetry, [false], true));

registerSingleton(IExtHostAuthentication, NodeExtHostAuthentication, InstantiationType.Eager);
registerSingleton(IExtHostDebugService, ExtHostDebugService, InstantiationType.Eager);
registerSingleton(IExtHostSearch, NativeExtHostSearch, InstantiationType.Eager);
registerSingleton(IExtHostTask, ExtHostTask, InstantiationType.Eager);
registerSingleton(IExtHostTerminalService, ExtHostTerminalService, InstantiationType.Eager);
registerSingleton(IExtHostTunnelService, NodeExtHostTunnelService, InstantiationType.Eager);
registerSingleton(IExtHostVariableResolverProvider, NodeExtHostVariableResolverProviderService, InstantiationType.Eager);
registerSingleton(IExtHostMpcService, NodeExtHostMpcService, InstantiationType.Eager);
