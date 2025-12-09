/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMenuService, registerAction2 } from './actions.ts';
import { MenuHiddenStatesReset } from './menuResetAction.ts';
import { MenuService } from './menuService.ts';
import { InstantiationType, registerSingleton } from '../../instantiation/common/extensions.ts';

registerSingleton(IMenuService, MenuService, InstantiationType.Delayed);

registerAction2(MenuHiddenStatesReset);
