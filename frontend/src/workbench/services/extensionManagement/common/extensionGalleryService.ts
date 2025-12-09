/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAllowedExtensionsService, IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IRequestService } from '../../../../platform/request/common/request.ts';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.ts';
import { AbstractExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionGalleryService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IExtensionGalleryManifestService } from '../../../../platform/extensionManagement/common/extensionGalleryManifest.ts';

export class WorkbenchExtensionGalleryService extends AbstractExtensionGalleryService {
	constructor(
		@IStorageService storageService: IStorageService,
		@IRequestService requestService: IRequestService,
		@ILogService logService: ILogService,
		@IEnvironmentService environmentService: IEnvironmentService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IFileService fileService: IFileService,
		@IProductService productService: IProductService,
		@IConfigurationService configurationService: IConfigurationService,
		@IAllowedExtensionsService allowedExtensionsService: IAllowedExtensionsService,
		@IExtensionGalleryManifestService extensionGalleryManifestService: IExtensionGalleryManifestService,
	) {
		super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService);
	}
}

registerSingleton(IExtensionGalleryService, WorkbenchExtensionGalleryService, InstantiationType.Delayed);
