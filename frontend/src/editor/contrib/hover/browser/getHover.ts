/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AsyncIterableProducer } from '../../../../base/common/async.ts';
import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { onUnexpectedExternalError } from '../../../../base/common/errors.ts';
import { registerModelAndPositionCommand } from '../../../browser/editorExtensions.ts';
import { Position } from '../../../common/core/position.ts';
import { ITextModel } from '../../../common/model.ts';
import { Hover, HoverProvider } from '../../../common/languages.ts';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.ts';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.ts';

export class HoverProviderResult {
	constructor(
		public readonly provider: HoverProvider,
		public readonly hover: Hover,
		public readonly ordinal: number
	) { }
}

/**
 * Does not throw or return a rejected promise (returns undefined instead).
 */
async function executeProvider(provider: HoverProvider, ordinal: number, model: ITextModel, position: Position, token: CancellationToken): Promise<HoverProviderResult | undefined> {
	const result = await Promise
		.resolve(provider.provideHover(model, position, token))
		.catch(onUnexpectedExternalError);
	if (!result || !isValid(result)) {
		return undefined;
	}
	return new HoverProviderResult(provider, result, ordinal);
}

export function getHoverProviderResultsAsAsyncIterable(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive = false): AsyncIterable<HoverProviderResult> {
	const providers = registry.ordered(model, recursive);
	const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
	return AsyncIterableProducer.fromPromisesResolveOrder(promises).coalesce();
}

export async function getHoversPromise(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive = false): Promise<Hover[]> {
	const out: Hover[] = [];
	for await (const item of getHoverProviderResultsAsAsyncIterable(registry, model, position, token, recursive)) {
		out.push(item.hover);
	}
	return out;
}

registerModelAndPositionCommand('_executeHoverProvider', (accessor, model, position): Promise<Hover[]> => {
	const languageFeaturesService = accessor.get(ILanguageFeaturesService);
	return getHoversPromise(languageFeaturesService.hoverProvider, model, position, CancellationToken.None);
});

registerModelAndPositionCommand('_executeHoverProvider_recursive', (accessor, model, position): Promise<Hover[]> => {
	const languageFeaturesService = accessor.get(ILanguageFeaturesService);
	return getHoversPromise(languageFeaturesService.hoverProvider, model, position, CancellationToken.None, true);
});

function isValid(result: Hover) {
	const hasRange = (typeof result.range !== 'undefined');
	const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
	return hasRange && hasHtmlContent;
}
