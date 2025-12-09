/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorContributionInstantiation, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { HoverParticipantRegistry } from '../../hover/browser/hoverTypes.ts';
import { InlayHintsController } from './inlayHintsController.ts';
import { InlayHintsHover } from './inlayHintsHover.ts';

registerEditorContribution(InlayHintsController.ID, InlayHintsController, EditorContributionInstantiation.AfterFirstRender);
HoverParticipantRegistry.register(InlayHintsHover);
