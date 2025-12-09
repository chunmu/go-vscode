/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IFileService } from '../../../../platform/files/common/files.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { WorkingCopyBackupService } from '../common/workingCopyBackupService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkingCopyBackupService } from '../common/workingCopyBackup.ts';
import { joinPath } from '../../../../base/common/resources.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import { WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { BrowserWorkingCopyBackupTracker } from './workingCopyBackupTracker.ts';

export class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {

	constructor(
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IFileService fileService: IFileService,
		@ILogService logService: ILogService
	) {
		super(joinPath(environmentService.userRoamingDataHome, 'Backups', contextService.getWorkspace().id), fileService, logService);
	}
}

// Register Service
registerSingleton(IWorkingCopyBackupService, BrowserWorkingCopyBackupService, InstantiationType.Eager);

// Register Backup Tracker
registerWorkbenchContribution2(BrowserWorkingCopyBackupTracker.ID, BrowserWorkingCopyBackupTracker, WorkbenchPhase.BlockStartup);
