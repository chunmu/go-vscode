/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../common/buffer.ts';
import { Event } from '../../../common/event.ts';
import { IDisposable } from '../../../common/lifecycle.ts';
import { IPCClient } from '../common/ipc.ts';
import { Protocol as ElectronProtocol } from '../common/ipc.electron.ts';
import { ipcRenderer } from '../../sandbox/electron-browser/globals.ts';

/**
 * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
 * provided from sandbox globals (via preload script).
 */
export class Client extends IPCClient implements IDisposable {

	private protocol: ElectronProtocol;

	private static createProtocol(): ElectronProtocol {
		const onMessage = Event.fromNodeEventEmitter<VSBuffer>(ipcRenderer, 'vscode:message', (_, message) => VSBuffer.wrap(message));
		ipcRenderer.send('vscode:hello');

		return new ElectronProtocol(ipcRenderer, onMessage);
	}

	constructor(id: string) {
		const protocol = Client.createProtocol();
		super(protocol, id);

		this.protocol = protocol;
	}

	override dispose(): void {
		this.protocol.disconnect();
		super.dispose();
	}
}
