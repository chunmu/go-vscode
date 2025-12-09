/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/extensions.ts';
import { IEditorWorkerService } from '../../common/services/editorWorker.ts';
import { EditorWorkerService } from './editorWorkerService.ts';

registerSingleton(IEditorWorkerService, EditorWorkerService, InstantiationType.Eager /* registers link detection and word based suggestions for any document */);
