/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../platform/instantiation/common/extensions.ts';
import { IExtHostOutputService, ExtHostOutputService } from './extHostOutput.ts';
import { IExtHostWorkspace, ExtHostWorkspace } from './extHostWorkspace.ts';
import { IExtHostDecorations, ExtHostDecorations } from './extHostDecorations.ts';
import { IExtHostConfiguration, ExtHostConfiguration } from './extHostConfiguration.ts';
import { IExtHostCommands, ExtHostCommands } from './extHostCommands.ts';
import { IExtHostDocumentsAndEditors, ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.ts';
import { IExtHostTerminalService, WorkerExtHostTerminalService } from './extHostTerminalService.ts';
import { IExtHostTask, WorkerExtHostTask } from './extHostTask.ts';
import { IExtHostDebugService, WorkerExtHostDebugService } from './extHostDebugService.ts';
import { IExtHostSearch, ExtHostSearch } from './extHostSearch.ts';
import { IExtHostStorage, ExtHostStorage } from './extHostStorage.ts';
import { IExtHostTunnelService, ExtHostTunnelService } from './extHostTunnelService.ts';
import { IExtHostApiDeprecationService, ExtHostApiDeprecationService, } from './extHostApiDeprecationService.ts';
import { IExtHostWindow, ExtHostWindow } from './extHostWindow.ts';
import { IExtHostConsumerFileSystem, ExtHostConsumerFileSystem } from './extHostFileSystemConsumer.ts';
import { IExtHostFileSystemInfo, ExtHostFileSystemInfo } from './extHostFileSystemInfo.ts';
import { IExtHostSecretState, ExtHostSecretState } from './extHostSecretState.ts';
import { ExtHostEditorTabs, IExtHostEditorTabs } from './extHostEditorTabs.ts';
import { ExtHostLoggerService } from './extHostLoggerService.ts';
import { ILoggerService } from '../../../platform/log/common/log.ts';
import { ExtHostVariableResolverProviderService, IExtHostVariableResolverProvider } from './extHostVariableResolverService.ts';
import { ExtHostLocalizationService, IExtHostLocalizationService } from './extHostLocalizationService.ts';
import { ExtHostManagedSockets, IExtHostManagedSockets } from './extHostManagedSockets.ts';
import { ExtHostLanguageModels, IExtHostLanguageModels } from './extHostLanguageModels.ts';
import { IExtHostTerminalShellIntegration, ExtHostTerminalShellIntegration } from './extHostTerminalShellIntegration.ts';
import { ExtHostTesting, IExtHostTesting } from './extHostTesting.ts';
import { ExtHostMcpService, IExtHostMpcService } from './extHostMcp.ts';
import { ExtHostUrls, IExtHostUrlsService } from './extHostUrls.ts';
import { ExtHostProgress, IExtHostProgress } from './extHostProgress.ts';
import { ExtHostDataChannels, IExtHostDataChannels } from './extHostDataChannels.ts';

registerSingleton(IExtHostLocalizationService, ExtHostLocalizationService, InstantiationType.Delayed);
registerSingleton(ILoggerService, ExtHostLoggerService, InstantiationType.Delayed);
registerSingleton(IExtHostApiDeprecationService, ExtHostApiDeprecationService, InstantiationType.Delayed);
registerSingleton(IExtHostCommands, ExtHostCommands, InstantiationType.Eager);
registerSingleton(IExtHostProgress, ExtHostProgress, InstantiationType.Eager);
registerSingleton(IExtHostLanguageModels, ExtHostLanguageModels, InstantiationType.Eager);
registerSingleton(IExtHostConfiguration, ExtHostConfiguration, InstantiationType.Eager);
registerSingleton(IExtHostConsumerFileSystem, ExtHostConsumerFileSystem, InstantiationType.Eager);
registerSingleton(IExtHostTesting, ExtHostTesting, InstantiationType.Eager);
registerSingleton(IExtHostDebugService, WorkerExtHostDebugService, InstantiationType.Eager);
registerSingleton(IExtHostDecorations, ExtHostDecorations, InstantiationType.Eager);
registerSingleton(IExtHostDocumentsAndEditors, ExtHostDocumentsAndEditors, InstantiationType.Eager);
registerSingleton(IExtHostManagedSockets, ExtHostManagedSockets, InstantiationType.Eager);
registerSingleton(IExtHostFileSystemInfo, ExtHostFileSystemInfo, InstantiationType.Eager);
registerSingleton(IExtHostOutputService, ExtHostOutputService, InstantiationType.Delayed);
registerSingleton(IExtHostSearch, ExtHostSearch, InstantiationType.Eager);
registerSingleton(IExtHostStorage, ExtHostStorage, InstantiationType.Eager);
registerSingleton(IExtHostTask, WorkerExtHostTask, InstantiationType.Eager);
registerSingleton(IExtHostTerminalService, WorkerExtHostTerminalService, InstantiationType.Eager);
registerSingleton(IExtHostTerminalShellIntegration, ExtHostTerminalShellIntegration, InstantiationType.Eager);
registerSingleton(IExtHostTunnelService, ExtHostTunnelService, InstantiationType.Eager);
registerSingleton(IExtHostWindow, ExtHostWindow, InstantiationType.Eager);
registerSingleton(IExtHostUrlsService, ExtHostUrls, InstantiationType.Eager);
registerSingleton(IExtHostWorkspace, ExtHostWorkspace, InstantiationType.Eager);
registerSingleton(IExtHostSecretState, ExtHostSecretState, InstantiationType.Eager);
registerSingleton(IExtHostEditorTabs, ExtHostEditorTabs, InstantiationType.Eager);
registerSingleton(IExtHostVariableResolverProvider, ExtHostVariableResolverProviderService, InstantiationType.Eager);
registerSingleton(IExtHostMpcService, ExtHostMcpService, InstantiationType.Eager);
registerSingleton(IExtHostDataChannels, ExtHostDataChannels, InstantiationType.Eager);
