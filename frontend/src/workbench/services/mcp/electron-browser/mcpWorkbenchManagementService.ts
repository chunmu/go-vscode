/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.ts';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.ts';
import { McpManagementChannelClient } from '../../../../platform/mcp/common/mcpManagementIpc.ts';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.ts';
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.ts';
import { WorkbenchMcpManagementService as BaseWorkbenchMcpManagementService, IWorkbenchMcpManagementService } from '../common/mcpWorkbenchManagementService.ts';
import { ISharedProcessService } from '../../../../platform/ipc/electron-browser/services.ts';
import { IAllowedMcpServersService } from '../../../../platform/mcp/common/mcpManagement.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';

export class WorkbenchMcpManagementService extends BaseWorkbenchMcpManagementService {

	constructor(
		@IAllowedMcpServersService allowedMcpServersService: IAllowedMcpServersService,
		@ILogService logService: ILogService,
		@IUserDataProfileService userDataProfileService: IUserDataProfileService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@IWorkspaceContextService workspaceContextService: IWorkspaceContextService,
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IRemoteUserDataProfilesService remoteUserDataProfilesService: IRemoteUserDataProfilesService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ISharedProcessService sharedProcessService: ISharedProcessService,
	) {
		const mcpManagementService = new McpManagementChannelClient(sharedProcessService.getChannel('mcpManagement'), allowedMcpServersService, logService);
		super(mcpManagementService, allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService);
		this._register(mcpManagementService);
	}
}

registerSingleton(IWorkbenchMcpManagementService, WorkbenchMcpManagementService, InstantiationType.Delayed);
