/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IChannel } from '../../../../base/parts/ipc/common/ipc.ts';
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from '../common/extensionManagement.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IAllowedExtensionsService, ILocalExtension, InstallOptions } from '../../../../platform/extensionManagement/common/extensionManagement.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.ts';
import { joinPath } from '../../../../base/common/resources.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IDownloadService } from '../../../../platform/download/common/download.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { generateUuid } from '../../../../base/common/uuid.ts';
import { ProfileAwareExtensionManagementChannelClient } from '../common/extensionManagementChannelClient.ts';
import { ExtensionIdentifier, ExtensionType, isResolverExtension } from '../../../../platform/extensions/common/extensions.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';

export class NativeExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {

	constructor(
		channel: IChannel,
		@IProductService productService: IProductService,
		@IAllowedExtensionsService allowedExtensionsService: IAllowedExtensionsService,
		@IUserDataProfileService userDataProfileService: IUserDataProfileService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@IFileService private readonly fileService: IFileService,
		@IDownloadService private readonly downloadService: IDownloadService,
		@INativeWorkbenchEnvironmentService private readonly nativeEnvironmentService: INativeWorkbenchEnvironmentService,
		@ILogService private readonly logService: ILogService,
	) {
		super(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService);
	}

	protected filterEvent(profileLocation: URI, isApplicationScoped: boolean): boolean {
		return isApplicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
	}

	override async install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension> {
		const { location, cleanup } = await this.downloadVsix(vsix);
		try {
			return await super.install(location, options);
		} finally {
			await cleanup();
		}
	}

	private async downloadVsix(vsix: URI): Promise<{ location: URI; cleanup: () => Promise<void> }> {
		if (vsix.scheme === Schemas.file) {
			return { location: vsix, async cleanup() { } };
		}
		this.logService.trace('Downloading extension from', vsix.toString());
		const location = joinPath(this.nativeEnvironmentService.extensionsDownloadLocation, generateUuid());
		await this.downloadService.download(vsix, location);
		this.logService.info('Downloaded extension to', location.toString());
		const cleanup = async () => {
			try {
				await this.fileService.del(location);
			} catch (error) {
				this.logService.error(error);
			}
		};
		return { location, cleanup };
	}

	protected override async switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent> {
		if (this.nativeEnvironmentService.remoteAuthority) {
			const previousInstalledExtensions = await this.getInstalled(ExtensionType.User, previousProfileLocation);
			const resolverExtension = previousInstalledExtensions.find(e => isResolverExtension(e.manifest, this.nativeEnvironmentService.remoteAuthority));
			if (resolverExtension) {
				if (!preserveExtensions) {
					preserveExtensions = [];
				}
				preserveExtensions.push(new ExtensionIdentifier(resolverExtension.identifier.id));
			}
		}
		return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
	}
}
