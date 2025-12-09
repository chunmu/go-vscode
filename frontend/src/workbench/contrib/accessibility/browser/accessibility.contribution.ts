/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { DynamicSpeechAccessibilityConfiguration, registerAccessibilityConfiguration } from './accessibilityConfiguration.ts';
import { IWorkbenchContributionsRegistry, WorkbenchPhase, Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { UnfocusedViewDimmingContribution } from './unfocusedViewDimmingContribution.ts';
import { AccessibilityStatus } from './accessibilityStatus.ts';
import { EditorAccessibilityHelpContribution } from './editorAccessibilityHelp.ts';
import { SaveAccessibilitySignalContribution } from '../../accessibilitySignals/browser/saveAccessibilitySignal.ts';
import { DiffEditorActiveAnnouncementContribution } from '../../accessibilitySignals/browser/openDiffEditorAnnouncement.ts';
import { SpeechAccessibilitySignalContribution } from '../../speech/browser/speechAccessibilitySignal.ts';
import { AccessibleViewInformationService, IAccessibleViewInformationService } from '../../../services/accessibility/common/accessibleViewInformationService.ts';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.ts';
import { AccessibleViewService } from './accessibleView.ts';
import { AccesibleViewHelpContribution, AccesibleViewContributions } from './accessibleViewContributions.ts';
import { ExtensionAccessibilityHelpDialogContribution } from './extensionAccesibilityHelp.contribution.ts';

registerAccessibilityConfiguration();
registerSingleton(IAccessibleViewService, AccessibleViewService, InstantiationType.Delayed);
registerSingleton(IAccessibleViewInformationService, AccessibleViewInformationService, InstantiationType.Delayed);

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(EditorAccessibilityHelpContribution, LifecyclePhase.Eventually);
workbenchRegistry.registerWorkbenchContribution(UnfocusedViewDimmingContribution, LifecyclePhase.Restored);

workbenchRegistry.registerWorkbenchContribution(AccesibleViewHelpContribution, LifecyclePhase.Eventually);
workbenchRegistry.registerWorkbenchContribution(AccesibleViewContributions, LifecyclePhase.Eventually);

registerWorkbenchContribution2(AccessibilityStatus.ID, AccessibilityStatus, WorkbenchPhase.BlockRestore);
registerWorkbenchContribution2(ExtensionAccessibilityHelpDialogContribution.ID, ExtensionAccessibilityHelpDialogContribution, WorkbenchPhase.BlockRestore);
registerWorkbenchContribution2(SaveAccessibilitySignalContribution.ID, SaveAccessibilitySignalContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(SpeechAccessibilitySignalContribution.ID, SpeechAccessibilitySignalContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(DiffEditorActiveAnnouncementContribution.ID, DiffEditorActiveAnnouncementContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(DynamicSpeechAccessibilityConfiguration.ID, DynamicSpeechAccessibilityConfiguration, WorkbenchPhase.AfterRestored);
