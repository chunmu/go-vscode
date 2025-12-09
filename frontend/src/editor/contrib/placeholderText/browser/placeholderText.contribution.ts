/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './placeholderText.css';
import { EditorContributionInstantiation, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { ghostTextForeground } from '../../../common/core/editorColorRegistry.ts';
import { localize } from '../../../../nls.ts';
import { registerColor } from '../../../../platform/theme/common/colorUtils.ts';
import { PlaceholderTextContribution } from './placeholderTextContribution.ts';
import { wrapInReloadableClass1 } from '../../../../platform/observable/common/wrapInReloadableClass.ts';

registerEditorContribution(PlaceholderTextContribution.ID, wrapInReloadableClass1(() => PlaceholderTextContribution), EditorContributionInstantiation.Eager);

registerColor('editor.placeholder.foreground', ghostTextForeground, localize('placeholderForeground', 'Foreground color of the placeholder text in the editor.'));
