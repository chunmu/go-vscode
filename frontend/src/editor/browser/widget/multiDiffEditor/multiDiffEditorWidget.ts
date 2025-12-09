/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Dimension } from '../../../../base/browser/dom.ts';
import { Event } from '../../../../base/common/event.ts';
import { readHotReloadableExport } from '../../../../base/common/hotReloadHelpers.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { derived, observableValue, recomputeInitiallyAndOnChange } from '../../../../base/common/observable.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { Range } from '../../../common/core/range.ts';
import { IDiffEditor } from '../../../common/editorCommon.ts';
import { ICodeEditor } from '../../editorBrowser.ts';
import { DiffEditorWidget } from '../diffEditor/diffEditorWidget.ts';
import './colors.ts';
import { DiffEditorItemTemplate } from './diffEditorItemTemplate.ts';
import { IDocumentDiffItem, IMultiDiffEditorModel } from './model.ts';
import { MultiDiffEditorViewModel } from './multiDiffEditorViewModel.ts';
import { IMultiDiffEditorViewState, IMultiDiffResourceId, MultiDiffEditorWidgetImpl } from './multiDiffEditorWidgetImpl.ts';
import { IWorkbenchUIElementFactory } from './workbenchUIElementFactory.ts';

export class MultiDiffEditorWidget extends Disposable {
	private readonly _dimension = observableValue<Dimension | undefined>(this, undefined);
	private readonly _viewModel = observableValue<MultiDiffEditorViewModel | undefined>(this, undefined);

	private readonly _widgetImpl = derived(this, (reader) => {
		readHotReloadableExport(DiffEditorItemTemplate, reader);
		return reader.store.add(this._instantiationService.createInstance((
			readHotReloadableExport(MultiDiffEditorWidgetImpl, reader)),
			this._element,
			this._dimension,
			this._viewModel,
			this._workbenchUIElementFactory,
		));
	});

	constructor(
		private readonly _element: HTMLElement,
		private readonly _workbenchUIElementFactory: IWorkbenchUIElementFactory,
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
	) {
		super();

		this._register(recomputeInitiallyAndOnChange(this._widgetImpl));
	}

	public reveal(resource: IMultiDiffResourceId, options?: RevealOptions): void {
		this._widgetImpl.get().reveal(resource, options);
	}

	public createViewModel(model: IMultiDiffEditorModel): MultiDiffEditorViewModel {
		return new MultiDiffEditorViewModel(model, this._instantiationService);
	}

	public setViewModel(viewModel: MultiDiffEditorViewModel | undefined): void {
		this._viewModel.set(viewModel, undefined);
	}

	public layout(dimension: Dimension): void {
		this._dimension.set(dimension, undefined);
	}

	private readonly _activeControl = derived(this, (reader) => this._widgetImpl.read(reader).activeControl.read(reader));

	public getActiveControl(): DiffEditorWidget | undefined {
		return this._activeControl.get();
	}

	public readonly onDidChangeActiveControl = Event.fromObservableLight(this._activeControl);

	public getViewState(): IMultiDiffEditorViewState {
		return this._widgetImpl.get().getViewState();
	}

	public setViewState(viewState: IMultiDiffEditorViewState): void {
		this._widgetImpl.get().setViewState(viewState);
	}

	public tryGetCodeEditor(resource: URI): { diffEditor: IDiffEditor; editor: ICodeEditor } | undefined {
		return this._widgetImpl.get().tryGetCodeEditor(resource);
	}

	public findDocumentDiffItem(resource: URI): IDocumentDiffItem | undefined {
		return this._widgetImpl.get().findDocumentDiffItem(resource);
	}

	public goToNextChange(): void {
		this._widgetImpl.get().goToNextChange();
	}

	public goToPreviousChange(): void {
		this._widgetImpl.get().goToPreviousChange();
	}
}

export interface RevealOptions {
	range?: Range;
	highlight: boolean;
}
