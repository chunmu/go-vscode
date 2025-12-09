/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAction, Separator } from '../../../../base/common/actions.ts';
import { IMenuService, SubmenuItemAction, MenuItemAction } from '../../../../platform/actions/common/actions.ts';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.ts';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.ts';
import { isMacintosh } from '../../../../base/common/platform.ts';
import { INotificationService } from '../../../../platform/notification/common/notification.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-browser/environmentService.ts';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
import { IUpdateService } from '../../../../platform/update/common/update.ts';
import { IOpenRecentAction, MenubarControl } from '../../../browser/parts/titlebar/menubarControl.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { IMenubarData, IMenubarMenu, IMenubarKeybinding, IMenubarMenuItemSubmenu, IMenubarMenuItemAction, MenubarMenuItem } from '../../../../platform/menubar/common/menubar.ts';
import { IMenubarService } from '../../../../platform/menubar/electron-browser/menubar.ts';
import { INativeHostService } from '../../../../platform/native/common/native.ts';
import { IHostService } from '../../../services/host/browser/host.ts';
import { IPreferencesService } from '../../../services/preferences/common/preferences.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { OpenRecentAction } from '../../../browser/actions/windowActions.ts';
import { isICommandActionToggleInfo } from '../../../../platform/action/common/action.ts';
import { getFlatContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.ts';

export class NativeMenubarControl extends MenubarControl {

	constructor(
		@IMenuService menuService: IMenuService,
		@IWorkspacesService workspacesService: IWorkspacesService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IConfigurationService configurationService: IConfigurationService,
		@ILabelService labelService: ILabelService,
		@IUpdateService updateService: IUpdateService,
		@IStorageService storageService: IStorageService,
		@INotificationService notificationService: INotificationService,
		@IPreferencesService preferencesService: IPreferencesService,
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IAccessibilityService accessibilityService: IAccessibilityService,
		@IMenubarService private readonly menubarService: IMenubarService,
		@IHostService hostService: IHostService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@ICommandService commandService: ICommandService,
	) {
		super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);

		(async () => {
			this.recentlyOpened = await this.workspacesService.getRecentlyOpened();

			this.doUpdateMenubar();
		})();

		this.registerListeners();
	}

	protected override setupMainMenu(): void {
		super.setupMainMenu();

		for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
			const menu = this.menus[topLevelMenuName];
			if (menu) {
				this.mainMenuDisposables.add(menu.onDidChange(() => this.updateMenubar()));
			}
		}
	}

	protected doUpdateMenubar(): void {
		// Since the native menubar is shared between windows (main process)
		// only allow the focused window to update the menubar
		if (!this.hostService.hasFocus) {
			return;
		}

		// Send menus to main process to be rendered by Electron
		const menubarData = { menus: {}, keybindings: {} };
		if (this.getMenubarMenus(menubarData)) {
			this.menubarService.updateMenubar(this.nativeHostService.windowId, menubarData);
		}
	}

	private getMenubarMenus(menubarData: IMenubarData): boolean {
		if (!menubarData) {
			return false;
		}

		menubarData.keybindings = this.getAdditionalKeybindings();
		for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
			const menu = this.menus[topLevelMenuName];
			if (menu) {
				const menubarMenu: IMenubarMenu = { items: [] };
				const menuActions = getFlatContextMenuActions(menu.getActions({ shouldForwardArgs: true }));
				this.populateMenuItems(menuActions, menubarMenu, menubarData.keybindings);
				if (menubarMenu.items.length === 0) {
					return false; // Menus are incomplete
				}
				menubarData.menus[topLevelMenuName] = menubarMenu;
			}
		}

		return true;
	}

	private populateMenuItems(menuActions: readonly IAction[], menuToPopulate: IMenubarMenu, keybindings: { [id: string]: IMenubarKeybinding | undefined }) {
		for (const menuItem of menuActions) {
			if (menuItem instanceof Separator) {
				menuToPopulate.items.push({ id: 'vscode.menubar.separator' });
			} else if (menuItem instanceof MenuItemAction || menuItem instanceof SubmenuItemAction) {

				// use mnemonicTitle whenever possible
				const title = typeof menuItem.item.title === 'string'
					? menuItem.item.title
					: menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;

				if (menuItem instanceof SubmenuItemAction) {
					const submenu = { items: [] };

					this.populateMenuItems(menuItem.actions, submenu, keybindings);

					if (submenu.items.length > 0) {
						const menubarSubmenuItem: IMenubarMenuItemSubmenu = {
							id: menuItem.id,
							label: title,
							submenu
						};

						menuToPopulate.items.push(menubarSubmenuItem);
					}
				} else {
					if (menuItem.id === OpenRecentAction.ID) {
						const actions = this.getOpenRecentActions().map(this.transformOpenRecentAction);
						menuToPopulate.items.push(...actions);
					}

					const menubarMenuItem: IMenubarMenuItemAction = {
						id: menuItem.id,
						label: title
					};

					if (isICommandActionToggleInfo(menuItem.item.toggled)) {
						menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
					}

					if (menuItem.checked) {
						menubarMenuItem.checked = true;
					}

					if (!menuItem.enabled) {
						menubarMenuItem.enabled = false;
					}

					keybindings[menuItem.id] = this.getMenubarKeybinding(menuItem.id);
					menuToPopulate.items.push(menubarMenuItem);
				}
			}
		}
	}

	private transformOpenRecentAction(action: Separator | IOpenRecentAction): MenubarMenuItem {
		if (action instanceof Separator) {
			return { id: 'vscode.menubar.separator' };
		}

		return {
			id: action.id,
			uri: action.uri,
			remoteAuthority: action.remoteAuthority,
			enabled: action.enabled,
			label: action.label
		};
	}

	private getAdditionalKeybindings(): { [id: string]: IMenubarKeybinding } {
		const keybindings: { [id: string]: IMenubarKeybinding } = {};
		if (isMacintosh) {
			const keybinding = this.getMenubarKeybinding('workbench.action.quit');
			if (keybinding) {
				keybindings['workbench.action.quit'] = keybinding;
			}
		}

		return keybindings;
	}

	private getMenubarKeybinding(id: string): IMenubarKeybinding | undefined {
		const binding = this.keybindingService.lookupKeybinding(id);
		if (!binding) {
			return undefined;
		}

		// first try to resolve a native accelerator
		const electronAccelerator = binding.getElectronAccelerator();
		if (electronAccelerator) {
			return { label: electronAccelerator, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
		}

		// we need this fallback to support keybindings that cannot show in electron menus (e.g. chords)
		const acceleratorLabel = binding.getLabel();
		if (acceleratorLabel) {
			return { label: acceleratorLabel, isNative: false, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
		}

		return undefined;
	}
}
