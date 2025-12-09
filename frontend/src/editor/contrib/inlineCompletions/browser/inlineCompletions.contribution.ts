/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.ts';
import { registerAction2 } from '../../../../platform/actions/common/actions.ts';
import { wrapInHotClass1 } from '../../../../platform/observable/common/wrapInHotClass.ts';
import { EditorContributionInstantiation, registerEditorAction, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { HoverParticipantRegistry } from '../../hover/browser/hoverTypes.ts';
import { AcceptInlineCompletion, AcceptNextLineOfInlineCompletion, AcceptNextWordOfInlineCompletion, DevExtractReproSample, HideInlineCompletion, JumpToNextInlineEdit, ShowNextInlineSuggestionAction, ShowPreviousInlineSuggestionAction, ToggleAlwaysShowInlineSuggestionToolbar, TriggerInlineSuggestionAction, ToggleInlineCompletionShowCollapsed } from './controller/commands.ts';
import { InlineCompletionsController } from './controller/inlineCompletionsController.ts';
import { InlineCompletionsHoverParticipant } from './hintsWidget/hoverParticipant.ts';
import { InlineCompletionsAccessibleView } from './inlineCompletionsAccessibleView.ts';
import { CancelSnoozeInlineCompletion, SnoozeInlineCompletion } from '../../../browser/services/inlineCompletionsService.ts';

registerEditorContribution(InlineCompletionsController.ID, wrapInHotClass1(InlineCompletionsController.hot), EditorContributionInstantiation.Eventually);

registerEditorAction(TriggerInlineSuggestionAction);
registerEditorAction(ShowNextInlineSuggestionAction);
registerEditorAction(ShowPreviousInlineSuggestionAction);
registerEditorAction(AcceptNextWordOfInlineCompletion);
registerEditorAction(AcceptNextLineOfInlineCompletion);
registerEditorAction(AcceptInlineCompletion);
registerEditorAction(ToggleInlineCompletionShowCollapsed);
registerEditorAction(HideInlineCompletion);
registerEditorAction(JumpToNextInlineEdit);
registerAction2(ToggleAlwaysShowInlineSuggestionToolbar);
registerEditorAction(DevExtractReproSample);
registerAction2(SnoozeInlineCompletion);
registerAction2(CancelSnoozeInlineCompletion);

HoverParticipantRegistry.register(InlineCompletionsHoverParticipant);
AccessibleViewRegistry.register(new InlineCompletionsAccessibleView());
