/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../../../base/common/cancellation.ts';
import { Position } from '../../../../../../editor/common/core/position.ts';
import { Range } from '../../../../../../editor/common/core/range.ts';
import { Definition, DefinitionProvider } from '../../../../../../editor/common/languages.ts';
import { ITextModel } from '../../../../../../editor/common/model.ts';
import { IChatModeService } from '../../chatModes.ts';
import { getPromptsTypeForLanguageId } from '../promptTypes.ts';
import { PromptHeaderAttributes } from '../promptFileParser.ts';
import { IPromptsService } from '../service/promptsService.ts';

export class PromptHeaderDefinitionProvider implements DefinitionProvider {
	/**
	 * Debug display name for this provider.
	 */
	public readonly _debugDisplayName: string = 'PromptHeaderDefinitionProvider';

	constructor(
		@IPromptsService private readonly promptsService: IPromptsService,
		@IChatModeService private readonly chatModeService: IChatModeService,
	) {
	}

	async provideDefinition(model: ITextModel, position: Position, token: CancellationToken): Promise<Definition | undefined> {
		const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
		if (!promptType) {
			// if the model is not a prompt, we don't provide any definitions
			return undefined;
		}

		const promptAST = this.promptsService.getParsedPromptFile(model);
		const header = promptAST.header;
		if (!header) {
			return undefined;
		}

		const agentAttr = header.getAttribute(PromptHeaderAttributes.agent) ?? header.getAttribute(PromptHeaderAttributes.mode);
		if (agentAttr && agentAttr.value.type === 'string' && agentAttr.range.containsPosition(position)) {
			const agent = this.chatModeService.findModeByName(agentAttr.value.value);
			if (agent && agent.uri) {
				return {
					uri: agent.uri.get(),
					range: new Range(1, 1, 1, 1)
				};
			}
		}
		return undefined;
	}

}
