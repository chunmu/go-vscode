/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import { IEditorService } from '../../editor/common/editorService.ts';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.ts';
import { IConfigurationResolverService } from '../common/configurationResolver.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { BaseConfigurationResolverService } from '../browser/baseConfigurationResolverService.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
import { IShellEnvironmentService } from '../../environment/electron-browser/shellEnvironmentService.ts';
import { IPathService } from '../../path/common/pathService.ts';
import { IExtensionService } from '../../extensions/common/extensions.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';

export class ConfigurationResolverService extends BaseConfigurationResolverService {

	constructor(
		@IEditorService editorService: IEditorService,
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IConfigurationService configurationService: IConfigurationService,
		@ICommandService commandService: ICommandService,
		@IWorkspaceContextService workspaceContextService: IWorkspaceContextService,
		@IQuickInputService quickInputService: IQuickInputService,
		@ILabelService labelService: ILabelService,
		@IShellEnvironmentService shellEnvironmentService: IShellEnvironmentService,
		@IPathService pathService: IPathService,
		@IExtensionService extensionService: IExtensionService,
		@IStorageService storageService: IStorageService,
	) {
		super({
			getAppRoot: (): string | undefined => {
				return environmentService.appRoot;
			},
			getExecPath: (): string | undefined => {
				return environmentService.execPath;
			},
		}, shellEnvironmentService.getShellEnv(), editorService, configurationService, commandService,
			workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService);
	}
}

registerSingleton(IConfigurationResolverService, ConfigurationResolverService, InstantiationType.Delayed);
