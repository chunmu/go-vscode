/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { clamp } from '../../../../base/common/numbers.ts';
import { setGlobalSashSize, setGlobalHoverDelay } from '../../../../base/browser/ui/sash/sash.ts';
import { Event } from '../../../../base/common/event.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IWorkbenchContribution } from '../../../common/contributions.ts';
import { createStyleSheet } from '../../../../base/browser/domStylesheets.ts';

export const minSize = 1;
export const maxSize = 20; // see also https://ux.stackexchange.com/questions/39023/what-is-the-optimum-button-size-of-touch-screen-applications

export class SashSettingsController extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.sash';

	private readonly styleSheet = createStyleSheet();

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();

		const onDidChangeSize = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('workbench.sash.size'));
		onDidChangeSize(this.onDidChangeSize, this, this._store);
		this.onDidChangeSize();

		const onDidChangeHoverDelay = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('workbench.sash.hoverDelay'));
		onDidChangeHoverDelay(this.onDidChangeHoverDelay, this, this._store);
		this.onDidChangeHoverDelay();
	}

	private onDidChangeSize(): void {
		const configuredSize = this.configurationService.getValue<number>('workbench.sash.size');
		const size = clamp(configuredSize, 4, 20);
		const hoverSize = clamp(configuredSize, 1, 8);

		this.styleSheet.textContent = `
			.monaco-workbench {
				--vscode-sash-size: ${size}px;
				--vscode-sash-hover-size: ${hoverSize}px;
			}
		`;

		setGlobalSashSize(size);
	}

	private onDidChangeHoverDelay(): void {
		setGlobalHoverDelay(this.configurationService.getValue<number>('workbench.sash.hoverDelay'));
	}
}
