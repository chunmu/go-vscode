/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITreeSitterLibraryService } from '../../../../editor/common/services/treeSitter/treeSitterLibraryService.ts';
import { ITreeSitterThemeService } from '../../../../editor/common/services/treeSitter/treeSitterThemeService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { TreeSitterLibraryService } from './treeSitterLibraryService.ts';
import { TreeSitterThemeService } from './treeSitterThemeService.ts';

registerSingleton(ITreeSitterLibraryService, TreeSitterLibraryService, InstantiationType.Eager);
registerSingleton(ITreeSitterThemeService, TreeSitterThemeService, InstantiationType.Eager);
