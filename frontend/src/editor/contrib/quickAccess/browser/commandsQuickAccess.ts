/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { stripIcons } from '../../../../base/common/iconLabels.ts';
import { IEditor } from '../../../common/editorCommon.ts';
import { ILocalizedString } from '../../../../nls.ts';
import { isLocalizedString } from '../../../../platform/action/common/action.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { AbstractCommandsQuickAccessProvider, ICommandQuickPick, ICommandsQuickAccessOptions } from '../../../../platform/quickinput/browser/commandsQuickAccess.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';

export abstract class AbstractEditorCommandsQuickAccessProvider extends AbstractCommandsQuickAccessProvider {

	constructor(
		options: ICommandsQuickAccessOptions,
		instantiationService: IInstantiationService,
		keybindingService: IKeybindingService,
		commandService: ICommandService,
		telemetryService: ITelemetryService,
		dialogService: IDialogService
	) {
		super(options, instantiationService, keybindingService, commandService, telemetryService, dialogService);
	}

	/**
	 * Subclasses to provide the current active editor control.
	 */
	protected abstract activeTextEditorControl: IEditor | undefined;

	protected getCodeEditorCommandPicks(): ICommandQuickPick[] {
		const activeTextEditorControl = this.activeTextEditorControl;
		if (!activeTextEditorControl) {
			return [];
		}

		const editorCommandPicks: ICommandQuickPick[] = [];
		for (const editorAction of activeTextEditorControl.getSupportedActions()) {
			let commandDescription: undefined | ILocalizedString;
			if (editorAction.metadata?.description) {
				if (isLocalizedString(editorAction.metadata.description)) {
					commandDescription = editorAction.metadata.description;
				} else {
					commandDescription = { original: editorAction.metadata.description, value: editorAction.metadata.description };
				}
			}
			editorCommandPicks.push({
				commandId: editorAction.id,
				commandAlias: editorAction.alias,
				commandDescription,
				label: stripIcons(editorAction.label) || editorAction.id,
			});
		}

		return editorCommandPicks;
	}
}
