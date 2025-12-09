/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../../base/common/uri.ts';
import { createDecorator } from '../../../../../platform/instantiation/common/instantiation.ts';
import { INotebookDiffResult } from '../notebookCommon.ts';

export const ID_NOTEBOOK_EDITOR_WORKER_SERVICE = 'notebookEditorWorkerService';
export const INotebookEditorWorkerService = createDecorator<INotebookEditorWorkerService>(ID_NOTEBOOK_EDITOR_WORKER_SERVICE);

export interface INotebookEditorWorkerService {
	readonly _serviceBrand: undefined;

	canComputeDiff(original: URI, modified: URI): boolean;
	computeDiff(original: URI, modified: URI): Promise<INotebookDiffResult>;
	canPromptRecommendation(model: URI): Promise<boolean>;
}
