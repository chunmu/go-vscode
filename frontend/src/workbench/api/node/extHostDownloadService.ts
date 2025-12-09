/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { join } from '../../../base/common/path.ts';
import { tmpdir } from 'os';
import { generateUuid } from '../../../base/common/uuid.ts';
import { IExtHostCommands } from '../common/extHostCommands.ts';
import { Disposable } from '../../../base/common/lifecycle.ts';
import { MainContext } from '../common/extHost.protocol.ts';
import { URI } from '../../../base/common/uri.ts';
import { IExtHostRpcService } from '../common/extHostRpcService.ts';

export class ExtHostDownloadService extends Disposable {

	constructor(
		@IExtHostRpcService extHostRpc: IExtHostRpcService,
		@IExtHostCommands commands: IExtHostCommands
	) {
		super();

		const proxy = extHostRpc.getProxy(MainContext.MainThreadDownloadService);

		commands.registerCommand(false, '_workbench.downloadResource', async (resource: URI): Promise<any> => {
			const location = URI.file(join(tmpdir(), generateUuid()));
			await proxy.$download(resource, location);
			return location;
		});
	}
}
