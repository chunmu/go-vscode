/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { IConfirmation, IConfirmationResult, IInputResult, ICheckbox, IInputElement, ICustomDialogOptions, IInput, AbstractDialogHandler, DialogType, IPrompt, IAsyncPromptResult } from '../../../../platform/dialogs/common/dialogs.ts';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import Severity from '../../../../base/common/severity.ts';
import { Dialog, IDialogResult } from '../../../../base/browser/ui/dialog/dialog.ts';
import { DisposableStore } from '../../../../base/common/lifecycle.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IMarkdownRendererService, openLinkFromMarkdown } from '../../../../platform/markdown/browser/markdownRenderer.ts';
import { IOpenerService } from '../../../../platform/opener/common/opener.ts';
import { createWorkbenchDialogOptions } from '../../../../platform/dialogs/browser/dialog.ts';

export class BrowserDialogHandler extends AbstractDialogHandler {

	private static readonly ALLOWABLE_COMMANDS = [
		'copy',
		'cut',
		'editor.action.selectAll',
		'editor.action.clipboardCopyAction',
		'editor.action.clipboardCutAction',
		'editor.action.clipboardPasteAction'
	];

	constructor(
		@ILogService private readonly logService: ILogService,
		@ILayoutService private readonly layoutService: ILayoutService,
		@IKeybindingService private readonly keybindingService: IKeybindingService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IClipboardService private readonly clipboardService: IClipboardService,
		@IOpenerService private readonly openerService: IOpenerService,
		@IMarkdownRendererService private readonly markdownRendererService: IMarkdownRendererService,
	) {
		super();
	}

	async prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>> {
		this.logService.trace('DialogService#prompt', prompt.message);

		const buttons = this.getPromptButtons(prompt);

		const { button, checkboxChecked } = await this.doShow(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */, prompt.checkbox, undefined, typeof prompt?.custom === 'object' ? prompt.custom : undefined);

		return this.getPromptResult(prompt, button, checkboxChecked);
	}

	async confirm(confirmation: IConfirmation): Promise<IConfirmationResult> {
		this.logService.trace('DialogService#confirm', confirmation.message);

		const buttons = this.getConfirmationButtons(confirmation);

		const { button, checkboxChecked } = await this.doShow(confirmation.type ?? 'question', confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, undefined, typeof confirmation?.custom === 'object' ? confirmation.custom : undefined);

		return { confirmed: button === 0, checkboxChecked };
	}

	async input(input: IInput): Promise<IInputResult> {
		this.logService.trace('DialogService#input', input.message);

		const buttons = this.getInputButtons(input);

		const { button, checkboxChecked, values } = await this.doShow(input.type ?? 'question', input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === 'object' ? input.custom : undefined);

		return { confirmed: button === 0, checkboxChecked, values };
	}

	async about(title: string, details: string, detailsToCopy: string): Promise<void> {

		const { button } = await this.doShow(
			Severity.Info,
			title,
			[
				localize({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
				localize('ok', "OK")
			],
			details,
			1
		);

		if (button === 0) {
			this.clipboardService.writeText(detailsToCopy);
		}
	}

	private async doShow(type: Severity | DialogType | undefined, message: string, buttons?: string[], detail?: string, cancelId?: number, checkbox?: ICheckbox, inputs?: IInputElement[], customOptions?: ICustomDialogOptions): Promise<IDialogResult> {
		const dialogDisposables = new DisposableStore();

		const renderBody = customOptions ? (parent: HTMLElement) => {
			parent.classList.add(...(customOptions.classes || []));
			customOptions.markdownDetails?.forEach(markdownDetail => {
				const result = dialogDisposables.add(this.markdownRendererService.render(markdownDetail.markdown, {
					actionHandler: markdownDetail.actionHandler || ((link, mdStr) => {
						return openLinkFromMarkdown(this.openerService, link, mdStr.isTrusted, true /* skip URL validation to prevent another dialog from showing which is unsupported */);
					}),
				}));
				parent.appendChild(result.element);
				result.element.classList.add(...(markdownDetail.classes || []));
			});
		} : undefined;

		const dialog = new Dialog(
			this.layoutService.activeContainer,
			message,
			buttons,
			createWorkbenchDialogOptions({
				detail,
				cancelId,
				type: this.getDialogType(type),
				renderBody,
				icon: customOptions?.icon,
				disableCloseAction: customOptions?.disableCloseAction,
				buttonOptions: customOptions?.buttonDetails?.map(detail => ({ sublabel: detail })),
				checkboxLabel: checkbox?.label,
				checkboxChecked: checkbox?.checked,
				inputs
			}, this.keybindingService, this.layoutService, BrowserDialogHandler.ALLOWABLE_COMMANDS)
		);

		dialogDisposables.add(dialog);

		const result = await dialog.show();
		dialogDisposables.dispose();

		return result;
	}
}
