/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../../../base/browser/dom.ts';
import { IListVirtualDelegate } from '../../../../../../base/browser/ui/list/list.ts';
import { IListAccessibilityProvider } from '../../../../../../base/browser/ui/list/listWidget.ts';
import { ITreeNode, ITreeRenderer } from '../../../../../../base/browser/ui/tree/tree.ts';
import { FuzzyScore } from '../../../../../../base/common/filters.ts';
import { DisposableStore } from '../../../../../../base/common/lifecycle.ts';
import { observableValue } from '../../../../../../base/common/observable.ts';
import { ILocalizedString, localize, localize2 } from '../../../../../../nls.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { WorkbenchObjectTree } from '../../../../../../platform/list/browser/listService.ts';
import { DebugExpressionRenderer } from '../../../../debug/browser/debugExpressionRenderer.ts';
import { INotebookVariableElement } from './notebookVariablesDataSource.ts';

const $ = dom.$;
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;

export const NOTEBOOK_TITLE: ILocalizedString = localize2('notebook.notebookVariables', "Notebook Variables");
export const REPL_TITLE: ILocalizedString = localize2('notebook.ReplVariables', "REPL Variables");

export class NotebookVariablesTree extends WorkbenchObjectTree<INotebookVariableElement> { }

export class NotebookVariablesDelegate implements IListVirtualDelegate<INotebookVariableElement> {

	getHeight(element: INotebookVariableElement): number {
		return 22;
	}

	getTemplateId(element: INotebookVariableElement): string {
		return NotebookVariableRenderer.ID;
	}
}


export interface IVariableTemplateData {
	expression: HTMLElement;
	name: HTMLSpanElement;
	value: HTMLSpanElement;
	elementDisposables: DisposableStore;
}

export class NotebookVariableRenderer implements ITreeRenderer<INotebookVariableElement, FuzzyScore, IVariableTemplateData> {

	private expressionRenderer: DebugExpressionRenderer;

	static readonly ID = 'variableElement';

	get templateId(): string {
		return NotebookVariableRenderer.ID;
	}

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		this.expressionRenderer = instantiationService.createInstance(DebugExpressionRenderer);
	}

	renderTemplate(container: HTMLElement): IVariableTemplateData {
		const expression = dom.append(container, $('.expression'));
		const name = dom.append(expression, $('span.name'));
		const value = dom.append(expression, $('span.value'));

		const template: IVariableTemplateData = { expression, name, value, elementDisposables: new DisposableStore() };

		return template;
	}

	renderElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, _index: number, data: IVariableTemplateData): void {
		const text = element.element.value.trim() !== '' ? `${element.element.name}:` : element.element.name;
		data.name.textContent = text;
		data.name.title = element.element.type ?? '';

		data.elementDisposables.add(this.expressionRenderer.renderValue(data.value, element.element, {
			colorize: true,
			maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
			session: undefined,
		}));
	}

	disposeElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, index: number, templateData: IVariableTemplateData): void {
		templateData.elementDisposables.clear();
	}


	disposeTemplate(templateData: IVariableTemplateData): void {
		templateData.elementDisposables.dispose();
	}
}

export class NotebookVariableAccessibilityProvider implements IListAccessibilityProvider<INotebookVariableElement> {

	private _widgetAriaLabel = observableValue('widgetAriaLabel', NOTEBOOK_TITLE.value);

	getWidgetAriaLabel() {
		return this._widgetAriaLabel;
	}

	updateWidgetAriaLabel(label: string): void {
		this._widgetAriaLabel.set(label, undefined);
	}

	getAriaLabel(element: INotebookVariableElement): string {
		return localize('notebookVariableAriaLabel', "Variable {0}, value {1}", element.name, element.value);
	}
}
