/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './colorPicker.css';
import { PixelRatio } from '../../../../base/browser/pixelRatio.ts';
import * as dom from '../../../../base/browser/dom.ts';
import { Widget } from '../../../../base/browser/ui/widget.ts';
import { ColorPickerModel } from './colorPickerModel.ts';
import { IEditorHoverColorPickerWidget } from '../../hover/browser/hoverTypes.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';
import { ColorPickerBody } from './colorPickerParts/colorPickerBody.ts';
import { ColorPickerHeader } from './colorPickerParts/colorPickerHeader.ts';
import { ColorPickerWidgetType } from './colorPickerParticipantUtils.ts';

const $ = dom.$;

export class ColorPickerWidget extends Widget implements IEditorHoverColorPickerWidget {

	private static readonly ID = 'editor.contrib.colorPickerWidget';
	private readonly _domNode: HTMLElement;

	body: ColorPickerBody;
	header: ColorPickerHeader;

	constructor(container: Node, readonly model: ColorPickerModel, private pixelRatio: number, themeService: IThemeService, type: ColorPickerWidgetType) {
		super();

		this._register(PixelRatio.getInstance(dom.getWindow(container)).onDidChange(() => this.layout()));

		this._domNode = $('.colorpicker-widget');
		container.appendChild(this._domNode);

		this.header = this._register(new ColorPickerHeader(this._domNode, this.model, themeService, type));
		this.body = this._register(new ColorPickerBody(this._domNode, this.model, this.pixelRatio, type));
	}

	getId(): string {
		return ColorPickerWidget.ID;
	}

	layout(): void {
		this.body.layout();
	}

	get domNode(): HTMLElement {
		return this._domNode;
	}
}
