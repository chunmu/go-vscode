/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';
import { BrowserType, IElementData } from '../../../../platform/browserElements/common/browserElements.ts';
import { IRectangle } from '../../../../platform/window/common/window.ts';

export const IBrowserElementsService = createDecorator<IBrowserElementsService>('browserElementsService');

export interface IBrowserElementsService {
	_serviceBrand: undefined;

	// no browser implementation yet
	getElementData(rect: IRectangle, token: CancellationToken, browserType: BrowserType | undefined): Promise<IElementData | undefined>;

	startDebugSession(token: CancellationToken, browserType: BrowserType): Promise<void>;
}
