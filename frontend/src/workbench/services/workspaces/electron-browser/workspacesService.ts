/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.ts';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.ts';
import { INativeHostService } from '../../../../platform/native/common/native.ts';

// @ts-expect-error: interface is implemented via proxy
export class NativeWorkspacesService implements IWorkspacesService {

	declare readonly _serviceBrand: undefined;

	constructor(
		@IMainProcessService mainProcessService: IMainProcessService,
		@INativeHostService nativeHostService: INativeHostService
	) {
		return ProxyChannel.toService<IWorkspacesService>(mainProcessService.getChannel('workspaces'), { context: nativeHostService.windowId });
	}
}

registerSingleton(IWorkspacesService, NativeWorkspacesService, InstantiationType.Delayed);
