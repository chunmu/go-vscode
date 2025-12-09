/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.ts';
import { IDialogHandler, IDialogResult, IDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import { IProductService } from '../../../../platform/product/common/productService.ts';
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { IDialogsModel, IDialogViewItem } from '../../../common/dialogs.ts';
import { BrowserDialogHandler } from './dialogHandler.ts';
import { DialogService } from '../../../services/dialogs/common/dialogService.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { Lazy } from '../../../../base/common/lazy.ts';
import { IOpenerService } from '../../../../platform/opener/common/opener.ts';
import { createBrowserAboutDialogDetails } from '../../../../platform/dialogs/browser/dialog.ts';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.ts';

export class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.dialogHandler';

	private readonly model: IDialogsModel;
	private readonly impl: Lazy<IDialogHandler>;

	private currentDialog: IDialogViewItem | undefined;

	constructor(
		@IDialogService private dialogService: IDialogService,
		@ILogService logService: ILogService,
		@ILayoutService layoutService: ILayoutService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IProductService private productService: IProductService,
		@IClipboardService clipboardService: IClipboardService,
		@IOpenerService openerService: IOpenerService,
		@IMarkdownRendererService markdownRendererService: IMarkdownRendererService,
	) {
		super();

		this.impl = new Lazy(() => new BrowserDialogHandler(logService, layoutService, keybindingService, instantiationService, clipboardService, openerService, markdownRendererService));
		this.model = (this.dialogService as DialogService).model;

		this._register(this.model.onWillShowDialog(() => {
			if (!this.currentDialog) {
				this.processDialogs();
			}
		}));

		this.processDialogs();
	}

	private async processDialogs(): Promise<void> {
		while (this.model.dialogs.length) {
			this.currentDialog = this.model.dialogs[0];

			let result: IDialogResult | Error | undefined = undefined;
			try {
				if (this.currentDialog.args.confirmArgs) {
					const args = this.currentDialog.args.confirmArgs;
					result = await this.impl.value.confirm(args.confirmation);
				} else if (this.currentDialog.args.inputArgs) {
					const args = this.currentDialog.args.inputArgs;
					result = await this.impl.value.input(args.input);
				} else if (this.currentDialog.args.promptArgs) {
					const args = this.currentDialog.args.promptArgs;
					result = await this.impl.value.prompt(args.prompt);
				} else {
					const aboutDialogDetails = createBrowserAboutDialogDetails(this.productService);
					await this.impl.value.about(aboutDialogDetails.title, aboutDialogDetails.details, aboutDialogDetails.detailsToCopy);
				}
			} catch (error) {
				result = error;
			}

			this.currentDialog.close(result);
			this.currentDialog = undefined;
		}
	}
}

registerWorkbenchContribution2(
	DialogHandlerContribution.ID,
	DialogHandlerContribution,
	WorkbenchPhase.BlockStartup // Block to allow for dialogs to show before restore finished
);
