/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../platform/instantiation/common/extensions.ts';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.ts';
import { VSDataTransfer } from '../../../base/common/dataTransfer.ts';
import { ITreeViewsDnDService as ITreeViewsDnDServiceCommon, TreeViewsDnDService } from './treeViewsDnd.ts';

export interface ITreeViewsDnDService extends ITreeViewsDnDServiceCommon<VSDataTransfer> { }
export const ITreeViewsDnDService = createDecorator<ITreeViewsDnDService>('treeViewsDndService');
registerSingleton(ITreeViewsDnDService, TreeViewsDnDService, InstantiationType.Delayed);
