/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ConsoleLogger, ILogger } from '../../../../platform/log/common/log.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { LoggerChannelClient } from '../../../../platform/log/common/logIpc.ts';
import { DisposableStore } from '../../../../base/common/lifecycle.ts';
import { windowLogGroup, windowLogId } from '../common/logConstants.ts';
import { LogService } from '../../../../platform/log/common/logService.ts';

export class NativeLogService extends LogService {

	constructor(loggerService: LoggerChannelClient, environmentService: INativeWorkbenchEnvironmentService) {

		const disposables = new DisposableStore();

		const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: windowLogId, name: windowLogGroup.name, group: windowLogGroup }));

		let consoleLogger: ILogger;
		if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
			// Extension development test CLI: forward everything to main side
			consoleLogger = loggerService.createConsoleMainLogger();
		} else {
			// Normal mode: Log to console
			consoleLogger = new ConsoleLogger(fileLogger.getLevel());
		}

		super(fileLogger, [consoleLogger]);

		this._register(disposables);
	}
}
