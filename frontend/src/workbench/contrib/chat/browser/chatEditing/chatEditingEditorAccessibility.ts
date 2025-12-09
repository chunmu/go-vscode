/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.ts';
import { autorun, observableFromEvent } from '../../../../../base/common/observable.ts';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.ts';
import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { IEditorService } from '../../../../services/editor/common/editorService.ts';
import { IChatEditingService } from '../../common/chatEditingService.ts';

export class ChatEditingEditorAccessibility implements IWorkbenchContribution {

	static readonly ID = 'chat.edits.accessibilty';

	private readonly _store = new DisposableStore();

	constructor(
		@IChatEditingService chatEditingService: IChatEditingService,
		@IEditorService editorService: IEditorService,
		@IAccessibilitySignalService accessibilityService: IAccessibilitySignalService
	) {

		const activeUri = observableFromEvent(this, editorService.onDidActiveEditorChange, () => editorService.activeEditorPane?.input.resource);

		this._store.add(autorun(r => {

			const editor = activeUri.read(r);
			if (!editor) {
				return;
			}

			const entry = chatEditingService.editingSessionsObs.read(r).find(session => session.readEntry(editor, r));
			if (entry) {
				accessibilityService.playSignal(AccessibilitySignal.chatEditModifiedFile);
			}
		}));
	}

	dispose(): void {
		this._store.dispose();
	}
}
