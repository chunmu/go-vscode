/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.ts';
import { INativeEnvironmentService } from '../../environment/common/environment.ts';
import { IExtensionsProfileScannerService } from '../common/extensionsProfileScannerService.ts';
import { IExtensionsScannerService, NativeExtensionsScannerService, } from '../common/extensionsScannerService.ts';
import { IFileService } from '../../files/common/files.ts';
import { IInstantiationService } from '../../instantiation/common/instantiation.ts';
import { ILogService } from '../../log/common/log.ts';
import { IProductService } from '../../product/common/productService.ts';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.ts';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.ts';

export class ExtensionsScannerService extends NativeExtensionsScannerService implements IExtensionsScannerService {

	constructor(
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IExtensionsProfileScannerService extensionsProfileScannerService: IExtensionsProfileScannerService,
		@IFileService fileService: IFileService,
		@ILogService logService: ILogService,
		@INativeEnvironmentService environmentService: INativeEnvironmentService,
		@IProductService productService: IProductService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super(
			URI.file(environmentService.builtinExtensionsPath),
			URI.file(environmentService.extensionsPath),
			environmentService.userHome,
			userDataProfilesService.defaultProfile,
			userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
	}

}
