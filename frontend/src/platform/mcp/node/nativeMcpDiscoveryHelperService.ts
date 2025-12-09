/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { homedir } from 'os';
import { platform } from '../../../base/common/platform.ts';
import { URI } from '../../../base/common/uri.ts';
import { INativeMcpDiscoveryData, INativeMcpDiscoveryHelperService } from '../common/nativeMcpDiscoveryHelper.ts';

export class NativeMcpDiscoveryHelperService implements INativeMcpDiscoveryHelperService {
	declare readonly _serviceBrand: undefined;

	constructor() { }

	load(): Promise<INativeMcpDiscoveryData> {
		return Promise.resolve({
			platform,
			homedir: URI.file(homedir()),
			winAppData: this.uriFromEnvVariable('APPDATA'),
			xdgHome: this.uriFromEnvVariable('XDG_CONFIG_HOME'),
		});
	}

	private uriFromEnvVariable(varName: string) {
		const envVar = process.env[varName];
		if (!envVar) {
			return undefined;
		}
		return URI.file(envVar);
	}
}

