/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.ts';
import { DisposableStore } from '../../../base/common/lifecycle.ts';
import { URI, UriComponents } from '../../../base/common/uri.ts';
import { IOpenerService } from '../../../platform/opener/common/opener.ts';
import { extHostNamedCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.ts';
import { ExtHostContext, ExtHostWindowShape, IOpenUriOptions, MainContext, MainThreadWindowShape } from '../common/extHost.protocol.ts';
import { IHostService } from '../../services/host/browser/host.ts';
import { IUserActivityService } from '../../services/userActivity/common/userActivityService.ts';
import { encodeBase64 } from '../../../base/common/buffer.ts';

@extHostNamedCustomer(MainContext.MainThreadWindow)
export class MainThreadWindow implements MainThreadWindowShape {

	private readonly proxy: ExtHostWindowShape;
	private readonly disposables = new DisposableStore();

	constructor(
		extHostContext: IExtHostContext,
		@IHostService private readonly hostService: IHostService,
		@IOpenerService private readonly openerService: IOpenerService,
		@IUserActivityService private readonly userActivityService: IUserActivityService,
	) {
		this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostWindow);

		Event.latch(hostService.onDidChangeFocus)
			(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
		userActivityService.onDidChangeIsActive(this.proxy.$onDidChangeWindowActive, this.proxy, this.disposables);
		this.registerNativeHandle();
	}

	dispose(): void {
		this.disposables.dispose();
	}

	registerNativeHandle(): void {
		Event.latch(this.hostService.onDidChangeActiveWindow)(
			async windowId => {
				const handle = await this.hostService.getNativeWindowHandle(windowId);
				this.proxy.$onDidChangeActiveNativeWindowHandle(handle ? encodeBase64(handle) : undefined);
			},
			this,
			this.disposables
		);
	}

	$getInitialState() {
		return Promise.resolve({
			isFocused: this.hostService.hasFocus,
			isActive: this.userActivityService.isActive,
		});
	}

	async $openUri(uriComponents: UriComponents, uriString: string | undefined, options: IOpenUriOptions): Promise<boolean> {
		const uri = URI.from(uriComponents);
		let target: URI | string;
		if (uriString && URI.parse(uriString).toString() === uri.toString()) {
			// called with string and no transformation happened -> keep string
			target = uriString;
		} else {
			// called with URI or transformed -> use uri
			target = uri;
		}
		return this.openerService.open(target, {
			openExternal: true,
			allowTunneling: options.allowTunneling,
			allowContributedOpeners: options.allowContributedOpeners,
		});
	}

	async $asExternalUri(uriComponents: UriComponents, options: IOpenUriOptions): Promise<UriComponents> {
		const result = await this.openerService.resolveExternalUri(URI.revive(uriComponents), options);
		return result.resolved;
	}
}
