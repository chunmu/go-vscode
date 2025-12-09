/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IUserDataProfileStorageService, RemoteUserDataProfileStorageService } from '../common/userDataProfileStorageService.ts';
import { InstantiationType, registerSingleton } from '../../instantiation/common/extensions.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { ILogService } from '../../log/common/log.ts';
import { IUserDataProfilesService } from '../common/userDataProfile.ts';
import { IMainProcessService } from '../../ipc/common/mainProcessService.ts';

export class NativeUserDataProfileStorageService extends RemoteUserDataProfileStorageService {

	constructor(
		@IMainProcessService mainProcessService: IMainProcessService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IStorageService storageService: IStorageService,
		@ILogService logService: ILogService,
	) {
		super(false, mainProcessService, userDataProfilesService, storageService, logService);
	}
}

registerSingleton(IUserDataProfileStorageService, NativeUserDataProfileStorageService, InstantiationType.Delayed);
