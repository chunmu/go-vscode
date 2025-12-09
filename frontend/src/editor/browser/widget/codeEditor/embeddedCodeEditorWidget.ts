/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as objects from '../../../../base/common/objects.ts';
import { ICodeEditor } from '../../editorBrowser.ts';
import { ICodeEditorService } from '../../services/codeEditorService.ts';
import { CodeEditorWidget, ICodeEditorWidgetOptions } from './codeEditorWidget.ts';
import { ConfigurationChangedEvent, IEditorOptions } from '../../../common/config/editorOptions.ts';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.ts';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.ts';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.ts';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { INotificationService } from '../../../../platform/notification/common/notification.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';

export class EmbeddedCodeEditorWidget extends CodeEditorWidget {
	private readonly _parentEditor: ICodeEditor;
	private readonly _overwriteOptions: IEditorOptions;

	constructor(
		domElement: HTMLElement,
		options: IEditorOptions,
		codeEditorWidgetOptions: ICodeEditorWidgetOptions,
		parentEditor: ICodeEditor,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@ICommandService commandService: ICommandService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IThemeService themeService: IThemeService,
		@INotificationService notificationService: INotificationService,
		@IAccessibilityService accessibilityService: IAccessibilityService,
		@ILanguageConfigurationService languageConfigurationService: ILanguageConfigurationService,
		@ILanguageFeaturesService languageFeaturesService: ILanguageFeaturesService
	) {
		super(domElement, { ...parentEditor.getRawOptions(), overflowWidgetsDomNode: parentEditor.getOverflowWidgetsDomNode() }, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);

		this._parentEditor = parentEditor;
		this._overwriteOptions = options;

		// Overwrite parent's options
		super.updateOptions(this._overwriteOptions);

		this._register(parentEditor.onDidChangeConfiguration((e: ConfigurationChangedEvent) => this._onParentConfigurationChanged(e)));
	}

	getParentEditor(): ICodeEditor {
		return this._parentEditor;
	}

	private _onParentConfigurationChanged(e: ConfigurationChangedEvent): void {
		super.updateOptions(this._parentEditor.getRawOptions());
		super.updateOptions(this._overwriteOptions);
	}

	override updateOptions(newOptions: IEditorOptions): void {
		objects.mixin(this._overwriteOptions, newOptions, true);
		super.updateOptions(this._overwriteOptions);
	}
}

export function getOuterEditor(accessor: ServicesAccessor): ICodeEditor | null {
	const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
	if (editor instanceof EmbeddedCodeEditorWidget) {
		return editor.getParentEditor();
	}
	return editor;
}
