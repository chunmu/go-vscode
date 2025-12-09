/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { illegalArgument } from '../../../../base/common/errors.ts';
import { URI } from '../../../../base/common/uri.ts';
import { registerAction2 } from '../../../../platform/actions/common/actions.ts';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.ts';
import { EditorContributionInstantiation, registerEditorAction, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { registerEditorFeature } from '../../../common/editorFeatures.ts';
import { IColorPresentation } from '../../../common/languages.ts';
import { HoverParticipantRegistry } from '../../hover/browser/hoverTypes.ts';
import { _findColorData, _setupColorCommand, ColorPresentationsCollector, ExtColorDataCollector, IExtColorData } from './color.ts';
import { ColorDetector } from './colorDetector.ts';
import { DefaultDocumentColorProviderFeature } from './defaultDocumentColorProvider.ts';
import { HoverColorPickerContribution } from './hoverColorPicker/hoverColorPickerContribution.ts';
import { HoverColorPickerParticipant } from './hoverColorPicker/hoverColorPickerParticipant.ts';
import { HideStandaloneColorPicker, InsertColorWithStandaloneColorPicker, ShowOrFocusStandaloneColorPicker } from './standaloneColorPicker/standaloneColorPickerActions.ts';
import { StandaloneColorPickerController } from './standaloneColorPicker/standaloneColorPickerController.ts';
import { Range } from '../../../common/core/range.ts';

registerEditorAction(HideStandaloneColorPicker);
registerEditorAction(InsertColorWithStandaloneColorPicker);
registerAction2(ShowOrFocusStandaloneColorPicker);

registerEditorContribution(HoverColorPickerContribution.ID, HoverColorPickerContribution, EditorContributionInstantiation.BeforeFirstInteraction);
registerEditorContribution(StandaloneColorPickerController.ID, StandaloneColorPickerController, EditorContributionInstantiation.AfterFirstRender);
registerEditorContribution(ColorDetector.ID, ColorDetector, EditorContributionInstantiation.AfterFirstRender);
registerEditorFeature(DefaultDocumentColorProviderFeature);

HoverParticipantRegistry.register(HoverColorPickerParticipant);

CommandsRegistry.registerCommand('_executeDocumentColorProvider', function (accessor, ...args) {
	const [resource] = args;
	if (!(resource instanceof URI)) {
		throw illegalArgument();
	}
	const { model, colorProviderRegistry, defaultColorDecoratorsEnablement } = _setupColorCommand(accessor, resource);
	return _findColorData<IExtColorData>(new ExtColorDataCollector(), colorProviderRegistry, model, CancellationToken.None, defaultColorDecoratorsEnablement);
});

CommandsRegistry.registerCommand('_executeColorPresentationProvider', function (accessor, ...args) {
	const [color, context] = args;
	if (!context) {
		return;
	}

	const { uri, range } = context as { uri?: unknown; range?: unknown };
	if (!(uri instanceof URI) || !Array.isArray(color) || color.length !== 4 || !Range.isIRange(range)) {
		throw illegalArgument();
	}
	const { model, colorProviderRegistry, defaultColorDecoratorsEnablement } = _setupColorCommand(accessor, uri);
	const [red, green, blue, alpha] = color;
	return _findColorData<IColorPresentation>(new ColorPresentationsCollector({ range: range, color: { red, green, blue, alpha } }), colorProviderRegistry, model, CancellationToken.None, defaultColorDecoratorsEnablement);
});
