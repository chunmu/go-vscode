/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IBuiltinExtensionsScannerService, ExtensionType, IExtensionManifest, TargetPlatform, IExtension } from '../../../../platform/extensions/common/extensions.ts';
import { isWeb, Language } from '../../../../base/common/platform.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { getGalleryExtensionId } from '../../../../platform/extensionManagement/common/extensionManagementUtil.ts';
import { builtinExtensionsPath, FileAccess } from '../../../../base/common/network.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { ITranslations, localizeManifest } from '../../../../platform/extensionManagement/common/extensionNls.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { mainWindow } from '../../../../base/browser/window.ts';

interface IBundledExtension {
	extensionPath: string;
	packageJSON: IExtensionManifest;
	packageNLS?: ITranslations;
	readmePath?: string;
	changelogPath?: string;
}

export class BuiltinExtensionsScannerService implements IBuiltinExtensionsScannerService {

	declare readonly _serviceBrand: undefined;

	private readonly builtinExtensionsPromises: Promise<IExtension>[] = [];

	private nlsUrl: URI | undefined;

	constructor(
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@IExtensionResourceLoaderService private readonly extensionResourceLoaderService: IExtensionResourceLoaderService,
		@IProductService productService: IProductService,
		@ILogService private readonly logService: ILogService
	) {
		if (isWeb) {
			const nlsBaseUrl = productService.extensionsGallery?.nlsBaseUrl;
			// Only use the nlsBaseUrl if we are using a language other than the default, English.
			if (nlsBaseUrl && productService.commit && !Language.isDefaultVariant()) {
				this.nlsUrl = URI.joinPath(URI.parse(nlsBaseUrl), productService.commit, productService.version, Language.value());
			}

			const builtinExtensionsServiceUrl = FileAccess.asBrowserUri(builtinExtensionsPath);
			if (builtinExtensionsServiceUrl) {
				let bundledExtensions: IBundledExtension[] = [];

				if (environmentService.isBuilt) {
					// Built time configuration (do NOT modify)
					bundledExtensions = [/*BUILD->INSERT_BUILTIN_EXTENSIONS*/];
				} else {
					// Find builtin extensions by checking for DOM
					// eslint-disable-next-line no-restricted-syntax
					const builtinExtensionsElement = mainWindow.document.getElementById('vscode-workbench-builtin-extensions');
					const builtinExtensionsElementAttribute = builtinExtensionsElement ? builtinExtensionsElement.getAttribute('data-settings') : undefined;
					if (builtinExtensionsElementAttribute) {
						try {
							bundledExtensions = JSON.parse(builtinExtensionsElementAttribute);
						} catch (error) { /* ignore error*/ }
					}
				}

				this.builtinExtensionsPromises = bundledExtensions.map(async e => {
					const id = getGalleryExtensionId(e.packageJSON.publisher, e.packageJSON.name);
					return {
						identifier: { id },
						location: uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.extensionPath),
						type: ExtensionType.System,
						isBuiltin: true,
						manifest: e.packageNLS ? await this.localizeManifest(id, e.packageJSON, e.packageNLS) : e.packageJSON,
						readmeUrl: e.readmePath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.readmePath) : undefined,
						changelogUrl: e.changelogPath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.changelogPath) : undefined,
						targetPlatform: TargetPlatform.WEB,
						validations: [],
						isValid: true,
						preRelease: false,
					};
				});
			}
		}
	}

	async scanBuiltinExtensions(): Promise<IExtension[]> {
		return [...await Promise.all(this.builtinExtensionsPromises)];
	}

	private async localizeManifest(extensionId: string, manifest: IExtensionManifest, fallbackTranslations: ITranslations): Promise<IExtensionManifest> {
		if (!this.nlsUrl) {
			return localizeManifest(this.logService, manifest, fallbackTranslations);
		}
		// the `package` endpoint returns the translations in a key-value format similar to the package.nls.json file.
		const uri = URI.joinPath(this.nlsUrl, extensionId, 'package');
		try {
			const res = await this.extensionResourceLoaderService.readExtensionResource(uri);
			const json = JSON.parse(res.toString());
			return localizeManifest(this.logService, manifest, json, fallbackTranslations);
		} catch (e) {
			this.logService.error(e);
			return localizeManifest(this.logService, manifest, fallbackTranslations);
		}
	}
}

registerSingleton(IBuiltinExtensionsScannerService, BuiltinExtensionsScannerService, InstantiationType.Delayed);
