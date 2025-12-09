/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IHeaders } from '../../../base/parts/request/common/request.ts';
import { IConfigurationService } from '../../configuration/common/configuration.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { getServiceMachineId } from './serviceMachineId.ts';
import { IFileService } from '../../files/common/files.ts';
import { IProductService } from '../../product/common/productService.ts';
import { IStorageService } from '../../storage/common/storage.ts';
import { ITelemetryService, TelemetryLevel } from '../../telemetry/common/telemetry.ts';
import { getTelemetryLevel, supportsTelemetry } from '../../telemetry/common/telemetryUtils.ts';

export async function resolveMarketplaceHeaders(version: string,
	productService: IProductService,
	environmentService: IEnvironmentService,
	configurationService: IConfigurationService,
	fileService: IFileService,
	storageService: IStorageService | undefined,
	telemetryService: ITelemetryService): Promise<IHeaders> {

	const headers: IHeaders = {
		'X-Market-Client-Id': `VSCode ${version}`,
		'User-Agent': `VSCode ${version} (${productService.nameShort})`
	};

	if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === TelemetryLevel.USAGE) {
		const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
		headers['X-Market-User-Id'] = serviceMachineId;
		// Send machineId as VSCode-SessionId so we can correlate telemetry events across different services
		// machineId can be undefined sometimes (eg: when launching from CLI), so send serviceMachineId instead otherwise
		// Marketplace will reject the request if there is no VSCode-SessionId header
		headers['VSCode-SessionId'] = telemetryService.machineId || serviceMachineId;
	}

	return headers;
}
