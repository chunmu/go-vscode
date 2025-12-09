/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { IFileService } from '../../files/common/files.ts';
import { ILogService } from '../../log/common/log.ts';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.ts';
import { IGalleryMcpServer, IMcpGalleryService, IMcpManagementService, InstallOptions, ILocalMcpServer, RegistryType, IInstallableMcpServer } from '../common/mcpManagement.ts';
import { McpUserResourceManagementService as CommonMcpUserResourceManagementService, McpManagementService as CommonMcpManagementService } from '../common/mcpManagementService.ts';
import { IMcpResourceScannerService } from '../common/mcpResourceScannerService.ts';

export class McpUserResourceManagementService extends CommonMcpUserResourceManagementService {
	constructor(
		mcpResource: URI,
		@IMcpGalleryService mcpGalleryService: IMcpGalleryService,
		@IFileService fileService: IFileService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILogService logService: ILogService,
		@IMcpResourceScannerService mcpResourceScannerService: IMcpResourceScannerService,
		@IEnvironmentService environmentService: IEnvironmentService,
	) {
		super(mcpResource, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, environmentService);
	}

	override async installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer> {
		this.logService.trace('MCP Management Service: installGallery', server.name, server.galleryUrl);

		this._onInstallMcpServer.fire({ name: server.name, mcpResource: this.mcpResource });

		try {
			const manifest = await this.updateMetadataFromGallery(server);
			const packageType = options?.packageType ?? manifest.packages?.[0]?.registryType ?? RegistryType.REMOTE;

			const { mcpServerConfiguration, notices } = this.getMcpServerConfigurationFromManifest(manifest, packageType);

			if (notices.length > 0) {
				this.logService.warn(`MCP Management Service: Warnings while installing ${server.name}`, notices);
			}

			const installable: IInstallableMcpServer = {
				name: server.name,
				config: {
					...mcpServerConfiguration.config,
					gallery: server.galleryUrl ?? true,
					version: server.version
				},
				inputs: mcpServerConfiguration.inputs
			};

			await this.mcpResourceScannerService.addMcpServers([installable], this.mcpResource, this.target);

			await this.updateLocal();
			const local = (await this.getInstalled()).find(s => s.name === server.name);
			if (!local) {
				throw new Error(`Failed to install MCP server: ${server.name}`);
			}
			return local;
		} catch (e) {
			this._onDidInstallMcpServers.fire([{ name: server.name, source: server, error: e, mcpResource: this.mcpResource }]);
			throw e;
		}
	}

}

export class McpManagementService extends CommonMcpManagementService implements IMcpManagementService {
	protected override createMcpResourceManagementService(mcpResource: URI): McpUserResourceManagementService {
		return this.instantiationService.createInstance(McpUserResourceManagementService, mcpResource);
	}
}
