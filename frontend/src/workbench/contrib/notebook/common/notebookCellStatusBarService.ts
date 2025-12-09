/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { Event } from '../../../../base/common/event.ts';
import { IDisposable } from '../../../../base/common/lifecycle.ts';
import { URI } from '../../../../base/common/uri.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from './notebookCommon.ts';

export const INotebookCellStatusBarService = createDecorator<INotebookCellStatusBarService>('notebookCellStatusBarService');

export interface INotebookCellStatusBarService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeProviders: Event<void>;
	readonly onDidChangeItems: Event<void>;

	registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable;

	getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]>;
}
