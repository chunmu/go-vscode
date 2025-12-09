/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { Extensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.ts';
import { BrowserResourcePerformanceMarks, BrowserStartupTimings } from './startupTimings.ts';

// -- startup timings

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	BrowserResourcePerformanceMarks,
	LifecyclePhase.Eventually
);

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	BrowserStartupTimings,
	LifecyclePhase.Eventually
);
