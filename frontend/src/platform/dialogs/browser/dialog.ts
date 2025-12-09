/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventHelper } from '../../../base/browser/dom.ts';
import { StandardKeyboardEvent } from '../../../base/browser/keyboardEvent.ts';
import { IDialogOptions } from '../../../base/browser/ui/dialog/dialog.ts';
import { fromNow } from '../../../base/common/date.ts';
import { localize } from '../../../nls.ts';
import { IKeybindingService } from '../../keybinding/common/keybinding.ts';
import { ResultKind } from '../../keybinding/common/keybindingResolver.ts';
import { ILayoutService } from '../../layout/browser/layoutService.ts';
import { IProductService } from '../../product/common/productService.ts';
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles, defaultDialogStyles } from '../../theme/browser/defaultStyles.ts';

const defaultDialogAllowableCommands = [
	'workbench.action.quit',
	'workbench.action.reloadWindow',
	'copy',
	'cut',
	'editor.action.selectAll',
	'editor.action.clipboardCopyAction',
	'editor.action.clipboardCutAction',
	'editor.action.clipboardPasteAction'
];

export function createWorkbenchDialogOptions(options: Partial<IDialogOptions>, keybindingService: IKeybindingService, layoutService: ILayoutService, allowableCommands = defaultDialogAllowableCommands): IDialogOptions {
	return {
		keyEventProcessor: (event: StandardKeyboardEvent) => {
			const resolved = keybindingService.softDispatch(event, layoutService.activeContainer);
			if (resolved.kind === ResultKind.KbFound && resolved.commandId) {
				if (!allowableCommands.includes(resolved.commandId)) {
					EventHelper.stop(event, true);
				}
			}
		},
		buttonStyles: defaultButtonStyles,
		checkboxStyles: defaultCheckboxStyles,
		inputBoxStyles: defaultInputBoxStyles,
		dialogStyles: defaultDialogStyles,
		...options
	};
}

export function createBrowserAboutDialogDetails(productService: IProductService): { title: string; details: string; detailsToCopy: string } {
	const detailString = (useAgo: boolean): string => {
		return localize('aboutDetail',
			"Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}",
			productService.version || 'Unknown',
			productService.commit || 'Unknown',
			productService.date ? `${productService.date}${useAgo ? ' (' + fromNow(new Date(productService.date), true) + ')' : ''}` : 'Unknown',
			navigator.userAgent
		);
	};

	const details = detailString(true);
	const detailsToCopy = detailString(false);

	return {
		title: productService.nameLong,
		details: details,
		detailsToCopy: detailsToCopy
	};
}

