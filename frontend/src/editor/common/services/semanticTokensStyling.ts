/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../platform/instantiation/common/instantiation.ts';
import { DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider } from '../languages.ts';
import { SemanticTokensProviderStyling } from './semanticTokensProviderStyling.ts';

export const ISemanticTokensStylingService = createDecorator<ISemanticTokensStylingService>('semanticTokensStylingService');

export type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;

export interface ISemanticTokensStylingService {
	readonly _serviceBrand: undefined;

	getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
