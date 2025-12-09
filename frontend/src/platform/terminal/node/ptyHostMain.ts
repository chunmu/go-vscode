/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DefaultURITransformer } from '../../../base/common/uriIpc.ts';
import { ProxyChannel } from '../../../base/parts/ipc/common/ipc.ts';
import { Server as ChildProcessServer } from '../../../base/parts/ipc/node/ipc.cp.ts';
import { Server as UtilityProcessServer } from '../../../base/parts/ipc/node/ipc.mp.ts';
import { localize } from '../../../nls.ts';
import { OPTIONS, parseArgs } from '../../environment/node/argv.ts';
import { NativeEnvironmentService } from '../../environment/node/environmentService.ts';
import { getLogLevel } from '../../log/common/log.ts';
import { LoggerChannel } from '../../log/common/logIpc.ts';
import { LogService } from '../../log/common/logService.ts';
import { LoggerService } from '../../log/node/loggerService.ts';
import product from '../../product/common/product.ts';
import { IProductService } from '../../product/common/productService.ts';
import { IReconnectConstants, TerminalIpcChannels } from '../common/terminal.ts';
import { HeartbeatService } from './heartbeatService.ts';
import { PtyService } from './ptyService.ts';
import { isUtilityProcess } from '../../../base/parts/sandbox/node/electronTypes.ts';
import { timeout } from '../../../base/common/async.ts';
import { DisposableStore } from '../../../base/common/lifecycle.ts';

startPtyHost();

async function startPtyHost() {
	// Parse environment variables
	const startupDelay = parseInt(process.env.VSCODE_STARTUP_DELAY ?? '0');
	const simulatedLatency = parseInt(process.env.VSCODE_LATENCY ?? '0');
	const reconnectConstants: IReconnectConstants = {
		graceTime: parseInt(process.env.VSCODE_RECONNECT_GRACE_TIME || '0'),
		shortGraceTime: parseInt(process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME || '0'),
		scrollback: parseInt(process.env.VSCODE_RECONNECT_SCROLLBACK || '100')
	};

	// Sanitize environment
	delete process.env.VSCODE_RECONNECT_GRACE_TIME;
	delete process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME;
	delete process.env.VSCODE_RECONNECT_SCROLLBACK;
	delete process.env.VSCODE_LATENCY;
	delete process.env.VSCODE_STARTUP_DELAY;

	// Delay startup if needed, this must occur before RPC is setup to avoid the channel from timing
	// out.
	if (startupDelay) {
		await timeout(startupDelay);
	}

	// Setup RPC
	const _isUtilityProcess = isUtilityProcess(process);
	let server: ChildProcessServer<string> | UtilityProcessServer;
	if (_isUtilityProcess) {
		server = new UtilityProcessServer();
	} else {
		server = new ChildProcessServer(TerminalIpcChannels.PtyHost);
	}

	// Services
	const productService: IProductService = { _serviceBrand: undefined, ...product };
	const environmentService = new NativeEnvironmentService(parseArgs(process.argv, OPTIONS), productService);
	const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
	server.registerChannel(TerminalIpcChannels.Logger, new LoggerChannel(loggerService, () => DefaultURITransformer));
	const logger = loggerService.createLogger('ptyhost', { name: localize('ptyHost', "Pty Host") });
	const logService = new LogService(logger);

	// Log developer config
	if (startupDelay) {
		logService.warn(`Pty Host startup is delayed ${startupDelay}ms`);
	}
	if (simulatedLatency) {
		logService.warn(`Pty host is simulating ${simulatedLatency}ms latency`);
	}

	const disposables = new DisposableStore();

	// Heartbeat responsiveness tracking
	const heartbeatService = new HeartbeatService();
	server.registerChannel(TerminalIpcChannels.Heartbeat, ProxyChannel.fromService(heartbeatService, disposables));

	// Init pty service
	const ptyService = new PtyService(logService, productService, reconnectConstants, simulatedLatency);
	const ptyServiceChannel = ProxyChannel.fromService(ptyService, disposables);
	server.registerChannel(TerminalIpcChannels.PtyHost, ptyServiceChannel);

	// Register a channel for direct communication via Message Port
	if (_isUtilityProcess) {
		server.registerChannel(TerminalIpcChannels.PtyHostWindow, ptyServiceChannel);
	}

	// Clean up
	process.once('exit', () => {
		logService.trace('Pty host exiting');
		logService.dispose();
		heartbeatService.dispose();
		ptyService.dispose();
	});
}
