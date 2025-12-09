/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SaveDialogOptions, OpenDialogOptions } from '../../../../base/parts/sandbox/common/electronTypes.ts';
import { IHostService } from '../../host/browser/host.ts';
import { IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, IFileDialogService, IDialogService, INativeOpenDialogOptions } from '../../../../platform/dialogs/common/dialogs.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import { IHistoryService } from '../../history/common/history.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { IOpenerService } from '../../../../platform/opener/common/opener.ts';
import { INativeHostOptions, INativeHostService } from '../../../../platform/native/common/native.ts';
import { AbstractFileDialogService } from '../browser/abstractFileDialogService.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { ILanguageService } from '../../../../editor/common/languages/language.ts';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
import { IPathService } from '../../path/common/pathService.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.ts';
import { IEditorService } from '../../editor/common/editorService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { getActiveWindow } from '../../../../base/browser/dom.ts';

export class FileDialogService extends AbstractFileDialogService implements IFileDialogService {

	constructor(
		@IHostService hostService: IHostService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IHistoryService historyService: IHistoryService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IFileService fileService: IFileService,
		@IOpenerService openerService: IOpenerService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@IDialogService dialogService: IDialogService,
		@ILanguageService languageService: ILanguageService,
		@IWorkspacesService workspacesService: IWorkspacesService,
		@ILabelService labelService: ILabelService,
		@IPathService pathService: IPathService,
		@ICommandService commandService: ICommandService,
		@IEditorService editorService: IEditorService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@ILogService logService: ILogService
	) {
		super(hostService, contextService, historyService, environmentService, instantiationService,
			configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
	}

	private toNativeOpenDialogOptions(options: IPickAndOpenOptions): INativeOpenDialogOptions {
		return {
			forceNewWindow: options.forceNewWindow,
			telemetryExtraData: options.telemetryExtraData,
			defaultPath: options.defaultUri?.fsPath
		};
	}

	private shouldUseSimplified(schema: string): { useSimplified: boolean; isSetting: boolean } {
		const setting = (this.configurationService.getValue('files.simpleDialog.enable') === true);
		const newWindowSetting = (this.configurationService.getValue('window.openFilesInNewWindow') === 'on');
		return {
			// - Only real files can be shown in the native file picker
			// - If the simple file dialog is enabled
			// - driver automation (like smoke tests) can use the simple file dialog but not native
			useSimplified: ((schema !== Schemas.file) && (schema !== Schemas.vscodeUserData)) || setting || !!this.environmentService.enableSmokeTestDriver,
			isSetting: newWindowSetting
		};
	}

	async pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void> {
		const schema = this.getFileSystemSchema(options);

		if (!options.defaultUri) {
			options.defaultUri = await this.defaultFilePath(schema);
		}

		const shouldUseSimplified = this.shouldUseSimplified(schema);
		if (shouldUseSimplified.useSimplified) {
			return this.pickFileFolderAndOpenSimplified(schema, options, shouldUseSimplified.isSetting);
		}
		return this.nativeHostService.pickFileFolderAndOpen(this.toNativeOpenDialogOptions(options));
	}

	async pickFileAndOpen(options: IPickAndOpenOptions): Promise<void> {
		const schema = this.getFileSystemSchema(options);

		if (!options.defaultUri) {
			options.defaultUri = await this.defaultFilePath(schema);
		}

		const shouldUseSimplified = this.shouldUseSimplified(schema);
		if (shouldUseSimplified.useSimplified) {
			return this.pickFileAndOpenSimplified(schema, options, shouldUseSimplified.isSetting);
		}
		return this.nativeHostService.pickFileAndOpen(this.toNativeOpenDialogOptions(options));
	}

	async pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void> {
		const schema = this.getFileSystemSchema(options);

		if (!options.defaultUri) {
			options.defaultUri = await this.defaultFolderPath(schema);
		}

		if (this.shouldUseSimplified(schema).useSimplified) {
			return this.pickFolderAndOpenSimplified(schema, options);
		}
		return this.nativeHostService.pickFolderAndOpen(this.toNativeOpenDialogOptions(options));
	}

	async pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void> {
		options.availableFileSystems = this.getWorkspaceAvailableFileSystems(options);
		const schema = this.getFileSystemSchema(options);

		if (!options.defaultUri) {
			options.defaultUri = await this.defaultWorkspacePath(schema);
		}

		if (this.shouldUseSimplified(schema).useSimplified) {
			return this.pickWorkspaceAndOpenSimplified(schema, options);
		}
		return this.nativeHostService.pickWorkspaceAndOpen(this.toNativeOpenDialogOptions(options));
	}

	async pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined> {
		const schema = this.getFileSystemSchema({ defaultUri, availableFileSystems });
		const options = this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems);
		if (this.shouldUseSimplified(schema).useSimplified) {
			return this.pickFileToSaveSimplified(schema, options);
		} else {
			const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options));
			if (result && !result.canceled && result.filePath) {
				const uri = URI.file(result.filePath);

				this.addFileToRecentlyOpened(uri);

				return uri;
			}
		}
		return;
	}

	private toNativeSaveDialogOptions(options: ISaveDialogOptions): SaveDialogOptions & INativeHostOptions {
		options.defaultUri = options.defaultUri ? URI.file(options.defaultUri.path) : undefined;
		return {
			defaultPath: options.defaultUri?.fsPath,
			buttonLabel: typeof options.saveLabel === 'string' ? options.saveLabel : options.saveLabel?.withMnemonic,
			filters: options.filters,
			title: options.title,
			targetWindowId: getActiveWindow().vscodeWindowId
		};
	}

	async showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined> {
		const schema = this.getFileSystemSchema(options);
		if (this.shouldUseSimplified(schema).useSimplified) {
			return this.showSaveDialogSimplified(schema, options);
		}

		const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options));
		if (result && !result.canceled && result.filePath) {
			return URI.file(result.filePath);
		}

		return;
	}

	async showOpenDialog(options: IOpenDialogOptions): Promise<URI[] | undefined> {
		const schema = this.getFileSystemSchema(options);
		if (this.shouldUseSimplified(schema).useSimplified) {
			return this.showOpenDialogSimplified(schema, options);
		}

		const newOptions: OpenDialogOptions & { properties: string[] } & INativeHostOptions = {
			title: options.title,
			defaultPath: options.defaultUri?.fsPath,
			buttonLabel: typeof options.openLabel === 'string' ? options.openLabel : options.openLabel?.withMnemonic,
			filters: options.filters,
			properties: [],
			targetWindowId: getActiveWindow().vscodeWindowId
		};

		newOptions.properties.push('createDirectory');

		if (options.canSelectFiles) {
			newOptions.properties.push('openFile');
		}

		if (options.canSelectFolders) {
			newOptions.properties.push('openDirectory');
		}

		if (options.canSelectMany) {
			newOptions.properties.push('multiSelections');
		}

		const result = await this.nativeHostService.showOpenDialog(newOptions);
		return result && Array.isArray(result.filePaths) && result.filePaths.length > 0 ? result.filePaths.map(URI.file) : undefined;
	}
}

registerSingleton(IFileDialogService, FileDialogService, InstantiationType.Delayed);
