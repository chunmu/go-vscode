/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { net } from 'electron';
import { CancellationToken } from '../../../base/common/cancellation.ts';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.ts';
import { IRawRequestFunction, RequestService as NodeRequestService } from '../node/requestService.ts';
import { IConfigurationService } from '../../configuration/common/configuration.ts';
import { INativeEnvironmentService } from '../../environment/common/environment.ts';
import { ILogService } from '../../log/common/log.ts';

function getRawRequest(options: IRequestOptions): IRawRequestFunction {
	// eslint-disable-next-line local/code-no-any-casts
	return net.request as any as IRawRequestFunction;
}

export class RequestService extends NodeRequestService {

	constructor(
		@IConfigurationService configurationService: IConfigurationService,
		@INativeEnvironmentService environmentService: INativeEnvironmentService,
		@ILogService logService: ILogService,
	) {
		super('local', configurationService, environmentService, logService);
	}

	override request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext> {
		return super.request({ ...(options || {}), getRawRequest, isChromiumNetwork: true }, token);
	}
}
