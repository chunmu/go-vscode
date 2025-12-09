/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../../../base/common/lifecycle.ts';
import { derived, IObservable } from '../../../../../../base/common/observable.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { ICodeEditor } from '../../../../../browser/editorBrowser.ts';
import { ObservableCodeEditor, observableCodeEditor } from '../../../../../browser/observableCodeEditor.ts';
import { Range } from '../../../../../common/core/range.ts';
import { TextReplacement, TextEdit } from '../../../../../common/core/edits/textEdit.ts';
import { TextModelText } from '../../../../../common/model/textModelText.ts';
import { InlineCompletionsModel } from '../../model/inlineCompletionsModel.ts';
import { InlineEdit } from '../../model/inlineEdit.ts';
import { InlineEditWithChanges } from './inlineEditWithChanges.ts';
import { ModelPerInlineEdit } from './inlineEditsModel.ts';
import { InlineEditsView } from './inlineEditsView.ts';
import { InlineEditTabAction } from './inlineEditsViewInterface.ts';
import { InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from './components/gutterIndicatorView.ts';

export class InlineEditsViewAndDiffProducer extends Disposable { // TODO: This class is no longer a diff producer. Rename it or get rid of it
	private readonly _editorObs: ObservableCodeEditor;

	private readonly _inlineEdit = derived<InlineEditWithChanges | undefined>(this, (reader) => {
		const model = this._model.read(reader);
		if (!model) { return undefined; }
		const inlineEdit = this._edit.read(reader);
		if (!inlineEdit) { return undefined; }
		const textModel = this._editor.getModel();
		if (!textModel) { return undefined; }

		const editOffset = model.inlineEditState.read(undefined)?.inlineSuggestion.updatedEdit;
		if (!editOffset) { return undefined; }

		const edits = editOffset.replacements.map(e => {
			const innerEditRange = Range.fromPositions(
				textModel.getPositionAt(e.replaceRange.start),
				textModel.getPositionAt(e.replaceRange.endExclusive)
			);
			return new TextReplacement(innerEditRange, e.newText);
		});

		const diffEdits = new TextEdit(edits);
		const text = new TextModelText(textModel);

		return new InlineEditWithChanges(text, diffEdits, model.primaryPosition.read(undefined), model.allPositions.read(undefined), inlineEdit.commands, inlineEdit.inlineSuggestion);
	});

	public readonly _inlineEditModel = derived<ModelPerInlineEdit | undefined>(this, reader => {
		const model = this._model.read(reader);
		if (!model) { return undefined; }
		const edit = this._inlineEdit.read(reader);
		if (!edit) { return undefined; }

		const tabAction = derived<InlineEditTabAction>(this, reader => {
			/** @description tabAction */
			if (this._editorObs.isFocused.read(reader)) {
				if (model.tabShouldJumpToInlineEdit.read(reader)) { return InlineEditTabAction.Jump; }
				if (model.tabShouldAcceptInlineEdit.read(reader)) { return InlineEditTabAction.Accept; }
			}
			return InlineEditTabAction.Inactive;
		});

		return new ModelPerInlineEdit(model, edit, tabAction);
	});

	public readonly view: InlineEditsView;

	constructor(
		private readonly _editor: ICodeEditor,
		private readonly _edit: IObservable<InlineEdit | undefined>,
		private readonly _model: IObservable<InlineCompletionsModel | undefined>,
		private readonly _showCollapsed: IObservable<boolean>,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		this._editorObs = observableCodeEditor(this._editor);

		this.view = this._register(instantiationService.createInstance(InlineEditsView, this._editor, this._inlineEditModel,
			this._model.map(model => model ? SimpleInlineSuggestModel.fromInlineCompletionModel(model) : undefined),
			this._inlineEdit.map(e => e ? InlineSuggestionGutterMenuData.fromInlineSuggestion(e.inlineCompletion) : undefined),
			this._showCollapsed,
		));
	}
}
