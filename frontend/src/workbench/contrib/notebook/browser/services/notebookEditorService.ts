/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CodeWindow } from '../../../../../base/browser/window.ts';
import { createDecorator, ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.ts';
import { INotebookEditor, INotebookEditorCreationOptions } from '../notebookBrowser.ts';
import { Event } from '../../../../../base/common/event.ts';
import { Dimension } from '../../../../../base/browser/dom.ts';
import { NotebookEditorWidget } from '../notebookEditorWidget.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.ts';

export const INotebookEditorService = createDecorator<INotebookEditorService>('INotebookEditorWidgetService');

export interface IBorrowValue<T> {
	readonly value: T | undefined;
}

export interface INotebookEditorService {
	_serviceBrand: undefined;

	retrieveWidget(accessor: ServicesAccessor, groupId: number, input: { resource: URI; typeId: string }, creationOptions?: INotebookEditorCreationOptions, dimension?: Dimension, codeWindow?: CodeWindow): IBorrowValue<INotebookEditor>;

	retrieveExistingWidgetFromURI(resource: URI): IBorrowValue<NotebookEditorWidget> | undefined;
	retrieveAllExistingWidgets(): IBorrowValue<NotebookEditorWidget>[];
	readonly onDidAddNotebookEditor: Event<INotebookEditor>;
	readonly onDidRemoveNotebookEditor: Event<INotebookEditor>;
	addNotebookEditor(editor: INotebookEditor): void;
	removeNotebookEditor(editor: INotebookEditor): void;
	getNotebookEditor(editorId: string): INotebookEditor | undefined;
	listNotebookEditors(): readonly INotebookEditor[];
	getNotebookForPossibleCell(editor: ICodeEditor): INotebookEditor | undefined;
	updateReplContextKey(uri: string): void;
}
