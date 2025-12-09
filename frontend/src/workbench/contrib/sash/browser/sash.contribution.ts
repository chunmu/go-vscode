/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isIOS } from '../../../../base/common/platform.ts';
import { localize } from '../../../../nls.ts';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { workbenchConfigurationNodeBase } from '../../../common/configuration.ts';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.ts';
import { SashSettingsController } from './sash.ts';

// Sash size contribution
registerWorkbenchContribution2(SashSettingsController.ID, SashSettingsController, WorkbenchPhase.AfterRestored);

// Sash size configuration contribution
Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		...workbenchConfigurationNodeBase,
		properties: {
			'workbench.sash.size': {
				type: 'number',
				default: isIOS ? 20 : 4,
				minimum: 1,
				maximum: 20,
				description: localize('sashSize', "Controls the feedback area size in pixels of the dragging area in between views/editors. Set it to a larger value if you feel it's hard to resize views using the mouse.")
			},
			'workbench.sash.hoverDelay': {
				type: 'number',
				default: 300,
				minimum: 0,
				maximum: 2000,
				description: localize('sashHoverDelay', "Controls the hover feedback delay in milliseconds of the dragging area in between views/editors.")
			},
		}
	});
