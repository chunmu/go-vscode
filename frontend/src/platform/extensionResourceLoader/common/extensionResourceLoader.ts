/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isWeb } from '../../../base/common/platform.ts';
import { format2 } from '../../../base/common/strings.ts';
import { URI } from '../../../base/common/uri.ts';
import { IConfigurationService } from '../../configuration/common/configuration.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { IFileService } from '../../files/common/files.ts';
import { createDecorator } from '../../instantiation/common/instantiation.ts';
import { IProductService } from '../../product/common/productService.ts';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { TelemetryLevel } from '../../telemetry/common/telemetry.ts';
import { getTelemetryLevel, supportsTelemetry } from '../../telemetry/common/telemetryUtils.ts';
import { RemoteAuthorities } from '../../../base/common/network.ts';
import { TargetPlatform } from '../../extensions/common/extensions.ts';
import { ExtensionGalleryResourceType, getExtensionGalleryManifestResourceUri, IExtensionGalleryManifest, IExtensionGalleryManifestService } from '../../extensionManagement/common/extensionGalleryManifest.ts';
import { ILogService } from '../../log/common/log.ts';
import { Disposable } from '../../../base/common/lifecycle.ts';

const WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT = '/web-extension-resource/';

export const IExtensionResourceLoaderService = createDecorator<IExtensionResourceLoaderService>('extensionResourceLoaderService');

/**
 * A service useful for reading resources from within extensions.
 */
export interface IExtensionResourceLoaderService {
	readonly _serviceBrand: undefined;

	/**
	 * Read a certain resource within an extension.
	 */
	readExtensionResource(uri: URI): Promise<string>;

	/**
	 * Returns whether the gallery provides extension resources.
	 */
	supportsExtensionGalleryResources(): Promise<boolean>;

	/**
	 * Return true if the given URI is a extension gallery resource.
	 */
	isExtensionGalleryResource(uri: URI): Promise<boolean>;

	/**
	 * Computes the URL of a extension gallery resource. Returns `undefined` if gallery does not provide extension resources.
	 */
	getExtensionGalleryResourceURL(galleryExtension: { publisher: string; name: string; version: string; targetPlatform?: TargetPlatform }, path?: string): Promise<URI | undefined>;
}

export function migratePlatformSpecificExtensionGalleryResourceURL(resource: URI, targetPlatform: TargetPlatform): URI | undefined {
	if (resource.query !== `target=${targetPlatform}`) {
		return undefined;
	}
	const paths = resource.path.split('/');
	if (!paths[3]) {
		return undefined;
	}
	paths[3] = `${paths[3]}+${targetPlatform}`;
	return resource.with({ query: null, path: paths.join('/') });
}

export abstract class AbstractExtensionResourceLoaderService extends Disposable implements IExtensionResourceLoaderService {

	readonly _serviceBrand: undefined;

	private readonly _initPromise: Promise<void>;

	private _extensionGalleryResourceUrlTemplate: string | undefined;
	private _extensionGalleryAuthority: string | undefined;

	constructor(
		protected readonly _fileService: IFileService,
		private readonly _storageService: IStorageService,
		private readonly _productService: IProductService,
		private readonly _environmentService: IEnvironmentService,
		private readonly _configurationService: IConfigurationService,
		private readonly _extensionGalleryManifestService: IExtensionGalleryManifestService,
		protected readonly _logService: ILogService,
	) {
		super();
		this._initPromise = this._init();
	}

	private async _init(): Promise<void> {
		try {
			const manifest = await this._extensionGalleryManifestService.getExtensionGalleryManifest();
			this.resolve(manifest);
			this._register(this._extensionGalleryManifestService.onDidChangeExtensionGalleryManifest(() => this.resolve(manifest)));
		} catch (error) {
			this._logService.error(error);
		}
	}

	private resolve(manifest: IExtensionGalleryManifest | null): void {
		this._extensionGalleryResourceUrlTemplate = manifest ? getExtensionGalleryManifestResourceUri(manifest, ExtensionGalleryResourceType.ExtensionResourceUri) : undefined;
		this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(URI.parse(this._extensionGalleryResourceUrlTemplate)) : undefined;
	}

	public async supportsExtensionGalleryResources(): Promise<boolean> {
		await this._initPromise;
		return this._extensionGalleryResourceUrlTemplate !== undefined;
	}

	public async getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }: { publisher: string; name: string; version: string; targetPlatform?: TargetPlatform }, path?: string): Promise<URI | undefined> {
		await this._initPromise;
		if (this._extensionGalleryResourceUrlTemplate) {
			const uri = URI.parse(format2(this._extensionGalleryResourceUrlTemplate, {
				publisher,
				name,
				version: targetPlatform !== undefined
					&& targetPlatform !== TargetPlatform.UNDEFINED
					&& targetPlatform !== TargetPlatform.UNKNOWN
					&& targetPlatform !== TargetPlatform.UNIVERSAL
					? `${version}+${targetPlatform}`
					: version,
				path: 'extension'
			}));
			return this._isWebExtensionResourceEndPoint(uri) ? uri.with({ scheme: RemoteAuthorities.getPreferredWebSchema() }) : uri;
		}
		return undefined;
	}

	public abstract readExtensionResource(uri: URI): Promise<string>;

	async isExtensionGalleryResource(uri: URI): Promise<boolean> {
		await this._initPromise;
		return !!this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri);
	}

	protected async getExtensionGalleryRequestHeaders(): Promise<Record<string, string>> {
		const headers: Record<string, string> = {
			'X-Client-Name': `${this._productService.applicationName}${isWeb ? '-web' : ''}`,
			'X-Client-Version': this._productService.version
		};
		if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === TelemetryLevel.USAGE) {
			headers['X-Machine-Id'] = await this._getServiceMachineId();
		}
		if (this._productService.commit) {
			headers['X-Client-Commit'] = this._productService.commit;
		}
		return headers;
	}

	private _serviceMachineIdPromise: Promise<string> | undefined;
	private _getServiceMachineId(): Promise<string> {
		if (!this._serviceMachineIdPromise) {
			this._serviceMachineIdPromise = getServiceMachineId(this._environmentService, this._fileService, this._storageService);
		}
		return this._serviceMachineIdPromise;
	}

	private _getExtensionGalleryAuthority(uri: URI): string | undefined {
		if (this._isWebExtensionResourceEndPoint(uri)) {
			return uri.authority;
		}
		const index = uri.authority.indexOf('.');
		return index !== -1 ? uri.authority.substring(index + 1) : undefined;
	}

	protected _isWebExtensionResourceEndPoint(uri: URI): boolean {
		const uriPath = uri.path, serverRootPath = RemoteAuthorities.getServerRootPath();
		// test if the path starts with the server root path followed by the web extension resource end point segment
		return uriPath.startsWith(serverRootPath) && uriPath.startsWith(WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT, serverRootPath.length);
	}

}
