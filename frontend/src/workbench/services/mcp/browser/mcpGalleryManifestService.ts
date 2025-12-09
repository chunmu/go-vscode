/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMcpGalleryManifestService } from '../../../../platform/mcp/common/mcpGalleryManifest.ts';
import { McpGalleryManifestService as McpGalleryManifestService } from '../../../../platform/mcp/common/mcpGalleryManifestService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.ts';
import { IRequestService } from '../../../../platform/request/common/request.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';

class WebMcpGalleryManifestService extends McpGalleryManifestService implements IMcpGalleryManifestService {

	constructor(
		@IProductService productService: IProductService,
		@IRequestService requestService: IRequestService,
		@ILogService logService: ILogService,
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
	) {
		super(productService, requestService, logService);
		const remoteConnection = remoteAgentService.getConnection();
		if (remoteConnection) {
			const channel = remoteConnection.getChannel('mcpGalleryManifest');
			this.getMcpGalleryManifest().then(manifest => {
				channel.call('setMcpGalleryManifest', [manifest]);
				this._register(this.onDidChangeMcpGalleryManifest(manifest => channel.call('setMcpGalleryManifest', [manifest])));
			});
		}
	}

}

registerSingleton(IMcpGalleryManifestService, WebMcpGalleryManifestService, InstantiationType.Delayed);
