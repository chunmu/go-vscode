/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContributionsRegistry, WorkbenchPhase, Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { ShowCandidateContribution } from './showCandidate.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { TunnelFactoryContribution } from './tunnelFactory.ts';
import { RemoteAgentConnectionStatusListener, RemoteMarkers } from './remote.ts';
import { RemoteStatusIndicator } from './remoteIndicator.ts';
import { AutomaticPortForwarding, ForwardedPortsView, PortRestore } from './remoteExplorer.ts';
import { InitialRemoteConnectionHealthContribution } from './remoteConnectionHealth.ts';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(ShowCandidateContribution.ID, ShowCandidateContribution, WorkbenchPhase.BlockRestore);
registerWorkbenchContribution2(TunnelFactoryContribution.ID, TunnelFactoryContribution, WorkbenchPhase.BlockRestore);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentConnectionStatusListener, LifecyclePhase.Eventually);
registerWorkbenchContribution2(RemoteStatusIndicator.ID, RemoteStatusIndicator, WorkbenchPhase.BlockStartup);
workbenchContributionsRegistry.registerWorkbenchContribution(ForwardedPortsView, LifecyclePhase.Restored);
workbenchContributionsRegistry.registerWorkbenchContribution(PortRestore, LifecyclePhase.Eventually);
workbenchContributionsRegistry.registerWorkbenchContribution(AutomaticPortForwarding, LifecyclePhase.Eventually);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteMarkers, LifecyclePhase.Eventually);
workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, LifecyclePhase.Restored);
