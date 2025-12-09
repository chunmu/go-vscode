/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../nls.ts';
import { Categories } from '../../action/common/actionCommonCategories.ts';
import { Action2, IMenuService } from './actions.ts';
import { ServicesAccessor } from '../../instantiation/common/instantiation.ts';
import { ILogService } from '../../log/common/log.ts';

export class MenuHiddenStatesReset extends Action2 {

	constructor() {
		super({
			id: 'menu.resetHiddenStates',
			title: localize2('title', "Reset All Menus"),
			category: Categories.View,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		accessor.get(IMenuService).resetHiddenStates();
		accessor.get(ILogService).info('did RESET all menu hidden states');
	}
}
