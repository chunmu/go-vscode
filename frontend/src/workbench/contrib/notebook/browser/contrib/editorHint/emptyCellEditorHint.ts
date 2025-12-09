/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Schemas } from '../../../../../../base/common/network.ts';
import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.ts';
import { EditorContributionInstantiation, registerEditorContribution } from '../../../../../../editor/browser/editorExtensions.ts';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.ts';
import { IChatAgentService } from '../../../../chat/common/chatAgents.ts';
import { EmptyTextEditorHintContribution } from '../../../../codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.ts';
import { IInlineChatSessionService } from '../../../../inlineChat/browser/inlineChatSessionService.ts';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.ts';
import { IEditorService } from '../../../../../services/editor/common/editorService.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';

export class EmptyCellEditorHintContribution extends EmptyTextEditorHintContribution {
	public static readonly CONTRIB_ID = 'notebook.editor.contrib.emptyCellEditorHint';
	constructor(
		editor: ICodeEditor,
		@IEditorService private readonly _editorService: IEditorService,
		@IConfigurationService configurationService: IConfigurationService,
		@IInlineChatSessionService inlineChatSessionService: IInlineChatSessionService,
		@IChatAgentService chatAgentService: IChatAgentService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super(
			editor,
			configurationService,
			inlineChatSessionService,
			chatAgentService,
			instantiationService
		);

		const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
		if (!activeEditor) {
			return;
		}

		this._register(activeEditor.onDidChangeActiveCell(() => this.update()));
	}

	protected override shouldRenderHint(): boolean {
		const model = this.editor.getModel();
		if (!model) {
			return false;
		}

		const isNotebookCell = model?.uri.scheme === Schemas.vscodeNotebookCell;
		if (!isNotebookCell) {
			return false;
		}

		const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
		if (!activeEditor || !activeEditor.isDisposed) {
			return false;
		}

		const shouldRenderHint = super.shouldRenderHint();
		if (!shouldRenderHint) {
			return false;
		}

		const activeCell = activeEditor.getActiveCell();

		if (activeCell?.uri.fragment !== model.uri.fragment) {
			return false;
		}

		return true;
	}
}

registerEditorContribution(EmptyCellEditorHintContribution.CONTRIB_ID, EmptyCellEditorHintContribution, EditorContributionInstantiation.Eager); // eager because it needs to render a help message
