/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Dimension } from '../../../../base/browser/dom.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';
import { EditorPane } from '../../../browser/parts/editor/editorPane.ts';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.ts';
import { BrowserProcessExplorerControl, ProcessExplorerControl } from './processExplorerControl.ts';

export class ProcessExplorerEditor extends EditorPane {

	static readonly ID: string = 'workbench.editor.processExplorer';

	protected processExplorerControl: ProcessExplorerControl | undefined = undefined;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService protected readonly instantiationService: IInstantiationService
	) {
		super(ProcessExplorerEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.processExplorerControl = this._register(this.instantiationService.createInstance(BrowserProcessExplorerControl, parent));
	}

	override focus(): void {
		this.processExplorerControl?.focus();
	}

	override layout(dimension: Dimension): void {
		this.processExplorerControl?.layout(dimension);
	}
}
