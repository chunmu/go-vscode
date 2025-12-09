/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.ts';
import { generateUuid } from '../../../base/common/uuid.ts';
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from '../common/log.ts';
import { SpdLogLogger } from './spdlogLog.ts';

export class LoggerService extends AbstractLoggerService implements ILoggerService {

	protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger {
		return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
	}
}
