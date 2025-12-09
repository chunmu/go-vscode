/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ILanguageService } from '../../../../editor/common/languages/language.ts';
import { ITextModel } from '../../../../editor/common/model.ts';
import { IModelService } from '../../../../editor/common/services/model.ts';
import { ITextModelContentProvider, ITextModelService } from '../../../../editor/common/services/resolverService.ts';


export class ChatInputBoxContentProvider extends Disposable implements ITextModelContentProvider {
	constructor(
		@ITextModelService textModelService: ITextModelService,
		@IModelService private readonly modelService: IModelService,
		@ILanguageService private readonly languageService: ILanguageService
	) {
		super();
		this._register(textModelService.registerTextModelContentProvider(Schemas.vscodeChatInput, this));
	}

	async provideTextContent(resource: URI): Promise<ITextModel | null> {
		const existing = this.modelService.getModel(resource);
		if (existing) {
			return existing;
		}
		return this.modelService.createModel('', this.languageService.createById('chatinput'), resource);
	}
}
