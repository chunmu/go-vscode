/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.ts';
import { IQuickAccessRegistry, Extensions } from '../../../../platform/quickinput/common/quickAccess.ts';
import { QuickCommandNLS } from '../../../common/standaloneStrings.ts';
import { ICommandQuickPick } from '../../../../platform/quickinput/browser/commandsQuickAccess.ts';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.ts';
import { AbstractEditorCommandsQuickAccessProvider } from '../../../contrib/quickAccess/browser/commandsQuickAccess.ts';
import { IEditor } from '../../../common/editorCommon.ts';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { EditorAction, registerEditorAction } from '../../../browser/editorExtensions.ts';
import { EditorContextKeys } from '../../../common/editorContextKeys.ts';
import { KeyCode } from '../../../../base/common/keyCodes.ts';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.ts';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.ts';

export class StandaloneCommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {

	protected get activeTextEditorControl(): IEditor | undefined { return this.codeEditorService.getFocusedCodeEditor() ?? undefined; }

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ICodeEditorService private readonly codeEditorService: ICodeEditorService,
		@IKeybindingService keybindingService: IKeybindingService,
		@ICommandService commandService: ICommandService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IDialogService dialogService: IDialogService
	) {
		super({ showAlias: false }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
	}

	protected async getCommandPicks(): Promise<Array<ICommandQuickPick>> {
		return this.getCodeEditorCommandPicks();
	}

	protected hasAdditionalCommandPicks(): boolean {
		return false;
	}

	protected async getAdditionalCommandPicks(): Promise<ICommandQuickPick[]> {
		return [];
	}
}

export class GotoLineAction extends EditorAction {

	static readonly ID = 'editor.action.quickCommand';

	constructor() {
		super({
			id: GotoLineAction.ID,
			label: QuickCommandNLS.quickCommandActionLabel,
			alias: 'Command Palette',
			precondition: undefined,
			kbOpts: {
				kbExpr: EditorContextKeys.focus,
				primary: KeyCode.F1,
				weight: KeybindingWeight.EditorContrib
			},
			contextMenuOpts: {
				group: 'z_commands',
				order: 1
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		accessor.get(IQuickInputService).quickAccess.show(StandaloneCommandsQuickAccessProvider.PREFIX);
	}
}

registerEditorAction(GotoLineAction);

Registry.as<IQuickAccessRegistry>(Extensions.Quickaccess).registerQuickAccessProvider({
	ctor: StandaloneCommandsQuickAccessProvider,
	prefix: StandaloneCommandsQuickAccessProvider.PREFIX,
	helpEntries: [{ description: QuickCommandNLS.quickCommandHelp, commandId: GotoLineAction.ID }]
});
