/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MarkdownString } from '../../../../base/common/htmlContent.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorContributionInstantiation, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { EditorOption } from '../../../common/config/editorOptions.ts';
import { IEditorContribution } from '../../../common/editorCommon.ts';
import { MessageController } from '../../message/browser/messageController.ts';
import * as nls from '../../../../nls.ts';

export class ReadOnlyMessageController extends Disposable implements IEditorContribution {

	public static readonly ID = 'editor.contrib.readOnlyMessageController';

	constructor(
		private readonly editor: ICodeEditor
	) {
		super();
		this._register(this.editor.onDidAttemptReadOnlyEdit(() => this._onDidAttemptReadOnlyEdit()));
	}

	private _onDidAttemptReadOnlyEdit(): void {
		const messageController = MessageController.get(this.editor);
		if (messageController && this.editor.hasModel()) {
			let message = this.editor.getOptions().get(EditorOption.readOnlyMessage);
			if (!message) {
				if (this.editor.isSimpleWidget) {
					message = new MarkdownString(nls.localize('editor.simple.readonly', "Cannot edit in read-only input"));
				} else {
					message = new MarkdownString(nls.localize('editor.readonly', "Cannot edit in read-only editor"));
				}
			}

			messageController.showMessage(message, this.editor.getPosition());
		}
	}
}

registerEditorContribution(ReadOnlyMessageController.ID, ReadOnlyMessageController, EditorContributionInstantiation.BeforeFirstInteraction);
