/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { generateUuid } from '../../../../base/common/uuid.ts';
import { ILocalExtension, IExtensionGalleryService, InstallOptions, IAllowedExtensionsService } from '../../../../platform/extensionManagement/common/extensionManagement.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ExtensionManagementService as BaseExtensionManagementService } from '../common/extensionManagementService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IExtensionManagementServer, IExtensionManagementServerService, IWorkbenchExtensionManagementService } from '../common/extensionManagement.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IDownloadService } from '../../../../platform/download/common/download.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { joinPath } from '../../../../base/common/resources.ts';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.ts';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.ts';
import { IExtensionManifestPropertiesService } from '../../extensions/common/extensionManifestPropertiesService.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.ts';
import { IExtensionsScannerService } from '../../../../platform/extensionManagement/common/extensionsScannerService.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';

export class ExtensionManagementService extends BaseExtensionManagementService {

	constructor(
		@INativeWorkbenchEnvironmentService private readonly environmentService: INativeWorkbenchEnvironmentService,
		@IExtensionManagementServerService extensionManagementServerService: IExtensionManagementServerService,
		@IExtensionGalleryService extensionGalleryService: IExtensionGalleryService,
		@IUserDataProfileService userDataProfileService: IUserDataProfileService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IConfigurationService configurationService: IConfigurationService,
		@IProductService productService: IProductService,
		@IDownloadService downloadService: IDownloadService,
		@IUserDataSyncEnablementService userDataSyncEnablementService: IUserDataSyncEnablementService,
		@IDialogService dialogService: IDialogService,
		@IWorkspaceTrustRequestService workspaceTrustRequestService: IWorkspaceTrustRequestService,
		@IExtensionManifestPropertiesService extensionManifestPropertiesService: IExtensionManifestPropertiesService,
		@IFileService fileService: IFileService,
		@ILogService logService: ILogService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IExtensionsScannerService extensionsScannerService: IExtensionsScannerService,
		@IAllowedExtensionsService allowedExtensionsService: IAllowedExtensionsService,
		@IStorageService storageService: IStorageService,
		@ITelemetryService telemetryService: ITelemetryService,
	) {
		super(
			extensionManagementServerService,
			extensionGalleryService,
			userDataProfileService,
			userDataProfilesService,
			configurationService,
			productService,
			downloadService,
			userDataSyncEnablementService,
			dialogService,
			workspaceTrustRequestService,
			extensionManifestPropertiesService,
			fileService,
			logService,
			instantiationService,
			extensionsScannerService,
			allowedExtensionsService,
			storageService,
			telemetryService
		);
	}

	protected override async installVSIXInServer(vsix: URI, server: IExtensionManagementServer, options: InstallOptions | undefined): Promise<ILocalExtension> {
		if (vsix.scheme === Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
			const downloadedLocation = joinPath(this.environmentService.tmpDir, generateUuid());
			await this.downloadService.download(vsix, downloadedLocation);
			vsix = downloadedLocation;
		}
		return super.installVSIXInServer(vsix, server, options);
	}
}

registerSingleton(IWorkbenchExtensionManagementService, ExtensionManagementService, InstantiationType.Delayed);
