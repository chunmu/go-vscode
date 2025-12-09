/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { ISharedProcessService } from '../../../../platform/ipc/electron-browser/services.ts';
import { IChannel } from '../../../../base/parts/ipc/common/ipc.ts';
import { IExtensionTipsService, IExecutableBasedExtensionTip, IConfigBasedExtensionTip } from '../../../../platform/extensionManagement/common/extensionManagement.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionTipsService.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { Schemas } from '../../../../base/common/network.ts';

class NativeExtensionTipsService extends ExtensionTipsService implements IExtensionTipsService {

	private readonly channel: IChannel;

	constructor(
		@IFileService fileService: IFileService,
		@IProductService productService: IProductService,
		@ISharedProcessService sharedProcessService: ISharedProcessService
	) {
		super(fileService, productService);
		this.channel = sharedProcessService.getChannel('extensionTipsService');
	}

	override getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]> {
		if (folder.scheme === Schemas.file) {
			return this.channel.call<IConfigBasedExtensionTip[]>('getConfigBasedTips', [folder]);
		}
		return super.getConfigBasedTips(folder);
	}

	override getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]> {
		return this.channel.call<IExecutableBasedExtensionTip[]>('getImportantExecutableBasedTips');
	}

	override getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]> {
		return this.channel.call<IExecutableBasedExtensionTip[]>('getOtherExecutableBasedTips');
	}

}

registerSingleton(IExtensionTipsService, NativeExtensionTipsService, InstantiationType.Delayed);
