/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { PromptLinkProvider } from './languageProviders/promptLinkProvider.ts';
import { PromptBodyAutocompletion } from './languageProviders/promptBodyAutocompletion.ts';
import { PromptHeaderAutocompletion } from './languageProviders/promptHeaderAutocompletion.ts';
import { PromptHoverProvider } from './languageProviders/promptHovers.ts';
import { PromptHeaderDefinitionProvider } from './languageProviders/PromptHeaderDefinitionProvider.ts';
import { PromptValidatorContribution } from './languageProviders/promptValidator.ts';
import { PromptDocumentSemanticTokensProvider } from './languageProviders/promptDocumentSemanticTokensProvider.ts';
import { PromptCodeActionProvider } from './languageProviders/promptCodeActions.ts';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.ts';
import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { ALL_PROMPTS_LANGUAGE_SELECTOR } from './promptTypes.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';

export class PromptLanguageFeaturesProvider extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'chat.promptLanguageFeatures';

	constructor(
		@ILanguageFeaturesService languageService: ILanguageFeaturesService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		this._register(languageService.linkProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptLinkProvider)));
		this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptBodyAutocompletion)));
		this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderAutocompletion)));
		this._register(languageService.hoverProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHoverProvider)));
		this._register(languageService.definitionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderDefinitionProvider)));
		this._register(languageService.documentSemanticTokensProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptDocumentSemanticTokensProvider)));
		this._register(languageService.codeActionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptCodeActionProvider)));

		this._register(instantiationService.createInstance(PromptValidatorContribution));
	}
}
