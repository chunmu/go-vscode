/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.ts';
import { BrowserClipboardService as BaseBrowserClipboardService } from '../../../../platform/clipboard/browser/clipboardService.ts';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.ts';
import { IOpenerService } from '../../../../platform/opener/common/opener.ts';
import { Event } from '../../../../base/common/event.ts';
import { DisposableStore } from '../../../../base/common/lifecycle.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.ts';
import { getActiveWindow } from '../../../../base/browser/dom.ts';

export class BrowserClipboardService extends BaseBrowserClipboardService {

	constructor(
		@INotificationService private readonly notificationService: INotificationService,
		@IOpenerService private readonly openerService: IOpenerService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@ILogService logService: ILogService,
		@ILayoutService layoutService: ILayoutService
	) {
		super(layoutService, logService);
	}

	override async writeText(text: string, type?: string): Promise<void> {
		this.logService.trace('BrowserClipboardService#writeText called with type:', type, ' with text.length:', text.length);
		if (!!this.environmentService.extensionTestsLocationURI && typeof type !== 'string') {
			type = 'vscode-tests'; // force in-memory clipboard for tests to avoid permission issues
		}
		this.logService.trace('BrowserClipboardService#super.writeText');
		return super.writeText(text, type);
	}

	override async readText(type?: string): Promise<string> {
		this.logService.trace('BrowserClipboardService#readText called with type:', type);
		if (!!this.environmentService.extensionTestsLocationURI && typeof type !== 'string') {
			type = 'vscode-tests'; // force in-memory clipboard for tests to avoid permission issues
		}

		if (type) {
			this.logService.trace('BrowserClipboardService#super.readText');
			return super.readText(type);
		}

		try {
			const readText = await getActiveWindow().navigator.clipboard.readText();
			this.logService.trace('BrowserClipboardService#readText with readText.length:', readText.length);
			return readText;
		} catch (error) {
			return new Promise<string>(resolve => {

				// Inform user about permissions problem (https://github.com/microsoft/vscode/issues/112089)
				const listener = new DisposableStore();
				const handle = this.notificationService.prompt(
					Severity.Error,
					localize('clipboardError', "Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."),
					[{
						label: localize('retry', "Retry"),
						run: async () => {
							listener.dispose();
							resolve(await this.readText(type));
						}
					}, {
						label: localize('learnMore', "Learn More"),
						run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2151362')
					}],
					{
						sticky: true
					}
				);

				// Always resolve the promise once the notification closes
				listener.add(Event.once(handle.onDidClose)(() => resolve('')));
			});
		}
	}
}

registerSingleton(IClipboardService, BrowserClipboardService, InstantiationType.Delayed);
