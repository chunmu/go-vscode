/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { reset } from '../../dom.ts';
import type { IManagedHover } from '../hover/hover.ts';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.ts';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.ts';
import { renderLabelWithIcons } from './iconLabels.ts';
import { IDisposable } from '../../../common/lifecycle.ts';

export class SimpleIconLabel implements IDisposable {

	private hover?: IManagedHover;

	constructor(
		private readonly _container: HTMLElement
	) { }

	set text(text: string) {
		reset(this._container, ...renderLabelWithIcons(text ?? ''));
	}

	set title(title: string) {
		if (!this.hover && title) {
			this.hover = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate('mouse'), this._container, title);
		} else if (this.hover) {
			this.hover.update(title);
		}
	}

	dispose(): void {
		this.hover?.dispose();
	}
}
