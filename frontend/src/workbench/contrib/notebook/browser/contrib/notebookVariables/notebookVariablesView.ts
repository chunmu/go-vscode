/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITreeContextMenuEvent } from '../../../../../../base/browser/ui/tree/tree.ts';
import { RunOnceScheduler } from '../../../../../../base/common/async.ts';
import { URI } from '../../../../../../base/common/uri.ts';
import { getFlatContextMenuActions } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.ts';
import { IMenuService, MenuId } from '../../../../../../platform/actions/common/actions.ts';
import { ICommandService } from '../../../../../../platform/commands/common/commands.ts';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.ts';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.ts';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.ts';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.ts';
import { WorkbenchAsyncDataTree } from '../../../../../../platform/list/browser/listService.ts';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.ts';
import { IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.ts';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.ts';
import { IViewPaneOptions, ViewPane } from '../../../../../browser/parts/views/viewPane.ts';
import { IViewDescriptorService } from '../../../../../common/views.ts';
import { CONTEXT_VARIABLE_EXTENSIONID, CONTEXT_VARIABLE_INTERFACES, CONTEXT_VARIABLE_LANGUAGE, CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_VALUE } from '../../../../debug/common/debug.ts';
import { IEmptyScope, INotebookScope, INotebookVariableElement, NotebookVariableDataSource } from './notebookVariablesDataSource.ts';
import { NOTEBOOK_TITLE, NotebookVariableAccessibilityProvider, NotebookVariableRenderer, NotebookVariablesDelegate, REPL_TITLE } from './notebookVariablesTree.ts';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.ts';
import { NotebookTextModel } from '../../../common/model/notebookTextModel.ts';
import { ICellExecutionStateChangedEvent, IExecutionStateChangedEvent, INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.ts';
import { INotebookKernelService } from '../../../common/notebookKernelService.ts';
import { IEditorService } from '../../../../../services/editor/common/editorService.ts';
import { IEditorCloseEvent, IEditorPane } from '../../../../../common/editor.ts';
import { isCompositeNotebookEditorInput } from '../../../common/notebookEditorInput.ts';

export type contextMenuArg = { source: string; name: string; type?: string; value?: string; expression?: string; language?: string; extensionId?: string };

export class NotebookVariablesView extends ViewPane {

	static readonly ID = 'notebookVariablesView';

	private tree: WorkbenchAsyncDataTree<INotebookScope | IEmptyScope, INotebookVariableElement> | undefined;
	private activeNotebook: NotebookTextModel | undefined;
	private readonly dataSource: NotebookVariableDataSource;
	private readonly accessibilityProvider: NotebookVariableAccessibilityProvider;

	private updateScheduler: RunOnceScheduler;

	constructor(
		options: IViewPaneOptions,
		@IEditorService private readonly editorService: IEditorService,
		@INotebookKernelService private readonly notebookKernelService: INotebookKernelService,
		@INotebookExecutionStateService private readonly notebookExecutionStateService: INotebookExecutionStateService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IConfigurationService configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IOpenerService openerService: IOpenerService,
		@IQuickInputService protected quickInputService: IQuickInputService,
		@ICommandService protected commandService: ICommandService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IMenuService private readonly menuService: IMenuService
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);

		this._register(this.editorService.onDidActiveEditorChange(() => this.handleActiveEditorChange()));
		this._register(this.notebookKernelService.onDidNotebookVariablesUpdate(this.handleVariablesChanged.bind(this)));
		this._register(this.notebookExecutionStateService.onDidChangeExecution(this.handleExecutionStateChange.bind(this)));
		this._register(this.editorService.onDidCloseEditor((e) => this.handleCloseEditor(e)));

		this.accessibilityProvider = new NotebookVariableAccessibilityProvider();
		this.handleActiveEditorChange(false);

		this.dataSource = new NotebookVariableDataSource(this.notebookKernelService);
		this.updateScheduler = new RunOnceScheduler(() => this.tree?.updateChildren(), 100);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.element.classList.add('debug-pane');

		this.tree = this.instantiationService.createInstance(
			WorkbenchAsyncDataTree<INotebookScope | IEmptyScope, INotebookVariableElement>,
			'notebookVariablesTree',
			container,
			new NotebookVariablesDelegate(),
			[this.instantiationService.createInstance(NotebookVariableRenderer)],
			this.dataSource,
			{
				accessibilityProvider: this.accessibilityProvider,
				identityProvider: { getId: (e: INotebookVariableElement) => e.id },
			});

		this.tree.layout();
		if (this.activeNotebook) {
			this.tree.setInput({ kind: 'root', notebook: this.activeNotebook });
		}

		this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
	}

	private onContextMenu(e: ITreeContextMenuEvent<INotebookVariableElement>): void {
		if (!e.element) {
			return;
		}
		const element = e.element;

		const arg: contextMenuArg = {
			source: element.notebook.uri.toString(),
			name: element.name,
			value: element.value,
			type: element.type,
			expression: element.expression,
			language: element.language,
			extensionId: element.extensionId
		};

		const overlayedContext = this.contextKeyService.createOverlay([
			[CONTEXT_VARIABLE_NAME.key, element.name],
			[CONTEXT_VARIABLE_VALUE.key, element.value],
			[CONTEXT_VARIABLE_TYPE.key, element.type],
			[CONTEXT_VARIABLE_INTERFACES.key, element.interfaces],
			[CONTEXT_VARIABLE_LANGUAGE.key, element.language],
			[CONTEXT_VARIABLE_EXTENSIONID.key, element.extensionId]
		]);
		const menuActions = this.menuService.getMenuActions(MenuId.NotebookVariablesContext, overlayedContext, { arg, shouldForwardArgs: true });
		const actions = getFlatContextMenuActions(menuActions);
		this.contextMenuService.showContextMenu({
			getAnchor: () => e.anchor,
			getActions: () => actions
		});
	}

	override focus(): void {
		super.focus();
		this.tree?.domFocus();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		this.tree?.layout(height, width);
	}

	private setActiveNotebook(notebookDocument: NotebookTextModel, editor: IEditorPane, doUpdate = true) {
		this.activeNotebook = notebookDocument;

		if (isCompositeNotebookEditorInput(editor.input)) {
			this.updateTitle(REPL_TITLE.value);
			this.accessibilityProvider.updateWidgetAriaLabel(REPL_TITLE.value);
		} else {
			this.updateTitle(NOTEBOOK_TITLE.value);
			this.accessibilityProvider.updateWidgetAriaLabel(NOTEBOOK_TITLE.value);
		}

		if (doUpdate) {
			this.tree?.setInput({ kind: 'root', notebook: notebookDocument });
			this.updateScheduler.schedule();
		}
	}

	private getActiveNotebook() {
		const notebookEditor = this.editorService.activeEditorPane;
		const notebookDocument = getNotebookEditorFromEditorPane(notebookEditor)?.textModel;
		return notebookDocument && notebookEditor ? { notebookDocument, notebookEditor } : undefined;
	}

	private handleCloseEditor(e: IEditorCloseEvent) {
		if (e.editor.resource && e.editor.resource.toString() === this.activeNotebook?.uri.toString()) {
			this.tree?.setInput({ kind: 'empty' });
			this.updateScheduler.schedule();
		}
	}

	private handleActiveEditorChange(doUpdate = true) {
		const found = this.getActiveNotebook();
		if (found && found.notebookDocument !== this.activeNotebook) {
			this.setActiveNotebook(found.notebookDocument, found.notebookEditor, doUpdate);
		}
	}

	private handleExecutionStateChange(event: ICellExecutionStateChangedEvent | IExecutionStateChangedEvent) {
		if (this.activeNotebook && event.affectsNotebook(this.activeNotebook.uri)) {
			// new execution state means either new variables or the kernel is busy so we shouldn't ask
			this.dataSource.cancel();

			// changed === undefined -> excecution ended
			if (event.changed === undefined) {
				this.updateScheduler.schedule();
			}
			else {
				this.updateScheduler.cancel();
			}
		} else if (!this.getActiveNotebook()) {
			// check if the updated variables are for a visible notebook
			this.editorService.visibleEditorPanes.forEach(editor => {
				const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
				if (notebookDocument && event.affectsNotebook(notebookDocument.uri)) {
					this.setActiveNotebook(notebookDocument, editor);
				}
			});
		}
	}

	private handleVariablesChanged(notebookUri: URI) {
		if (this.activeNotebook && notebookUri.toString() === this.activeNotebook.uri.toString()) {
			this.updateScheduler.schedule();
		} else if (!this.getActiveNotebook()) {
			// check if the updated variables are for a visible notebook
			this.editorService.visibleEditorPanes.forEach(editor => {
				const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
				if (notebookDocument && notebookDocument.uri.toString() === notebookUri.toString()) {
					this.setActiveNotebook(notebookDocument, editor);
				}
			});
		}
	}
}
