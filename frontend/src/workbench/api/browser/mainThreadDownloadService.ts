/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../base/common/lifecycle.ts';
import { MainContext, MainThreadDownloadServiceShape } from '../common/extHost.protocol.ts';
import { extHostNamedCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.ts';
import { IDownloadService } from '../../../platform/download/common/download.ts';
import { UriComponents, URI } from '../../../base/common/uri.ts';

@extHostNamedCustomer(MainContext.MainThreadDownloadService)
export class MainThreadDownloadService extends Disposable implements MainThreadDownloadServiceShape {

	constructor(
		extHostContext: IExtHostContext,
		@IDownloadService private readonly downloadService: IDownloadService
	) {
		super();
	}

	$download(uri: UriComponents, to: UriComponents): Promise<void> {
		return this.downloadService.download(URI.revive(uri), URI.revive(to));
	}

}
