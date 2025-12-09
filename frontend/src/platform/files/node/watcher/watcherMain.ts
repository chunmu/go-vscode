/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.ts';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.ts';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.ts';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.ts';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.ts';
import { UniversalWatcher } from './watcher.ts';

let server: ChildProcessServer<string> | UtilityProcessServer;
if (isUtilityProcess(process)) {
	server = new UtilityProcessServer();
} else {
	server = new ChildProcessServer('watcher');
}

const service = new UniversalWatcher();
server.registerChannel('watcher', ProxyChannel.fromService(service, new DisposableStore()));
