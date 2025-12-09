/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.ts';
import { IURITransformer, transformOutgoingURIs } from '../../../base/common/uriIpc.ts';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.ts';
import { RemoteAgentConnectionContext } from '../../remote/common/remoteAgentEnvironment.ts';
import { INativeMcpDiscoveryHelperService } from '../common/nativeMcpDiscoveryHelper.ts';

export class NativeMcpDiscoveryHelperChannel implements IServerChannel<RemoteAgentConnectionContext> {

	constructor(
		private readonly getUriTransformer: undefined | ((requestContext: RemoteAgentConnectionContext) => IURITransformer),
		@INativeMcpDiscoveryHelperService private nativeMcpDiscoveryHelperService: INativeMcpDiscoveryHelperService
	) { }

	listen<T>(context: RemoteAgentConnectionContext, event: string): Event<T> {
		throw new Error('Invalid listen');
	}

	async call<T>(context: RemoteAgentConnectionContext, command: string, args?: unknown): Promise<T> {
		const uriTransformer = this.getUriTransformer?.(context);
		switch (command) {
			case 'load': {
				const result = await this.nativeMcpDiscoveryHelperService.load();
				return (uriTransformer ? transformOutgoingURIs(result, uriTransformer) : result) as T;
			}
		}
		throw new Error('Invalid call');
	}
}

