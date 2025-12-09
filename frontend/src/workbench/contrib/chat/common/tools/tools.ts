/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../../base/common/codicons.ts';
import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { ThemeIcon } from '../../../../../base/common/themables.ts';
import { localize } from '../../../../../nls.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { ILanguageModelToolsService, ToolDataSource, VSCodeToolReference } from '../../common/languageModelToolsService.ts';
import { ConfirmationTool, ConfirmationToolData } from './confirmationTool.ts';
import { EditTool, EditToolData } from './editFileTool.ts';
import { createManageTodoListToolData, ManageTodoListTool, TodoListToolDescriptionFieldSettingId, TodoListToolWriteOnlySettingId } from './manageTodoListTool.ts';
import { RunSubagentTool } from './runSubagentTool.ts';

export class BuiltinToolsContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'chat.builtinTools';

	constructor(
		@ILanguageModelToolsService toolsService: ILanguageModelToolsService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();

		const editTool = instantiationService.createInstance(EditTool);
		this._register(toolsService.registerTool(EditToolData, editTool));

		// Check if write-only mode is enabled for the todo tool
		const writeOnlyMode = this.configurationService.getValue<boolean>(TodoListToolWriteOnlySettingId) === true;
		const includeDescription = this.configurationService.getValue<boolean>(TodoListToolDescriptionFieldSettingId) !== false;
		const todoToolData = createManageTodoListToolData(writeOnlyMode, includeDescription);
		const manageTodoListTool = this._register(instantiationService.createInstance(ManageTodoListTool, writeOnlyMode, includeDescription));
		this._register(toolsService.registerTool(todoToolData, manageTodoListTool));

		// Register the confirmation tool
		const confirmationTool = instantiationService.createInstance(ConfirmationTool);
		this._register(toolsService.registerTool(ConfirmationToolData, confirmationTool));

		const runSubagentTool = this._register(instantiationService.createInstance(RunSubagentTool));
		const runSubagentToolData = runSubagentTool.getToolData();
		this._register(toolsService.registerTool(runSubagentToolData, runSubagentTool));

		const customAgentToolSet = this._register(toolsService.createToolSet(ToolDataSource.Internal, 'custom-agent', VSCodeToolReference.agent, {
			icon: ThemeIcon.fromId(Codicon.agent.id),
			description: localize('toolset.custom-agent', 'Delegate tasks to other agents'),
		}));
		this._register(customAgentToolSet.addTool(runSubagentToolData));
	}
}

export const InternalFetchWebPageToolId = 'vscode_fetchWebPage_internal';
