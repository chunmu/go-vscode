/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NativeWorkingCopyHistoryService } from '../common/workingCopyHistoryService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IWorkingCopyHistoryService } from '../common/workingCopyHistory.ts';

// Register Service
registerSingleton(IWorkingCopyHistoryService, NativeWorkingCopyHistoryService, InstantiationType.Delayed);
