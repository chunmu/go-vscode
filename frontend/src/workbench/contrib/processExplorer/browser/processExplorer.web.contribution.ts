/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.ts';
import { EditorExtensions } from '../../../common/editor.ts';
import { ProcessExplorerEditorInput } from './processExplorerEditorInput.ts';
import { ProcessExplorerEditor } from './processExplorerEditor.ts';

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(ProcessExplorerEditor, ProcessExplorerEditor.ID, localize('processExplorer', "Process Explorer")),
	[new SyncDescriptor(ProcessExplorerEditorInput)]
);
