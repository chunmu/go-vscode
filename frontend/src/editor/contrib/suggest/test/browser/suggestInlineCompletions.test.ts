/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { DisposableStore } from '../../../../../base/common/lifecycle.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { mock } from '../../../../../base/test/common/mock.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { Position } from '../../../../common/core/position.ts';
import { Range } from '../../../../common/core/range.ts';
import { CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, InlineCompletionContext, InlineCompletionTriggerKind, ProviderResult } from '../../../../common/languages.ts';
import { ITextModel } from '../../../../common/model.ts';
import { TextModel } from '../../../../common/model/textModel.ts';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.ts';
import { SuggestInlineCompletions } from '../../browser/suggestInlineCompletions.ts';
import { ISuggestMemoryService } from '../../browser/suggestMemory.ts';
import { createCodeEditorServices, instantiateTestCodeEditor, ITestCodeEditor } from '../../../../test/browser/testCodeEditor.ts';
import { createTextModel } from '../../../../test/common/testTextModel.ts';
import { ServiceCollection } from '../../../../../platform/instantiation/common/serviceCollection.ts';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.ts';
import { generateUuid } from '../../../../../base/common/uuid.ts';


suite('Suggest Inline Completions', function () {

	const disposables = new DisposableStore();
	const services = new ServiceCollection([ISuggestMemoryService, new class extends mock<ISuggestMemoryService>() {
		override select(): number {
			return 0;
		}
	}]);

	let insta: TestInstantiationService;
	let model: TextModel;
	let editor: ITestCodeEditor;

	setup(function () {

		insta = createCodeEditorServices(disposables, services);
		model = createTextModel('he', undefined, undefined, URI.from({ scheme: 'foo', path: 'foo.bar' }));
		editor = instantiateTestCodeEditor(insta, model);
		editor.updateOptions({ quickSuggestions: { comments: 'inline', strings: 'inline', other: 'inline' } });

		insta.invokeFunction(accessor => {
			disposables.add(accessor.get(ILanguageFeaturesService).completionProvider.register({ pattern: '*.bar', scheme: 'foo' }, new class implements CompletionItemProvider {
				_debugDisplayName = 'test';

				triggerCharacters?: string[] | undefined;

				provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): ProviderResult<CompletionList> {

					const word = model.getWordUntilPosition(position);
					const range = new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

					const suggestions: CompletionItem[] = [];
					suggestions.push({ insertText: 'hello', label: 'hello', range, kind: CompletionItemKind.Class });
					suggestions.push({ insertText: 'hell', label: 'hell', range, kind: CompletionItemKind.Class });
					suggestions.push({ insertText: 'hey', label: 'hey', range, kind: CompletionItemKind.Snippet });
					return { suggestions };
				}

			}));
		});
	});

	teardown(function () {
		disposables.clear();
		model.dispose();
		editor.dispose();
	});


	ensureNoDisposablesAreLeakedInTestSuite();

	const context: InlineCompletionContext = { triggerKind: InlineCompletionTriggerKind.Explicit, selectedSuggestionInfo: undefined, includeInlineCompletions: true, includeInlineEdits: false, requestUuid: generateUuid(), requestIssuedDateTime: 0, earliestShownDateTime: 0 };

	test('Aggressive inline completions when typing within line #146948', async function () {

		const completions: SuggestInlineCompletions = disposables.add(insta.createInstance(SuggestInlineCompletions));

		{
			// (1,3), end of word -> suggestions
			const result = await completions.provideInlineCompletions(model, new Position(1, 3), context, CancellationToken.None);
			assert.strictEqual(result?.items.length, 3);
			completions.disposeInlineCompletions(result);
		}
		{
			// (1,2), middle of word -> NO suggestions
			const result = await completions.provideInlineCompletions(model, new Position(1, 2), context, CancellationToken.None);
			assert.ok(result === undefined);
		}
	});

	test('Snippets show in inline suggestions even though they are turned off #175190', async function () {
		const completions: SuggestInlineCompletions = disposables.add(insta.createInstance(SuggestInlineCompletions));

		{
			// unfiltered
			const result = await completions.provideInlineCompletions(model, new Position(1, 3), context, CancellationToken.None);
			assert.strictEqual(result?.items.length, 3);
			completions.disposeInlineCompletions(result);
		}

		{
			// filtered
			editor.updateOptions({ suggest: { showSnippets: false } });
			const result = await completions.provideInlineCompletions(model, new Position(1, 3), context, CancellationToken.None);
			assert.strictEqual(result?.items.length, 2);
			completions.disposeInlineCompletions(result);
		}

	});
});
