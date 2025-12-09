/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { IPathService, AbstractPathService } from '../common/pathService.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';

export class NativePathService extends AbstractPathService {

	constructor(
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IWorkspaceContextService contextService: IWorkspaceContextService
	) {
		super(environmentService.userHome, remoteAgentService, environmentService, contextService);
	}
}

registerSingleton(IPathService, NativePathService, InstantiationType.Delayed);
