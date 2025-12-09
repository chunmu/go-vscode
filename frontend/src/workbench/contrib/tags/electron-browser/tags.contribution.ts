/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.ts';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../../../common/contributions.ts';
import { WorkspaceTags } from './workspaceTags.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';

// Register Workspace Tags Contribution
Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTags, LifecyclePhase.Eventually);
