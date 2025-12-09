/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { ThemeIcon } from '../../../../base/common/themables.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IRange } from '../../../../editor/common/core/range.ts';
import { Location } from '../../../../editor/common/languages.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';
import { IChatModel } from './chatModel.ts';
import { IChatContentReference, IChatProgressMessage } from './chatService.ts';
import { IDiagnosticVariableEntryFilterData, StringChatContextValue } from './chatVariableEntries.ts';
import { IToolAndToolSetEnablementMap } from './languageModelToolsService.ts';

export interface IChatVariableData {
	id: string;
	name: string;
	icon?: ThemeIcon;
	fullName?: string;
	description: string;
	modelDescription?: string;
	canTakeArgument?: boolean;
}

export interface IChatRequestProblemsVariable {
	id: 'vscode.problems';
	filter: IDiagnosticVariableEntryFilterData;
}

export const isIChatRequestProblemsVariable = (obj: unknown): obj is IChatRequestProblemsVariable =>
	typeof obj === 'object' && obj !== null && 'id' in obj && (obj as IChatRequestProblemsVariable).id === 'vscode.problems';

export type IChatRequestVariableValue = string | URI | Location | Uint8Array | IChatRequestProblemsVariable | StringChatContextValue | unknown;

export type IChatVariableResolverProgress =
	| IChatContentReference
	| IChatProgressMessage;

export interface IChatVariableResolver {
	(messageText: string, arg: string | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
}

export const IChatVariablesService = createDecorator<IChatVariablesService>('IChatVariablesService');

export interface IChatVariablesService {
	_serviceBrand: undefined;
	getDynamicVariables(sessionResource: URI): ReadonlyArray<IDynamicVariable>;
	getSelectedToolAndToolSets(sessionResource: URI): IToolAndToolSetEnablementMap;
}

export interface IDynamicVariable {
	range: IRange;
	id: string;
	fullName?: string;
	icon?: ThemeIcon;
	modelDescription?: string;
	isFile?: boolean;
	isDirectory?: boolean;
	data: IChatRequestVariableValue;
}
