/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../../../base/common/lifecycle.ts';
import { autorun } from '../../../../../../base/common/observable.ts';
import { localize } from '../../../../../../nls.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.ts';
import { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID } from './cellDiagnosticsActions.ts';
import { NotebookStatusBarController } from '../cellStatusBar/executionStatusBarItemController.ts';
import { INotebookEditor, INotebookEditorContribution, INotebookViewModel } from '../../notebookBrowser.ts';
import { registerNotebookContribution } from '../../notebookEditorExtensions.ts';
import { CodeCellViewModel } from '../../viewModel/codeCellViewModel.ts';
import { INotebookCellStatusBarItem, CellStatusbarAlignment } from '../../../common/notebookCommon.ts';
import { ICellExecutionError } from '../../../common/notebookExecutionStateService.ts';
import { IChatAgentService } from '../../../../chat/common/chatAgents.ts';
import { ChatAgentLocation } from '../../../../chat/common/constants.ts';

export class DiagnosticCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
	static id: string = 'workbench.notebook.statusBar.diagtnostic';

	constructor(
		notebookEditor: INotebookEditor,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super();
		this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) =>
			cell instanceof CodeCellViewModel ?
				instantiationService.createInstance(DiagnosticCellStatusBarItem, vm, cell) :
				Disposable.None
		));
	}
}
registerNotebookContribution(DiagnosticCellStatusBarContrib.id, DiagnosticCellStatusBarContrib);


class DiagnosticCellStatusBarItem extends Disposable {
	private _currentItemIds: string[] = [];

	constructor(
		private readonly _notebookViewModel: INotebookViewModel,
		private readonly cell: CodeCellViewModel,
		@IKeybindingService private readonly keybindingService: IKeybindingService,
		@IChatAgentService private readonly chatAgentService: IChatAgentService,
	) {
		super();
		this._register(autorun((reader) => this.updateSparkleItem(reader.readObservable(cell.executionErrorDiagnostic))));
	}

	private hasNotebookAgent(): boolean {
		const agents = this.chatAgentService.getAgents();
		return !!agents.find(agent => agent.locations.includes(ChatAgentLocation.Notebook));
	}

	private async updateSparkleItem(error: ICellExecutionError | undefined) {
		let item: INotebookCellStatusBarItem | undefined;

		if (error?.location && this.hasNotebookAgent()) {
			const keybinding = this.keybindingService.lookupKeybinding(OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID)?.getLabel();
			const tooltip = localize('notebook.cell.status.diagnostic', "Quick Actions {0}", `(${keybinding})`);

			item = {
				text: `$(sparkle)`,
				tooltip,
				alignment: CellStatusbarAlignment.Left,
				command: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
				priority: Number.MAX_SAFE_INTEGER - 1
			};
		}

		const items = item ? [item] : [];
		this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items }]);
	}

	override dispose() {
		super.dispose();
		this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items: [] }]);
	}
}
