/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ViewPart } from '../../view/viewPart.ts';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.ts';
import { ViewContext } from '../../../common/viewModel/viewContext.ts';
import * as viewEvents from '../../../common/viewEvents.ts';
import { EditorOption } from '../../../common/config/editorOptions.ts';
import type { ViewGpuContext } from '../../gpu/viewGpuContext.ts';
import type { IObjectCollectionBufferEntry } from '../../gpu/objectCollectionBuffer.ts';
import type { RectangleRenderer, RectangleRendererEntrySpec } from '../../gpu/rectangleRenderer.ts';
import { Color } from '../../../../base/common/color.ts';
import { editorRuler } from '../../../common/core/editorColorRegistry.ts';
import { autorun, type IReader } from '../../../../base/common/observable.ts';

/**
 * Rulers are vertical lines that appear at certain columns in the editor. There can be >= 0 rulers
 * at a time.
 */
export class RulersGpu extends ViewPart {

	private readonly _gpuShapes: IObjectCollectionBufferEntry<RectangleRendererEntrySpec>[] = [];

	constructor(
		context: ViewContext,
		private readonly _viewGpuContext: ViewGpuContext
	) {
		super(context);
		this._register(autorun(reader => this._updateEntries(reader)));
	}

	// --- begin event handlers

	public override onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		this._updateEntries(undefined);
		return true;
	}

	// --- end event handlers

	public prepareRender(ctx: RenderingContext): void {
		// Nothing to read
	}

	public render(ctx: RestrictedRenderingContext): void {
		// Rendering is handled by RectangleRenderer
	}

	private _updateEntries(reader: IReader | undefined) {
		const options = this._context.configuration.options;
		const rulers = options.get(EditorOption.rulers);
		const typicalHalfwidthCharacterWidth = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
		const devicePixelRatio = this._viewGpuContext.devicePixelRatio.read(reader);
		for (let i = 0, len = rulers.length; i < len; i++) {
			const ruler = rulers[i];
			const shape = this._gpuShapes[i];
			const color = ruler.color ? Color.fromHex(ruler.color) : this._context.theme.getColor(editorRuler) ?? Color.white;
			const rulerData: Parameters<RectangleRenderer['register']> = [
				ruler.column * typicalHalfwidthCharacterWidth * devicePixelRatio,
				0,
				Math.max(1, Math.ceil(devicePixelRatio)),
				Number.MAX_SAFE_INTEGER,
				color.rgba.r / 255,
				color.rgba.g / 255,
				color.rgba.b / 255,
				color.rgba.a,
			];
			if (!shape) {
				this._gpuShapes[i] = this._viewGpuContext.rectangleRenderer.register(...rulerData);
			} else {
				shape.setRaw(rulerData);
			}
		}
		while (this._gpuShapes.length > rulers.length) {
			this._gpuShapes.splice(-1, 1)[0].dispose();
		}
	}
}
