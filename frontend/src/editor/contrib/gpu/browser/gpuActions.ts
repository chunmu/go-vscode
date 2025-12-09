/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getActiveWindow } from '../../../../base/browser/dom.ts';
import { VSBuffer } from '../../../../base/common/buffer.ts';
import { URI } from '../../../../base/common/uri.ts';
import { localize, localize2 } from '../../../../nls.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.ts';
import { IFileService } from '../../../../platform/files/common/files.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.ts';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.ts';
import type { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorAction, registerEditorAction, type ServicesAccessor } from '../../../browser/editorExtensions.ts';
import { ensureNonNullable } from '../../../browser/gpu/gpuUtils.ts';
import { GlyphRasterizer } from '../../../browser/gpu/raster/glyphRasterizer.ts';
import { ViewGpuContext } from '../../../browser/gpu/viewGpuContext.ts';

class DebugEditorGpuRendererAction extends EditorAction {

	constructor() {
		super({
			id: 'editor.action.debugEditorGpuRenderer',
			label: localize2('gpuDebug.label', "Developer: Debug Editor GPU Renderer"),
			// TODO: Why doesn't `ContextKeyExpr.equals('config:editor.experimentalGpuAcceleration', 'on')` work?
			precondition: ContextKeyExpr.true(),
		});
	}

	async run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const quickInputService = accessor.get(IQuickInputService);
		const choice = await quickInputService.pick([
			{
				label: localize('logTextureAtlasStats.label', "Log Texture Atlas Stats"),
				id: 'logTextureAtlasStats',
			},
			{
				label: localize('saveTextureAtlas.label', "Save Texture Atlas"),
				id: 'saveTextureAtlas',
			},
			{
				label: localize('drawGlyph.label', "Draw Glyph"),
				id: 'drawGlyph',
			},
		], { canPickMany: false });
		if (!choice) {
			return;
		}
		switch (choice.id) {
			case 'logTextureAtlasStats':
				instantiationService.invokeFunction(accessor => {
					const logService = accessor.get(ILogService);

					const atlas = ViewGpuContext.atlas;
					if (!ViewGpuContext.atlas) {
						logService.error('No texture atlas found');
						return;
					}

					const stats = atlas.getStats();
					logService.info(['Texture atlas stats', ...stats].join('\n\n'));
				});
				break;
			case 'saveTextureAtlas':
				instantiationService.invokeFunction(async accessor => {
					const workspaceContextService = accessor.get(IWorkspaceContextService);
					const fileService = accessor.get(IFileService);
					const folders = workspaceContextService.getWorkspace().folders;
					if (folders.length > 0) {
						const atlas = ViewGpuContext.atlas;
						const promises = [];
						for (const [layerIndex, page] of atlas.pages.entries()) {
							promises.push(...[
								fileService.writeFile(
									URI.joinPath(folders[0].uri, `textureAtlasPage${layerIndex}_actual.png`),
									VSBuffer.wrap(new Uint8Array(await (await page.source.convertToBlob()).arrayBuffer()))
								),
								fileService.writeFile(
									URI.joinPath(folders[0].uri, `textureAtlasPage${layerIndex}_usage.png`),
									VSBuffer.wrap(new Uint8Array(await (await page.getUsagePreview()).arrayBuffer()))
								),
							]);
						}
						await Promise.all(promises);
					}
				});
				break;
			case 'drawGlyph':
				instantiationService.invokeFunction(async accessor => {
					const configurationService = accessor.get(IConfigurationService);
					const fileService = accessor.get(IFileService);
					const quickInputService = accessor.get(IQuickInputService);
					const workspaceContextService = accessor.get(IWorkspaceContextService);

					const folders = workspaceContextService.getWorkspace().folders;
					if (folders.length === 0) {
						return;
					}

					const atlas = ViewGpuContext.atlas;
					const fontFamily = configurationService.getValue<string>('editor.fontFamily');
					const fontSize = configurationService.getValue<number>('editor.fontSize');
					const rasterizer = new GlyphRasterizer(fontSize, fontFamily, getActiveWindow().devicePixelRatio, ViewGpuContext.decorationStyleCache);
					let chars = await quickInputService.input({
						prompt: 'Enter a character to draw (prefix with 0x for code point))'
					});
					if (!chars) {
						return;
					}
					const codePoint = chars.match(/0x(?<codePoint>[0-9a-f]+)/i)?.groups?.codePoint;
					if (codePoint !== undefined) {
						chars = String.fromCodePoint(parseInt(codePoint, 16));
					}
					const tokenMetadata = 0;
					const charMetadata = 0;
					const rasterizedGlyph = atlas.getGlyph(rasterizer, chars, tokenMetadata, charMetadata, 0);
					if (!rasterizedGlyph) {
						return;
					}
					const imageData = atlas.pages[rasterizedGlyph.pageIndex].source.getContext('2d')?.getImageData(
						rasterizedGlyph.x,
						rasterizedGlyph.y,
						rasterizedGlyph.w,
						rasterizedGlyph.h
					);
					if (!imageData) {
						return;
					}
					const canvas = new OffscreenCanvas(imageData.width, imageData.height);
					const ctx = ensureNonNullable(canvas.getContext('2d'));
					ctx.putImageData(imageData, 0, 0);
					const blob = await canvas.convertToBlob({ type: 'image/png' });
					const resource = URI.joinPath(folders[0].uri, `glyph_${chars}_${tokenMetadata}_${fontSize}px_${fontFamily.replaceAll(/[,\\\/\.'\s]/g, '_')}.png`);
					await fileService.writeFile(resource, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
				});
				break;
		}
	}
}

registerEditorAction(DebugEditorGpuRendererAction);
