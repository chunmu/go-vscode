/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BrowserType, IElementData } from '../../../../platform/browserElements/common/browserElements.ts';
import { IRectangle } from '../../../../platform/window/common/window.ts';
import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.ts';
import { IBrowserElementsService } from './browserElementsService.ts';

class WebBrowserElementsService implements IBrowserElementsService {
	_serviceBrand: undefined;

	constructor() { }

	async getElementData(rect: IRectangle, token: CancellationToken): Promise<IElementData | undefined> {
		throw new Error('Not implemented');
	}

	startDebugSession(token: CancellationToken, browserType: BrowserType): Promise<void> {
		throw new Error('Not implemented');
	}
}

registerSingleton(IBrowserElementsService, WebBrowserElementsService, InstantiationType.Delayed);
