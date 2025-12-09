/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILogService } from '../../../../platform/log/common/log.ts';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { AbstractExtensionsProfileScannerService, IExtensionsProfileScannerService } from '../../../../platform/extensionManagement/common/extensionsProfileScannerService.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';

export class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
	constructor(
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IFileService fileService: IFileService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILogService logService: ILogService,
	) {
		super(environmentService.userRoamingDataHome, fileService, userDataProfilesService, uriIdentityService, logService);
	}
}

registerSingleton(IExtensionsProfileScannerService, ExtensionsProfileScannerService, InstantiationType.Delayed);
