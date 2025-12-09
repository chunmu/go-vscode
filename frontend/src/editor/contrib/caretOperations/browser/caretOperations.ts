/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorAction, IActionOptions, registerEditorAction, ServicesAccessor } from '../../../browser/editorExtensions.ts';
import { ICommand } from '../../../common/editorCommon.ts';
import { EditorContextKeys } from '../../../common/editorContextKeys.ts';
import { MoveCaretCommand } from './moveCaretCommand.ts';
import * as nls from '../../../../nls.ts';

class MoveCaretAction extends EditorAction {

	private readonly left: boolean;

	constructor(left: boolean, opts: IActionOptions) {
		super(opts);

		this.left = left;
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void {
		if (!editor.hasModel()) {
			return;
		}

		const commands: ICommand[] = [];
		const selections = editor.getSelections();

		for (const selection of selections) {
			commands.push(new MoveCaretCommand(selection, this.left));
		}

		editor.pushUndoStop();
		editor.executeCommands(this.id, commands);
		editor.pushUndoStop();
	}
}

class MoveCaretLeftAction extends MoveCaretAction {
	constructor() {
		super(true, {
			id: 'editor.action.moveCarretLeftAction',
			label: nls.localize2('caret.moveLeft', "Move Selected Text Left"),
			precondition: EditorContextKeys.writable
		});
	}
}

class MoveCaretRightAction extends MoveCaretAction {
	constructor() {
		super(false, {
			id: 'editor.action.moveCarretRightAction',
			label: nls.localize2('caret.moveRight', "Move Selected Text Right"),
			precondition: EditorContextKeys.writable
		});
	}
}

registerEditorAction(MoveCaretLeftAction);
registerEditorAction(MoveCaretRightAction);
