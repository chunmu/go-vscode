/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.ts';
import { InstantiationType, registerSingleton } from '../../instantiation/common/extensions.ts';
import { IFileService } from '../../files/common/files.ts';
import { IProductService } from '../../product/common/productService.ts';
import { asTextOrError, IRequestService } from '../../request/common/request.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { IConfigurationService } from '../../configuration/common/configuration.ts';
import { CancellationToken } from '../../../base/common/cancellation.ts';
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from './extensionResourceLoader.ts';
import { IExtensionGalleryManifestService } from '../../extensionManagement/common/extensionGalleryManifest.ts';
import { ILogService } from '../../log/common/log.ts';

export class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {

	constructor(
		@IFileService fileService: IFileService,
		@IStorageService storageService: IStorageService,
		@IProductService productService: IProductService,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IConfigurationService configurationService: IConfigurationService,
		@IExtensionGalleryManifestService extensionGalleryManifestService: IExtensionGalleryManifestService,
		@IRequestService private readonly _requestService: IRequestService,
		@ILogService logService: ILogService,
	) {
		super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
	}

	async readExtensionResource(uri: URI): Promise<string> {
		if (await this.isExtensionGalleryResource(uri)) {
			const headers = await this.getExtensionGalleryRequestHeaders();
			const requestContext = await this._requestService.request({ url: uri.toString(), headers }, CancellationToken.None);
			return (await asTextOrError(requestContext)) || '';
		}
		const result = await this._fileService.readFile(uri);
		return result.value.toString();
	}

}

registerSingleton(IExtensionResourceLoaderService, ExtensionResourceLoaderService, InstantiationType.Delayed);
