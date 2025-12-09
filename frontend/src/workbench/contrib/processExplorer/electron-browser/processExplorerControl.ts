/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { INativeHostService } from '../../../../platform/native/common/native.ts';
import { IProcessService, IResolvedProcessInformation } from '../../../../platform/process/common/process.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { ProcessExplorerControl } from '../browser/processExplorerControl.ts';

export class NativeProcessExplorerControl extends ProcessExplorerControl {

	constructor(
		container: HTMLElement,
		@IInstantiationService instantiationService: IInstantiationService,
		@IProductService productService: IProductService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@ICommandService commandService: ICommandService,
		@IProcessService private readonly processService: IProcessService,
		@IClipboardService clipboardService: IClipboardService
	) {
		super(instantiationService, productService, contextMenuService, commandService, clipboardService);

		this.create(container);
	}

	protected override killProcess(pid: number, signal: string): Promise<void> {
		return this.nativeHostService.killProcess(pid, signal);
	}

	protected override resolveProcesses(): Promise<IResolvedProcessInformation> {
		return this.processService.resolveProcesses();
	}
}
