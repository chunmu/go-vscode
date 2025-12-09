/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.ts';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { RemoteStartEntry } from './remoteStartEntry.ts';

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(RemoteStartEntry, LifecyclePhase.Restored);
