/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../../../base/common/event.ts';
import { derived, IObservable } from '../../../../../../base/common/observable.ts';
import { InlineCompletionsModel, isSuggestionInViewport } from '../../model/inlineCompletionsModel.ts';
import { InlineSuggestHint } from '../../model/inlineSuggestionItem.ts';
import { InlineCompletionViewData, InlineCompletionViewKind, InlineEditTabAction } from './inlineEditsViewInterface.ts';
import { InlineEditWithChanges } from './inlineEditWithChanges.ts';

/**
 * Warning: This is not per inline edit id and gets created often.
 * @deprecated TODO@hediet remove
*/
export class ModelPerInlineEdit {

	readonly isInDiffEditor: boolean;

	readonly displayLocation: InlineSuggestHint | undefined;


	/** Determines if the inline suggestion is fully in the view port */
	readonly inViewPort: IObservable<boolean>;

	readonly onDidAccept: Event<void>;

	constructor(
		private readonly _model: InlineCompletionsModel,
		readonly inlineEdit: InlineEditWithChanges,
		readonly tabAction: IObservable<InlineEditTabAction>,
	) {
		this.isInDiffEditor = this._model.isInDiffEditor;

		this.displayLocation = this.inlineEdit.inlineCompletion.hint;

		this.inViewPort = derived(this, reader => isSuggestionInViewport(this._model.editor, this.inlineEdit.inlineCompletion, reader));
		this.onDidAccept = this._model.onDidAccept;
	}

	accept() {
		this._model.accept();
	}

	handleInlineEditShown(viewKind: InlineCompletionViewKind, viewData: InlineCompletionViewData) {
		this._model.handleInlineSuggestionShown(this.inlineEdit.inlineCompletion, viewKind, viewData);
	}
}
