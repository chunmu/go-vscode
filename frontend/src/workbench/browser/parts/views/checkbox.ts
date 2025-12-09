/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as DOM from '../../../../base/browser/dom.ts';
import type { IManagedHover } from '../../../../base/browser/ui/hover/hover.ts';
import { IHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegate.ts';
import { Checkbox } from '../../../../base/browser/ui/toggle/toggle.ts';
import { Emitter, Event } from '../../../../base/common/event.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { localize } from '../../../../nls.ts';
import type { IHoverService } from '../../../../platform/hover/browser/hover.ts';
import { defaultCheckboxStyles } from '../../../../platform/theme/browser/defaultStyles.ts';
import { ITreeItem, ITreeItemCheckboxState } from '../../../common/views.ts';

export class CheckboxStateHandler extends Disposable {
	private readonly _onDidChangeCheckboxState = this._register(new Emitter<ITreeItem[]>());
	readonly onDidChangeCheckboxState: Event<ITreeItem[]> = this._onDidChangeCheckboxState.event;

	public setCheckboxState(node: ITreeItem) {
		this._onDidChangeCheckboxState.fire([node]);
	}
}

export class TreeItemCheckbox extends Disposable {
	private toggle: Checkbox | undefined;
	private readonly checkboxContainer: HTMLDivElement;
	private hover: IManagedHover | undefined;

	public static readonly checkboxClass = 'custom-view-tree-node-item-checkbox';

	constructor(
		container: HTMLElement,
		private readonly checkboxStateHandler: CheckboxStateHandler,
		private readonly hoverDelegate: IHoverDelegate,
		private readonly hoverService: IHoverService
	) {
		super();
		this.checkboxContainer = <HTMLDivElement>container;
	}

	public render(node: ITreeItem) {
		if (node.checkbox) {
			if (!this.toggle) {
				this.createCheckbox(node);
			}
			else {
				this.toggle.checked = node.checkbox.isChecked;
			}
		}
	}

	private createCheckbox(node: ITreeItem) {
		if (node.checkbox) {
			this.toggle = new Checkbox('', node.checkbox.isChecked, { ...defaultCheckboxStyles, size: 15 });
			this.setHover(node.checkbox);
			this.setAccessibilityInformation(node.checkbox);
			this.toggle.domNode.classList.add(TreeItemCheckbox.checkboxClass);
			this.toggle.domNode.tabIndex = 1;
			DOM.append(this.checkboxContainer, this.toggle.domNode);
			this.registerListener(node);
		}
	}

	private registerListener(node: ITreeItem) {
		if (this.toggle) {
			this._register({ dispose: () => this.removeCheckbox() });
			this._register(this.toggle);
			this._register(this.toggle.onChange(() => {
				this.setCheckbox(node);
			}));
		}
	}

	private setHover(checkbox: ITreeItemCheckboxState) {
		if (this.toggle) {
			if (!this.hover) {
				this.hover = this._register(this.hoverService.setupManagedHover(this.hoverDelegate, this.toggle.domNode, this.checkboxHoverContent(checkbox)));
			} else {
				this.hover.update(checkbox.tooltip);
			}
		}
	}

	private setCheckbox(node: ITreeItem) {
		if (this.toggle && node.checkbox) {
			node.checkbox.isChecked = this.toggle.checked;
			this.setHover(node.checkbox);

			this.setAccessibilityInformation(node.checkbox);
			this.checkboxStateHandler.setCheckboxState(node);
		}
	}

	private checkboxHoverContent(checkbox: ITreeItemCheckboxState): string {
		return checkbox.tooltip ? checkbox.tooltip :
			checkbox.isChecked ? localize('checked', 'Checked') : localize('unchecked', 'Unchecked');
	}

	private setAccessibilityInformation(checkbox: ITreeItemCheckboxState) {
		if (this.toggle && checkbox.accessibilityInformation) {
			this.toggle.setTitle(checkbox.accessibilityInformation.label);
			if (checkbox.accessibilityInformation.role) {
				this.toggle.domNode.role = checkbox.accessibilityInformation.role;
			}
		}
	}

	private removeCheckbox() {
		const children = this.checkboxContainer.children;
		for (const child of children) {
			child.remove();
		}
	}
}
