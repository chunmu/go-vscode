/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../base/common/lifecycle.ts';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.ts';
import { MainThreadCustomEditors } from './mainThreadCustomEditors.ts';
import { MainThreadWebviewPanels } from './mainThreadWebviewPanels.ts';
import { MainThreadWebviews } from './mainThreadWebviews.ts';
import { MainThreadWebviewsViews } from './mainThreadWebviewViews.ts';
import * as extHostProtocol from '../common/extHost.protocol.ts';
import { extHostCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.ts';
import { MainThreadChatOutputRenderer } from './mainThreadChatOutputRenderer.ts';

@extHostCustomer
export class MainThreadWebviewManager extends Disposable {
	constructor(
		context: IExtHostContext,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		const webviews = this._register(instantiationService.createInstance(MainThreadWebviews, context));
		context.set(extHostProtocol.MainContext.MainThreadWebviews, webviews);

		const webviewPanels = this._register(instantiationService.createInstance(MainThreadWebviewPanels, context, webviews));
		context.set(extHostProtocol.MainContext.MainThreadWebviewPanels, webviewPanels);

		const customEditors = this._register(instantiationService.createInstance(MainThreadCustomEditors, context, webviews, webviewPanels));
		context.set(extHostProtocol.MainContext.MainThreadCustomEditors, customEditors);

		const webviewViews = this._register(instantiationService.createInstance(MainThreadWebviewsViews, context, webviews));
		context.set(extHostProtocol.MainContext.MainThreadWebviewViews, webviewViews);

		const chatOutputRenderers = this._register(instantiationService.createInstance(MainThreadChatOutputRenderer, context, webviews));
		context.set(extHostProtocol.MainContext.MainThreadChatOutputRenderer, chatOutputRenderers);
	}
}
