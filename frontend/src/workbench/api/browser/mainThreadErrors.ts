/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SerializedError, onUnexpectedError, transformErrorFromSerialization } from '../../../base/common/errors.ts';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.ts';
import { MainContext, MainThreadErrorsShape } from '../common/extHost.protocol.ts';

@extHostNamedCustomer(MainContext.MainThreadErrors)
export class MainThreadErrors implements MainThreadErrorsShape {

	dispose(): void {
		//
	}

	$onUnexpectedError(err: unknown | SerializedError): void {
		if ((err as SerializedError | undefined)?.$isError) {
			err = transformErrorFromSerialization(err as SerializedError);
		}
		onUnexpectedError(err);
	}
}
