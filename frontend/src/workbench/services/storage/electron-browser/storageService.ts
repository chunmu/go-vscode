/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEnvironmentService } from '../../../../platform/environment/common/environment.ts';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.ts';
import { RemoteStorageService } from '../../../../platform/storage/common/storageService.ts';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.ts';
import { IAnyWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.ts';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.ts';

export class NativeWorkbenchStorageService extends RemoteStorageService {

	constructor(
		workspace: IAnyWorkspaceIdentifier | undefined,
		private readonly userDataProfileService: IUserDataProfileService,
		userDataProfilesService: IUserDataProfilesService,
		mainProcessService: IMainProcessService,
		environmentService: IEnvironmentService
	) {
		super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);

		this.registerListeners();
	}

	private registerListeners(): void {
		this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.switchToProfile(e.profile))));
	}
}
