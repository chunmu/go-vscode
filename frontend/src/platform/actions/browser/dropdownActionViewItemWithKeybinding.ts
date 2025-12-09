/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IContextMenuProvider } from '../../../base/browser/contextmenu.ts';
import { IActionProvider } from '../../../base/browser/ui/dropdown/dropdown.ts';
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from '../../../base/browser/ui/dropdown/dropdownActionViewItem.ts';
import { IAction } from '../../../base/common/actions.ts';
import * as nls from '../../../nls.ts';
import { IContextKeyService } from '../../contextkey/common/contextkey.ts';
import { IKeybindingService } from '../../keybinding/common/keybinding.ts';

export class DropdownMenuActionViewItemWithKeybinding extends DropdownMenuActionViewItem {
	constructor(
		action: IAction,
		menuActionsOrProvider: readonly IAction[] | IActionProvider,
		contextMenuProvider: IContextMenuProvider,
		options: IDropdownMenuActionViewItemOptions = Object.create(null),
		@IKeybindingService private readonly keybindingService: IKeybindingService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
	) {
		super(action, menuActionsOrProvider, contextMenuProvider, options);
	}

	protected override getTooltip() {
		const keybinding = this.keybindingService.lookupKeybinding(this.action.id, this.contextKeyService);
		const keybindingLabel = keybinding && keybinding.getLabel();

		const tooltip = this.action.tooltip ?? this.action.label;
		return keybindingLabel
			? nls.localize('titleAndKb', "{0} ({1})", tooltip, keybindingLabel)
			: tooltip;
	}
}
