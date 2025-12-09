/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '../../../../../base/common/lifecycle.ts';
import { NativeEditContext } from './nativeEditContext.ts';

class NativeEditContextRegistryImpl {

	private _nativeEditContextMapping: Map<string, NativeEditContext> = new Map();

	register(ownerID: string, nativeEditContext: NativeEditContext): IDisposable {
		this._nativeEditContextMapping.set(ownerID, nativeEditContext);
		return {
			dispose: () => {
				this._nativeEditContextMapping.delete(ownerID);
			}
		};
	}

	get(ownerID: string): NativeEditContext | undefined {
		return this._nativeEditContextMapping.get(ownerID);
	}
}

export const NativeEditContextRegistry = new NativeEditContextRegistryImpl();
