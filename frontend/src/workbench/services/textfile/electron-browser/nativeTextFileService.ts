/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { AbstractTextFileService } from '../browser/textFileService.ts';
import { ITextFileService, ITextFileStreamContent, ITextFileContent, IReadTextFileOptions, TextFileEditorModelState, ITextFileEditorModel } from '../common/textfiles.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IFileService, IFileReadLimits } from '../../../../platform/files/common/files.ts';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.ts';
import { IUntitledTextEditorModelManager, IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.ts';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IModelService } from '../../../../editor/common/services/model.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.ts';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.ts';
import { IPathService } from '../../path/common/pathService.ts';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { ILanguageService } from '../../../../editor/common/languages/language.ts';
import { IElevatedFileService } from '../../files/common/elevatedFileService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { Promises } from '../../../../base/common/async.ts';
import { IDecorationsService } from '../../decorations/common/decorations.ts';

export class NativeTextFileService extends AbstractTextFileService {

	protected override readonly environmentService: INativeWorkbenchEnvironmentService;

	constructor(
		@IFileService fileService: IFileService,
		@IUntitledTextEditorService untitledTextEditorService: IUntitledTextEditorModelManager,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IModelService modelService: IModelService,
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
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

		this.environmentService = environmentService;

		this.registerListeners();
	}

	private registerListeners(): void {

		// Lifecycle
		this._register(this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdown(), { id: 'join.textFiles', label: localize('join.textFiles', "Saving text files") })));
	}

	private async onWillShutdown(): Promise<void> {
		let modelsPendingToSave: ITextFileEditorModel[];

		// As long as models are pending to be saved, we prolong the shutdown
		// until that has happened to ensure we are not shutting down in the
		// middle of writing to the file
		// (https://github.com/microsoft/vscode/issues/116600)
		while ((modelsPendingToSave = this.files.models.filter(model => model.hasState(TextFileEditorModelState.PENDING_SAVE))).length > 0) {
			await Promises.settled(modelsPendingToSave.map(model => model.joinState(TextFileEditorModelState.PENDING_SAVE)));
		}
	}

	override async read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent> {

		// ensure platform limits are applied
		options = this.ensureLimits(options);

		return super.read(resource, options);
	}

	override async readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent> {

		// ensure platform limits are applied
		options = this.ensureLimits(options);

		return super.readStream(resource, options);
	}

	private ensureLimits(options?: IReadTextFileOptions): IReadTextFileOptions {
		let ensuredOptions: IReadTextFileOptions;
		if (!options) {
			ensuredOptions = Object.create(null);
		} else {
			ensuredOptions = options;
		}

		let ensuredLimits: IFileReadLimits;
		if (!ensuredOptions.limits) {
			ensuredLimits = Object.create(null);
			ensuredOptions = {
				...ensuredOptions,
				limits: ensuredLimits
			};
		} else {
			ensuredLimits = ensuredOptions.limits;
		}

		return ensuredOptions;
	}
}

registerSingleton(ITextFileService, NativeTextFileService, InstantiationType.Eager);
