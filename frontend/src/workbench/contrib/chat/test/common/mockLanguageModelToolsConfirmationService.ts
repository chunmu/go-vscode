/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '../../../../../base/common/lifecycle.ts';
import { ConfirmedReason } from '../../common/chatService.ts';
import { ILanguageModelToolConfirmationActions, ILanguageModelToolConfirmationContribution, ILanguageModelToolConfirmationRef, ILanguageModelToolsConfirmationService } from '../../common/languageModelToolsConfirmationService.ts';
import { IToolData } from '../../common/languageModelToolsService.ts';

export class MockLanguageModelToolsConfirmationService implements ILanguageModelToolsConfirmationService {
	manageConfirmationPreferences(tools: Readonly<IToolData>[], options?: { defaultScope?: 'workspace' | 'profile' | 'session' }): void {
		throw new Error('Method not implemented.');
	}
	registerConfirmationContribution(toolName: string, contribution: ILanguageModelToolConfirmationContribution): IDisposable {
		throw new Error('Method not implemented.');
	}
	resetToolAutoConfirmation(): void {

	}
	getPreConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined {
		return undefined;
	}
	getPostConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined {
		return undefined;
	}
	getPreConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[] {
		return [];
	}
	getPostConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[] {
		return [];
	}
	declare readonly _serviceBrand: undefined;
}
