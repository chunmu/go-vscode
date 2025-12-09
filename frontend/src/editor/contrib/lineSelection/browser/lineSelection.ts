/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.ts';
import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorAction, registerEditorAction, ServicesAccessor } from '../../../browser/editorExtensions.ts';
import { CursorChangeReason } from '../../../common/cursorEvents.ts';
import { CursorMoveCommands } from '../../../common/cursor/cursorMoveCommands.ts';
import { EditorContextKeys } from '../../../common/editorContextKeys.ts';
import * as nls from '../../../../nls.ts';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.ts';

interface ExpandLinesSelectionArgs {
	source?: string;
}

export class ExpandLineSelectionAction extends EditorAction {
	constructor() {
		super({
			id: 'expandLineSelection',
			label: nls.localize2('expandLineSelection', "Expand Line Selection"),
			precondition: undefined,
			kbOpts: {
				weight: KeybindingWeight.EditorCore,
				kbExpr: EditorContextKeys.textInputFocus,
				primary: KeyMod.CtrlCmd | KeyCode.KeyL
			},
		});
	}

	public run(_accessor: ServicesAccessor, editor: ICodeEditor, args: ExpandLinesSelectionArgs): void {
		args = args || {};
		if (!editor.hasModel()) {
			return;
		}
		const viewModel = editor._getViewModel();
		viewModel.model.pushStackElement();
		viewModel.setCursorStates(
			args.source,
			CursorChangeReason.Explicit,
			CursorMoveCommands.expandLineSelection(viewModel, viewModel.getCursorStates())
		);
		viewModel.revealAllCursors(args.source, true);
	}
}

registerEditorAction(ExpandLineSelectionAction);
