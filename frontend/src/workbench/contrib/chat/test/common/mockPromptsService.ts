/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { Emitter, Event } from '../../../../../base/common/event.ts';
import { IDisposable } from '../../../../../base/common/lifecycle.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { ITextModel } from '../../../../../editor/common/model.ts';
import { IExtensionDescription } from '../../../../../platform/extensions/common/extensions.ts';
import { PromptsType } from '../../common/promptSyntax/promptTypes.ts';
import { ParsedPromptFile } from '../../common/promptSyntax/promptFileParser.ts';
import { IClaudeSkill, ICustomAgent, IPromptPath, IPromptsService, PromptsStorage } from '../../common/promptSyntax/service/promptsService.ts';
import { ResourceSet } from '../../../../../base/common/map.ts';

export class MockPromptsService implements IPromptsService {

	_serviceBrand: undefined;

	private readonly _onDidChangeCustomChatModes = new Emitter<void>();
	readonly onDidChangeCustomAgents = this._onDidChangeCustomChatModes.event;

	private _customModes: ICustomAgent[] = [];

	setCustomModes(modes: ICustomAgent[]): void {
		this._customModes = modes;
		this._onDidChangeCustomChatModes.fire();
	}

	async getCustomAgents(token: CancellationToken): Promise<readonly ICustomAgent[]> {
		return this._customModes;
	}

	// Stub implementations for required interface methods
	getSyntaxParserFor(_model: any): any { throw new Error('Not implemented'); }
	listPromptFiles(_type: any): Promise<readonly any[]> { throw new Error('Not implemented'); }
	listPromptFilesForStorage(type: PromptsType, storage: PromptsStorage, token: CancellationToken): Promise<readonly IPromptPath[]> { throw new Error('Not implemented'); }
	getSourceFolders(_type: any): readonly any[] { throw new Error('Not implemented'); }
	isValidSlashCommandName(_command: string): boolean { return false; }
	resolvePromptSlashCommand(command: string, _token: CancellationToken): Promise<any> { throw new Error('Not implemented'); }
	get onDidChangeSlashCommands(): Event<void> { throw new Error('Not implemented'); }
	getPromptSlashCommands(_token: CancellationToken): Promise<any[]> { throw new Error('Not implemented'); }
	getPromptSlashCommandName(uri: URI, _token: CancellationToken): Promise<string> { throw new Error('Not implemented'); }
	parse(_uri: URI, _type: any, _token: CancellationToken): Promise<any> { throw new Error('Not implemented'); }
	parseNew(_uri: URI, _token: CancellationToken): Promise<any> { throw new Error('Not implemented'); }
	getParsedPromptFile(textModel: ITextModel): ParsedPromptFile { throw new Error('Not implemented'); }
	registerContributedFile(type: PromptsType, name: string, description: string, uri: URI, extension: IExtensionDescription): IDisposable { throw new Error('Not implemented'); }
	getPromptLocationLabel(promptPath: IPromptPath): string { throw new Error('Not implemented'); }
	findAgentMDsInWorkspace(token: CancellationToken): Promise<URI[]> { throw new Error('Not implemented'); }
	listAgentMDs(token: CancellationToken): Promise<URI[]> { throw new Error('Not implemented'); }
	listCopilotInstructionsMDs(token: CancellationToken): Promise<URI[]> { throw new Error('Not implemented'); }
	getAgentFileURIFromModeFile(oldURI: URI): URI | undefined { throw new Error('Not implemented'); }
	getDisabledPromptFiles(type: PromptsType): ResourceSet { throw new Error('Method not implemented.'); }
	setDisabledPromptFiles(type: PromptsType, uris: ResourceSet): void { throw new Error('Method not implemented.'); }
	findClaudeSkills(token: CancellationToken): Promise<IClaudeSkill[] | undefined> { throw new Error('Method not implemented.'); }
	dispose(): void { }
}
