/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILogService } from '../../log/common/log.ts';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.ts';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.ts';
import { AbstractExtensionsProfileScannerService } from '../common/extensionsProfileScannerService.ts';
import { IFileService } from '../../files/common/files.ts';
import { INativeEnvironmentService } from '../../environment/common/environment.ts';
import { URI } from '../../../base/common/uri.ts';

export class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
	constructor(
		@INativeEnvironmentService environmentService: INativeEnvironmentService,
		@IFileService fileService: IFileService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILogService logService: ILogService,
	) {
		super(URI.file(environmentService.extensionsPath), fileService, userDataProfilesService, uriIdentityService, logService);
	}
}
