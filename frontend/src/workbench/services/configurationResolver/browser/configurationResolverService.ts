/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import { BaseConfigurationResolverService } from './baseConfigurationResolverService.ts';
import { IConfigurationResolverService } from '../common/configurationResolver.ts';
import { IEditorService } from '../../editor/common/editorService.ts';
import { IExtensionService } from '../../extensions/common/extensions.ts';
import { IPathService } from '../../path/common/pathService.ts';

export class ConfigurationResolverService extends BaseConfigurationResolverService {

	constructor(
		@IEditorService editorService: IEditorService,
		@IConfigurationService configurationService: IConfigurationService,
		@ICommandService commandService: ICommandService,
		@IWorkspaceContextService workspaceContextService: IWorkspaceContextService,
		@IQuickInputService quickInputService: IQuickInputService,
		@ILabelService labelService: ILabelService,
		@IPathService pathService: IPathService,
		@IExtensionService extensionService: IExtensionService,
		@IStorageService storageService: IStorageService,
	) {
		super({ getAppRoot: () => undefined, getExecPath: () => undefined },
			Promise.resolve(Object.create(null)), editorService, configurationService,
			commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService);
	}
}

registerSingleton(IConfigurationResolverService, ConfigurationResolverService, InstantiationType.Delayed);
