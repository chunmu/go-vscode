/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore, IDisposable } from '../../../base/common/lifecycle.ts';
import { URI } from '../../../base/common/uri.ts';
import { BracketPairColorizationOptions, DefaultEndOfLine, ITextBufferFactory, ITextModelCreationOptions } from '../../common/model.ts';
import { TextModel } from '../../common/model/textModel.ts';
import { ILanguageConfigurationService } from '../../common/languages/languageConfigurationRegistry.ts';
import { ILanguageService } from '../../common/languages/language.ts';
import { LanguageService } from '../../common/services/languageService.ts';
import { ITextResourcePropertiesService } from '../../common/services/textResourceConfiguration.ts';
import { TestLanguageConfigurationService } from './modes/testLanguageConfigurationService.ts';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.ts';
import { TestConfigurationService } from '../../../platform/configuration/test/common/testConfigurationService.ts';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.ts';
import { TestDialogService } from '../../../platform/dialogs/test/common/testDialogService.ts';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.ts';
import { ILogService, NullLogService } from '../../../platform/log/common/log.ts';
import { INotificationService } from '../../../platform/notification/common/notification.ts';
import { TestNotificationService } from '../../../platform/notification/test/common/testNotificationService.ts';
import { IThemeService } from '../../../platform/theme/common/themeService.ts';
import { TestThemeService } from '../../../platform/theme/test/common/testThemeService.ts';
import { IUndoRedoService } from '../../../platform/undoRedo/common/undoRedo.ts';
import { UndoRedoService } from '../../../platform/undoRedo/common/undoRedoService.ts';
import { TestTextResourcePropertiesService } from './services/testTextResourcePropertiesService.ts';
import { IModelService } from '../../common/services/model.ts';
import { ModelService } from '../../common/services/modelService.ts';
import { createServices, ServiceIdCtorPair, TestInstantiationService } from '../../../platform/instantiation/test/common/instantiationServiceMock.ts';
import { PLAINTEXT_LANGUAGE_ID } from '../../common/languages/modesRegistry.ts';
import { ILanguageFeatureDebounceService, LanguageFeatureDebounceService } from '../../common/services/languageFeatureDebounce.ts';
import { ILanguageFeaturesService } from '../../common/services/languageFeatures.ts';
import { LanguageFeaturesService } from '../../common/services/languageFeaturesService.ts';
import { IEnvironmentService } from '../../../platform/environment/common/environment.ts';
import { mock } from '../../../base/test/common/mock.ts';
import { ITreeSitterLibraryService } from '../../common/services/treeSitter/treeSitterLibraryService.ts';
import { TestTreeSitterLibraryService } from './services/testTreeSitterLibraryService.ts';

class TestTextModel extends TextModel {
	public registerDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}

export function withEditorModel(text: string[], callback: (model: TextModel) => void): void {
	const model = createTextModel(text.join('\n'));
	callback(model);
	model.dispose();
}

export interface IRelaxedTextModelCreationOptions {
	tabSize?: number;
	indentSize?: number | 'tabSize';
	insertSpaces?: boolean;
	detectIndentation?: boolean;
	trimAutoWhitespace?: boolean;
	defaultEOL?: DefaultEndOfLine;
	isForSimpleWidget?: boolean;
	largeFileOptimizations?: boolean;
	bracketColorizationOptions?: BracketPairColorizationOptions;
}

function resolveOptions(_options: IRelaxedTextModelCreationOptions): ITextModelCreationOptions {
	const defaultOptions = TextModel.DEFAULT_CREATION_OPTIONS;
	return {
		tabSize: (typeof _options.tabSize === 'undefined' ? defaultOptions.tabSize : _options.tabSize),
		indentSize: (typeof _options.indentSize === 'undefined' ? defaultOptions.indentSize : _options.indentSize),
		insertSpaces: (typeof _options.insertSpaces === 'undefined' ? defaultOptions.insertSpaces : _options.insertSpaces),
		detectIndentation: (typeof _options.detectIndentation === 'undefined' ? defaultOptions.detectIndentation : _options.detectIndentation),
		trimAutoWhitespace: (typeof _options.trimAutoWhitespace === 'undefined' ? defaultOptions.trimAutoWhitespace : _options.trimAutoWhitespace),
		defaultEOL: (typeof _options.defaultEOL === 'undefined' ? defaultOptions.defaultEOL : _options.defaultEOL),
		isForSimpleWidget: (typeof _options.isForSimpleWidget === 'undefined' ? defaultOptions.isForSimpleWidget : _options.isForSimpleWidget),
		largeFileOptimizations: (typeof _options.largeFileOptimizations === 'undefined' ? defaultOptions.largeFileOptimizations : _options.largeFileOptimizations),
		bracketPairColorizationOptions: (typeof _options.bracketColorizationOptions === 'undefined' ? defaultOptions.bracketPairColorizationOptions : _options.bracketColorizationOptions),
	};
}

export function createTextModel(text: string | ITextBufferFactory, languageId: string | null = null, options: IRelaxedTextModelCreationOptions = TextModel.DEFAULT_CREATION_OPTIONS, uri: URI | null = null): TextModel {
	const disposables = new DisposableStore();
	const instantiationService = createModelServices(disposables);
	const model = instantiateTextModel(instantiationService, text, languageId, options, uri);
	model.registerDisposable(disposables);
	return model;
}

export function instantiateTextModel(instantiationService: IInstantiationService, text: string | ITextBufferFactory, languageId: string | null = null, _options: IRelaxedTextModelCreationOptions = TextModel.DEFAULT_CREATION_OPTIONS, uri: URI | null = null): TestTextModel {
	const options = resolveOptions(_options);
	return instantiationService.createInstance(TestTextModel, text, languageId || PLAINTEXT_LANGUAGE_ID, options, uri);
}

export function createModelServices(disposables: DisposableStore, services: ServiceIdCtorPair<any>[] = []): TestInstantiationService {
	return createServices(disposables, services.concat([
		[INotificationService, TestNotificationService],
		[IDialogService, TestDialogService],
		[IUndoRedoService, UndoRedoService],
		[ILanguageService, LanguageService],
		[ILanguageConfigurationService, TestLanguageConfigurationService],
		[IConfigurationService, TestConfigurationService],
		[ITextResourcePropertiesService, TestTextResourcePropertiesService],
		[IThemeService, TestThemeService],
		[ILogService, NullLogService],
		[IEnvironmentService, new class extends mock<IEnvironmentService>() {
			override isBuilt: boolean = true;
			override isExtensionDevelopment: boolean = false;
		}],
		[ILanguageFeatureDebounceService, LanguageFeatureDebounceService],
		[ILanguageFeaturesService, LanguageFeaturesService],
		[IModelService, ModelService],
		[IModelService, ModelService],
		[ITreeSitterLibraryService, TestTreeSitterLibraryService],
	]));
}
