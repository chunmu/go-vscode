/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.ts';
import { WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.ts';
import { EditorExtensions, IEditorFactoryRegistry } from '../../../common/editor.ts';
import { ComplexCustomWorkingCopyEditorHandler as ComplexCustomWorkingCopyEditorHandler, CustomEditorInputSerializer } from './customEditorInputFactory.ts';
import { ICustomEditorService } from '../common/customEditor.ts';
import { WebviewEditor } from '../../webviewPanel/browser/webviewEditor.ts';
import { CustomEditorInput } from './customEditorInput.ts';
import { CustomEditorService } from './customEditors.ts';

registerSingleton(ICustomEditorService, CustomEditorService, InstantiationType.Delayed);

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane)
	.registerEditorPane(
		EditorPaneDescriptor.create(
			WebviewEditor,
			WebviewEditor.ID,
			'Webview Editor',
		), [
		new SyncDescriptor(CustomEditorInput)
	]);

Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory)
	.registerEditorSerializer(CustomEditorInputSerializer.ID, CustomEditorInputSerializer);

registerWorkbenchContribution2(ComplexCustomWorkingCopyEditorHandler.ID, ComplexCustomWorkingCopyEditorHandler, WorkbenchPhase.BlockStartup);
