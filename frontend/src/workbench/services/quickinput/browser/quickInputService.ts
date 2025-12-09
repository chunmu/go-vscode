/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILayoutService } from '../../../../platform/layout/browser/layoutService.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { QuickInputController } from '../../../../platform/quickinput/browser/quickInputController.ts';
import { QuickInputService as BaseQuickInputService } from '../../../../platform/quickinput/browser/quickInputService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.ts';
import { InQuickPickContextKey } from '../../../browser/quickaccess.ts';

export class QuickInputService extends BaseQuickInputService {

	private readonly inQuickInputContext = InQuickPickContextKey.bindTo(this.contextKeyService);

	constructor(
		@IConfigurationService configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IKeybindingService private readonly keybindingService: IKeybindingService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IThemeService themeService: IThemeService,
		@ILayoutService layoutService: ILayoutService,
	) {
		super(instantiationService, contextKeyService, themeService, layoutService, configurationService);

		this.registerListeners();
	}

	private registerListeners(): void {
		this._register(this.onShow(() => this.inQuickInputContext.set(true)));
		this._register(this.onHide(() => this.inQuickInputContext.set(false)));
	}

	protected override createController(): QuickInputController {
		return super.createController(this.layoutService, {
			ignoreFocusOut: () => !this.configurationService.getValue('workbench.quickOpen.closeOnFocusLost'),
			backKeybindingLabel: () => this.keybindingService.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined,
		});
	}
}

registerSingleton(IQuickInputService, QuickInputService, InstantiationType.Delayed);
