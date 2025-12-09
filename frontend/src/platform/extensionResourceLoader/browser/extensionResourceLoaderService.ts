/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.ts';
import { InstantiationType, registerSingleton } from '../../instantiation/common/extensions.ts';
import { IFileService } from '../../files/common/files.ts';
import { FileAccess, Schemas } from '../../../base/common/network.ts';
import { IProductService } from '../../product/common/productService.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { ILogService } from '../../log/common/log.ts';
import { IConfigurationService } from '../../configuration/common/configuration.ts';
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from '../common/extensionResourceLoader.ts';
import { IExtensionGalleryManifestService } from '../../extensionManagement/common/extensionGalleryManifest.ts';

class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {

	declare readonly _serviceBrand: undefined;

	constructor(
		@IFileService fileService: IFileService,
		@IStorageService storageService: IStorageService,
		@IProductService productService: IProductService,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IConfigurationService configurationService: IConfigurationService,
		@IExtensionGalleryManifestService extensionGalleryManifestService: IExtensionGalleryManifestService,
		@ILogService logService: ILogService,
	) {
		super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
	}

	async readExtensionResource(uri: URI): Promise<string> {
		uri = FileAccess.uriToBrowserUri(uri);

		if (uri.scheme !== Schemas.http && uri.scheme !== Schemas.https && uri.scheme !== Schemas.data) {
			const result = await this._fileService.readFile(uri);
			return result.value.toString();
		}

		const requestInit: RequestInit = {};
		if (await this.isExtensionGalleryResource(uri)) {
			requestInit.headers = await this.getExtensionGalleryRequestHeaders();
			requestInit.mode = 'cors'; /* set mode to cors so that above headers are always passed */
		}

		const response = await fetch(uri.toString(true), requestInit);
		if (response.status !== 200) {
			this._logService.info(`Request to '${uri.toString(true)}' failed with status code ${response.status}`);
			throw new Error(response.statusText);
		}
		return response.text();
	}
}

registerSingleton(IExtensionResourceLoaderService, ExtensionResourceLoaderService, InstantiationType.Delayed);
