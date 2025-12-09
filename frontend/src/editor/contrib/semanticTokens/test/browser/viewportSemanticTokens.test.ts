/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Barrier, timeout } from '../../../../../base/common/async.ts';
import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { Emitter } from '../../../../../base/common/event.ts';
import { DisposableStore } from '../../../../../base/common/lifecycle.ts';
import { mock } from '../../../../../base/test/common/mock.ts';
import { runWithFakedTimers } from '../../../../../base/test/common/timeTravelScheduler.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { Range } from '../../../../common/core/range.ts';
import { DocumentRangeSemanticTokensProvider, SemanticTokens, SemanticTokensLegend } from '../../../../common/languages.ts';
import { ILanguageService } from '../../../../common/languages/language.ts';
import { ITextModel } from '../../../../common/model.ts';
import { ILanguageFeatureDebounceService, LanguageFeatureDebounceService } from '../../../../common/services/languageFeatureDebounce.ts';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.ts';
import { LanguageFeaturesService } from '../../../../common/services/languageFeaturesService.ts';
import { LanguageService } from '../../../../common/services/languageService.ts';
import { ISemanticTokensStylingService } from '../../../../common/services/semanticTokensStyling.ts';
import { SemanticTokensStylingService } from '../../../../common/services/semanticTokensStylingService.ts';
import { ViewportSemanticTokensContribution } from '../../browser/viewportSemanticTokens.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.ts';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.ts';
import { NullLogService } from '../../../../../platform/log/common/log.ts';
import { ColorScheme } from '../../../../../platform/theme/common/theme.ts';
import { IThemeService } from '../../../../../platform/theme/common/themeService.ts';
import { TestColorTheme, TestThemeService } from '../../../../../platform/theme/test/common/testThemeService.ts';
import { createTextModel } from '../../../../test/common/testTextModel.ts';
import { createTestCodeEditor } from '../../../../test/browser/testCodeEditor.ts';
import { ServiceCollection } from '../../../../../platform/instantiation/common/serviceCollection.ts';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.ts';

suite('ViewportSemanticTokens', () => {

	const disposables = new DisposableStore();
	let languageService: ILanguageService;
	let languageFeaturesService: ILanguageFeaturesService;
	let serviceCollection: ServiceCollection;

	setup(() => {
		const configService = new TestConfigurationService({ editor: { semanticHighlighting: true } });
		const themeService = new TestThemeService();
		themeService.setTheme(new TestColorTheme({}, ColorScheme.DARK, true));
		languageFeaturesService = new LanguageFeaturesService();
		languageService = disposables.add(new LanguageService(false));

		const logService = new NullLogService();
		const semanticTokensStylingService = new SemanticTokensStylingService(themeService, logService, languageService);
		const envService = new class extends mock<IEnvironmentService>() {
			override isBuilt: boolean = true;
			override isExtensionDevelopment: boolean = false;
		};
		const languageFeatureDebounceService = new LanguageFeatureDebounceService(logService, envService);

		serviceCollection = new ServiceCollection(
			[ILanguageFeaturesService, languageFeaturesService],
			[ILanguageFeatureDebounceService, languageFeatureDebounceService],
			[ISemanticTokensStylingService, semanticTokensStylingService],
			[IThemeService, themeService],
			[IConfigurationService, configService]
		);
	});

	teardown(() => {
		disposables.clear();
	});

	ensureNoDisposablesAreLeakedInTestSuite();

	test('DocumentRangeSemanticTokens provider onDidChange event should trigger refresh', async () => {
		await runWithFakedTimers({}, async () => {

			disposables.add(languageService.registerLanguage({ id: 'testMode' }));

			const inFirstCall = new Barrier();
			const inRefreshCall = new Barrier();

			const emitter = new Emitter<void>();
			let requestCount = 0;
			disposables.add(languageFeaturesService.documentRangeSemanticTokensProvider.register('testMode', new class implements DocumentRangeSemanticTokensProvider {
				onDidChange = emitter.event;
				getLegend(): SemanticTokensLegend {
					return { tokenTypes: ['class'], tokenModifiers: [] };
				}
				async provideDocumentRangeSemanticTokens(model: ITextModel, range: Range, token: CancellationToken): Promise<SemanticTokens | null> {
					requestCount++;
					if (requestCount === 1) {
						inFirstCall.open();
					} else if (requestCount === 2) {
						inRefreshCall.open();
					}
					return {
						data: new Uint32Array([0, 1, 1, 1, 1])
					};
				}
			}));

			const textModel = disposables.add(createTextModel('Hello world', 'testMode'));
			const editor = disposables.add(createTestCodeEditor(textModel, { serviceCollection }));
			const instantiationService = new TestInstantiationService(serviceCollection);
			disposables.add(instantiationService.createInstance(ViewportSemanticTokensContribution, editor));

			textModel.onBeforeAttached();

			await inFirstCall.wait();

			assert.strictEqual(requestCount, 1, 'Initial request should have been made');

			// Make sure no other requests are made for a little while
			await timeout(1000);
			assert.strictEqual(requestCount, 1, 'No additional requests should have been made');

			// Fire the provider's onDidChange event
			emitter.fire();

			await inRefreshCall.wait();

			assert.strictEqual(requestCount, 2, 'Provider onDidChange should trigger a refresh of viewport semantic tokens');
		});
	});
});
