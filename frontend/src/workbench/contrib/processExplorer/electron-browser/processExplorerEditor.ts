/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.ts';
import { ProcessExplorerEditor } from '../browser/processExplorerEditor.ts';
import { NativeProcessExplorerControl } from './processExplorerControl.ts';

export class NativeProcessExplorerEditor extends ProcessExplorerEditor {

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super(group, telemetryService, themeService, storageService, instantiationService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.processExplorerControl = this._register(this.instantiationService.createInstance(NativeProcessExplorerControl, parent));
	}
}
