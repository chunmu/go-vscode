/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { Extensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.ts';
import { StartupProfiler } from './startupProfiler.ts';
import { NativeStartupTimings } from './startupTimings.ts';
import { RendererProfiling } from './rendererAutoProfiler.ts';
import { IConfigurationRegistry, Extensions as ConfigExt } from '../../../../platform/configuration/common/configurationRegistry.ts';
import { localize } from '../../../../nls.ts';
import { applicationConfigurationNodeBase } from '../../../common/configuration.ts';

// -- auto profiler

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	RendererProfiling,
	LifecyclePhase.Eventually
);

// -- startup profiler

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	StartupProfiler,
	LifecyclePhase.Restored
);

// -- startup timings

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	NativeStartupTimings,
	LifecyclePhase.Eventually
);

Registry.as<IConfigurationRegistry>(ConfigExt.Configuration).registerConfiguration({
	...applicationConfigurationNodeBase,
	'properties': {
		'application.experimental.rendererProfiling': {
			type: 'boolean',
			default: false,
			tags: ['experimental'],
			markdownDescription: localize('experimental.rendererProfiling', "When enabled, slow renderers are automatically profiled."),
			experiment: {
				mode: 'startup'
			}
		}
	}
});
