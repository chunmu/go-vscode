/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.ts';
import { OperatingSystem, OS } from '../../../../base/common/platform.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IRemoteAgentEnvironment } from '../../../../platform/remote/common/remoteAgentEnvironment.ts';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.ts';

export class TextResourcePropertiesService implements ITextResourcePropertiesService {

	declare readonly _serviceBrand: undefined;

	private remoteEnvironment: IRemoteAgentEnvironment | null = null;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@IStorageService private readonly storageService: IStorageService
	) {
		remoteAgentService.getEnvironment().then(remoteEnv => this.remoteEnvironment = remoteEnv);
	}

	getEOL(resource?: URI, language?: string): string {
		const eol = this.configurationService.getValue('files.eol', { overrideIdentifier: language, resource });
		if (eol && typeof eol === 'string' && eol !== 'auto') {
			return eol;
		}
		const os = this.getOS(resource);
		return os === OperatingSystem.Linux || os === OperatingSystem.Macintosh ? '\n' : '\r\n';
	}

	private getOS(resource?: URI): OperatingSystem {
		let os = OS;

		const remoteAuthority = this.environmentService.remoteAuthority;
		if (remoteAuthority) {
			if (resource && resource.scheme !== Schemas.file) {
				const osCacheKey = `resource.authority.os.${remoteAuthority}`;
				os = this.remoteEnvironment ? this.remoteEnvironment.os : /* Get it from cache */ this.storageService.getNumber(osCacheKey, StorageScope.WORKSPACE, OS);
				this.storageService.store(osCacheKey, os, StorageScope.WORKSPACE, StorageTarget.MACHINE);
			}
		}

		return os;
	}
}

registerSingleton(ITextResourcePropertiesService, TextResourcePropertiesService, InstantiationType.Delayed);
