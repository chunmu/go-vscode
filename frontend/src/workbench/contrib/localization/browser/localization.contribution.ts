/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseLocalizationWorkbenchContribution } from '../common/localization.contribution.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';

export class WebLocalizationWorkbenchContribution extends BaseLocalizationWorkbenchContribution { }

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(WebLocalizationWorkbenchContribution, LifecyclePhase.Eventually);
