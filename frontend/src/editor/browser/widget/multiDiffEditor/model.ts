/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, IValueWithChangeEvent } from '../../../../base/common/event.ts';
import { RefCounted } from '../diffEditor/utils.ts';
import { IDiffEditorOptions } from '../../../common/config/editorOptions.ts';
import { ITextModel } from '../../../common/model.ts';
import { ContextKeyValue } from '../../../../platform/contextkey/common/contextkey.ts';

export interface IMultiDiffEditorModel {
	readonly documents: IValueWithChangeEvent<readonly RefCounted<IDocumentDiffItem>[] | 'loading'>;
	readonly contextKeys?: Record<string, ContextKeyValue>;
}

export interface IDocumentDiffItem {
	/**
	 * undefined if the file was created.
	 */
	readonly original: ITextModel | undefined;

	/**
	 * undefined if the file was deleted.
	 */
	readonly modified: ITextModel | undefined;
	readonly options?: IDiffEditorOptions;
	readonly onOptionsDidChange?: Event<void>;
	readonly contextKeys?: Record<string, ContextKeyValue>;
}
