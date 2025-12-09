/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.ts';
import { ITextMateTokenizationService } from './textMateTokenizationFeature.ts';
import { TextMateTokenizationFeature } from './textMateTokenizationFeatureImpl.ts';
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.ts';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.ts';
import { URI } from '../../../../base/common/uri.ts';
import { TokenizationRegistry } from '../../../../editor/common/languages.ts';
import { ITextFileService } from '../../textfile/common/textfiles.ts';
import { StopWatch } from '../../../../base/common/stopwatch.ts';

/**
 * Makes sure the ITextMateTokenizationService is instantiated
 */
class TextMateTokenizationInstantiator implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.textMateTokenizationInstantiator';

	constructor(
		@ITextMateTokenizationService _textMateTokenizationService: ITextMateTokenizationService
	) { }
}

registerSingleton(ITextMateTokenizationService, TextMateTokenizationFeature, InstantiationType.Eager);

registerWorkbenchContribution2(TextMateTokenizationInstantiator.ID, TextMateTokenizationInstantiator, WorkbenchPhase.BlockRestore);

CommandsRegistry.registerCommand('_workbench.colorizeTextMateTokens', async (accessor: ServicesAccessor, resource?: URI): Promise<{ tokenizeTime: number }> => {
	const textModelService = accessor.get(ITextFileService);
	const textModel = resource ? (await textModelService.files.resolve(resource)).textEditorModel : undefined;
	if (!textModel) {
		throw new Error(`Cannot resolve text model for resource ${resource}`);
	}

	const tokenizer = await TokenizationRegistry.getOrCreate(textModel.getLanguageId());
	if (!tokenizer) {
		throw new Error(`Cannot resolve tokenizer for language ${textModel.getLanguageId()}`);
	}

	const stopwatch = new StopWatch();
	let state = tokenizer.getInitialState();
	for (let i = 1; i <= textModel.getLineCount(); i++) {
		state = tokenizer.tokenizeEncoded(textModel.getLineContent(i), true, state).endState;
	}
	stopwatch.stop();
	return { tokenizeTime: stopwatch.elapsed() };
});
