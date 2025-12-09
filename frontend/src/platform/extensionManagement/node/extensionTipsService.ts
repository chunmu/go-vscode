/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IExtensionManagementService } from '../common/extensionManagement.ts';
import { IFileService } from '../../files/common/files.ts';
import { IProductService } from '../../product/common/productService.ts';
import { INativeEnvironmentService } from '../../environment/common/environment.ts';
import { IExtensionRecommendationNotificationService } from '../../extensionRecommendations/common/extensionRecommendations.ts';
import { INativeHostService } from '../../native/common/native.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { ITelemetryService } from '../../telemetry/common/telemetry.ts';
import { AbstractNativeExtensionTipsService } from '../common/extensionTipsService.ts';

export class ExtensionTipsService extends AbstractNativeExtensionTipsService {

	constructor(
		@INativeEnvironmentService environmentService: INativeEnvironmentService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IExtensionManagementService extensionManagementService: IExtensionManagementService,
		@IStorageService storageService: IStorageService,
		@INativeHostService nativeHostService: INativeHostService,
		@IExtensionRecommendationNotificationService extensionRecommendationNotificationService: IExtensionRecommendationNotificationService,
		@IFileService fileService: IFileService,
		@IProductService productService: IProductService,
	) {
		super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
	}
}
