/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStringDictionary } from '../../../base/common/collections.ts';
import { NativeParsedArgs } from '../../environment/common/argv.ts';
import { ILoggerResource, LogLevel } from '../../log/common/log.ts';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.ts';
import { PolicyDefinition, PolicyValue } from '../../policy/common/policy.ts';
import { UriComponents, UriDto } from '../../../base/common/uri.ts';

export interface ISharedProcessConfiguration {
	readonly machineId: string;

	readonly sqmId: string;

	readonly devDeviceId: string;

	readonly codeCachePath: string | undefined;

	readonly args: NativeParsedArgs;

	readonly logLevel: LogLevel;

	readonly loggers: UriDto<ILoggerResource>[];

	readonly profiles: {
		readonly home: UriComponents;
		readonly all: readonly UriDto<IUserDataProfile>[];
	};

	readonly policiesData?: IStringDictionary<{ definition: PolicyDefinition; value: PolicyValue }>;
}
