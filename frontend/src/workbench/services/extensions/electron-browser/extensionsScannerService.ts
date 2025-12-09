/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.ts';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.ts';
import { IExtensionsProfileScannerService } from '../../../../platform/extensionManagement/common/extensionsProfileScannerService.ts';
import { IExtensionsScannerService, NativeExtensionsScannerService, } from '../../../../platform/extensionManagement/common/extensionsScannerService.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.ts';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.ts';

export class ExtensionsScannerService extends NativeExtensionsScannerService implements IExtensionsScannerService {

	constructor(
		@IUserDataProfileService userDataProfileService: IUserDataProfileService,
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
			userDataProfileService.currentProfile,
			userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
	}

}

registerSingleton(IExtensionsScannerService, ExtensionsScannerService, InstantiationType.Delayed);
