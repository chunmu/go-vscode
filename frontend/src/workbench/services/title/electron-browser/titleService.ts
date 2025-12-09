/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { NativeTitleService } from '../../../electron-browser/parts/titlebar/titlebarPart.ts';
import { ITitleService } from '../browser/titleService.ts';

registerSingleton(ITitleService, NativeTitleService, InstantiationType.Eager);
