/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AbstractTextFileService } from './textFileService.ts';
import { ITextFileService, TextFileEditorModelState } from '../common/textfiles.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.ts';
import { IModelService } from '../../../../editor/common/services/model.ts';
import { ILanguageService } from '../../../../editor/common/languages/language.ts';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.ts';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IElevatedFileService } from '../../files/common/elevatedFileService.ts';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.ts';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.ts';
import { IPathService } from '../../path/common/pathService.ts';
import { IUntitledTextEditorModelManager, IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.ts';
import { IDecorationsService } from '../../decorations/common/decorations.ts';

export class BrowserTextFileService extends AbstractTextFileService {

	constructor(
		@IFileService fileService: IFileService,
		@IUntitledTextEditorService untitledTextEditorService: IUntitledTextEditorModelManager,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IModelService modelService: IModelService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IDialogService dialogService: IDialogService,
		@IFileDialogService fileDialogService: IFileDialogService,
		@ITextResourceConfigurationService textResourceConfigurationService: ITextResourceConfigurationService,
		@IFilesConfigurationService filesConfigurationService: IFilesConfigurationService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@IPathService pathService: IPathService,
		@IWorkingCopyFileService workingCopyFileService: IWorkingCopyFileService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILanguageService languageService: ILanguageService,
		@IElevatedFileService elevatedFileService: IElevatedFileService,
		@ILogService logService: ILogService,
		@IDecorationsService decorationsService: IDecorationsService
	) {
		super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);

		this.registerListeners();
	}

	private registerListeners(): void {

		// Lifecycle
		this._register(this.lifecycleService.onBeforeShutdown(event => event.veto(this.onBeforeShutdown(), 'veto.textFiles')));
	}

	private onBeforeShutdown(): boolean {
		if (this.files.models.some(model => model.hasState(TextFileEditorModelState.PENDING_SAVE))) {
			return true; // files are pending to be saved: veto (as there is no support for long running operations on shutdown)
		}

		return false;
	}
}

registerSingleton(ITextFileService, BrowserTextFileService, InstantiationType.Eager);
