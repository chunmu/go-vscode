/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.ts';
import { URI } from '../../../base/common/uri.ts';
import { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from '../model.ts';
import { ILanguageSelection } from '../languages/language.ts';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.ts';
import { DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider } from '../languages.ts';
import { TextModelEditSource } from '../textModelEditSource.ts';

export const IModelService = createDecorator<IModelService>('modelService');

export type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;

export interface IModelService {
	readonly _serviceBrand: undefined;

	createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;

	updateModel(model: ITextModel, value: string | ITextBufferFactory, reason?: TextModelEditSource): void;

	destroyModel(resource: URI): void;

	getModels(): ITextModel[];

	getCreationOptions(language: string, resource: URI, isForSimpleWidget: boolean): ITextModelCreationOptions;

	getModel(resource: URI): ITextModel | null;

	readonly onModelAdded: Event<ITextModel>;

	readonly onModelRemoved: Event<ITextModel>;

	readonly onModelLanguageChanged: Event<{ readonly model: ITextModel; readonly oldLanguageId: string }>;
}
