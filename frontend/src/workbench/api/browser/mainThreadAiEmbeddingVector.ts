/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../base/common/cancellation.ts';
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.ts';
import { ExtHostAiEmbeddingVectorShape, ExtHostContext, MainContext, MainThreadAiEmbeddingVectorShape } from '../common/extHost.protocol.ts';
import { IAiEmbeddingVectorProvider, IAiEmbeddingVectorService } from '../../services/aiEmbeddingVector/common/aiEmbeddingVectorService.ts';
import { IExtHostContext, extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.ts';

@extHostNamedCustomer(MainContext.MainThreadAiEmbeddingVector)
export class MainThreadAiEmbeddingVector extends Disposable implements MainThreadAiEmbeddingVectorShape {
	private readonly _proxy: ExtHostAiEmbeddingVectorShape;
	private readonly _registrations = this._register(new DisposableMap<number>());

	constructor(
		context: IExtHostContext,
		@IAiEmbeddingVectorService private readonly _AiEmbeddingVectorService: IAiEmbeddingVectorService,
	) {
		super();
		this._proxy = context.getProxy(ExtHostContext.ExtHostAiEmbeddingVector);
	}

	$registerAiEmbeddingVectorProvider(model: string, handle: number): void {
		const provider: IAiEmbeddingVectorProvider = {
			provideAiEmbeddingVector: (strings: string[], token: CancellationToken) => {
				return this._proxy.$provideAiEmbeddingVector(
					handle,
					strings,
					token
				);
			},
		};
		this._registrations.set(handle, this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider));
	}

	$unregisterAiEmbeddingVectorProvider(handle: number): void {
		this._registrations.deleteAndDispose(handle);
	}
}
