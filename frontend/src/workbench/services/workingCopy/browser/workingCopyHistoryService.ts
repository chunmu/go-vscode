/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IFileService } from '../../../../platform/files/common/files.ts';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IWorkingCopyHistoryModelOptions, WorkingCopyHistoryService } from '../common/workingCopyHistoryService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkingCopyHistoryService } from '../common/workingCopyHistory.ts';

export class BrowserWorkingCopyHistoryService extends WorkingCopyHistoryService {

	constructor(
		@IFileService fileService: IFileService,
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILabelService labelService: ILabelService,
		@ILogService logService: ILogService,
		@IConfigurationService configurationService: IConfigurationService
	) {
		super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService);
	}

	protected getModelOptions(): IWorkingCopyHistoryModelOptions {
		return { flushOnChange: true /* because browsers support no long running shutdown */ };
	}
}

// Register Service
registerSingleton(IWorkingCopyHistoryService, BrowserWorkingCopyHistoryService, InstantiationType.Delayed);
