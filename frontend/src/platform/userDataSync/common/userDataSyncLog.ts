/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { joinPath } from '../../../base/common/resources.ts';
import { localize } from '../../../nls.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { AbstractLogger, ILogger, ILoggerService } from '../../log/common/log.ts';
import { IUserDataSyncLogService, USER_DATA_SYNC_LOG_ID } from './userDataSync.ts';

export class UserDataSyncLogService extends AbstractLogger implements IUserDataSyncLogService {

	declare readonly _serviceBrand: undefined;
	private readonly logger: ILogger;

	constructor(
		@ILoggerService loggerService: ILoggerService,
		@IEnvironmentService environmentService: IEnvironmentService,
	) {
		super();
		this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${USER_DATA_SYNC_LOG_ID}.log`), { id: USER_DATA_SYNC_LOG_ID, name: localize('userDataSyncLog', "Settings Sync") }));
	}

	trace(message: string, ...args: unknown[]): void {
		this.logger.trace(message, ...args);
	}

	debug(message: string, ...args: unknown[]): void {
		this.logger.debug(message, ...args);
	}

	info(message: string, ...args: unknown[]): void {
		this.logger.info(message, ...args);
	}

	warn(message: string, ...args: unknown[]): void {
		this.logger.warn(message, ...args);
	}

	error(message: string | Error, ...args: unknown[]): void {
		this.logger.error(message, ...args);
	}

	flush(): void {
		this.logger.flush();
	}

}
