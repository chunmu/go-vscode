/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isEqual } from '../../../../../base/common/resources.ts';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.ts';
import { findDiffEditorContainingCodeEditor } from '../../../../../editor/browser/widget/diffEditor/commands.ts';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.ts';
import { IModifiedFileEntry } from '../../common/chatEditingService.ts';

export function isTextDiffEditorForEntry(accessor: ServicesAccessor, entry: IModifiedFileEntry, editor: ICodeEditor) {
	const diffEditor = findDiffEditorContainingCodeEditor(accessor, editor);
	if (!diffEditor) {
		return false;
	}
	const originalModel = diffEditor.getOriginalEditor().getModel();
	const modifiedModel = diffEditor.getModifiedEditor().getModel();
	return isEqual(originalModel?.uri, entry.originalURI) && isEqual(modifiedModel?.uri, entry.modifiedURI);
}
