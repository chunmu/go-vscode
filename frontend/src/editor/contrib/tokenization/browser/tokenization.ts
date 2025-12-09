/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StopWatch } from '../../../../base/common/stopwatch.ts';
import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorAction, registerEditorAction, ServicesAccessor } from '../../../browser/editorExtensions.ts';
import * as nls from '../../../../nls.ts';

class ForceRetokenizeAction extends EditorAction {
	constructor() {
		super({
			id: 'editor.action.forceRetokenize',
			label: nls.localize2('forceRetokenize', "Developer: Force Retokenize"),
			precondition: undefined
		});
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void {
		if (!editor.hasModel()) {
			return;
		}
		const model = editor.getModel();
		model.tokenization.resetTokenization();
		const sw = new StopWatch();
		model.tokenization.forceTokenization(model.getLineCount());
		sw.stop();
		console.log(`tokenization took ${sw.elapsed()}`);

	}
}

registerEditorAction(ForceRetokenizeAction);
