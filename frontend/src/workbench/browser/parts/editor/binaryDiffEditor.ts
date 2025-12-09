/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { BINARY_DIFF_EDITOR_ID } from '../../../common/editor.ts';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.ts';
import { IThemeService } from '../../../../platform/theme/common/themeService.ts';
import { SideBySideEditor } from './sideBySideEditor.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { BaseBinaryResourceEditor } from './binaryEditor.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.ts';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.ts';
import { IEditorService } from '../../../services/editor/common/editorService.ts';

/**
 * An implementation of editor for diffing binary files like images or videos.
 */
export class BinaryResourceDiffEditor extends SideBySideEditor {

	static override readonly ID = BINARY_DIFF_EDITOR_ID;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
		@ITextResourceConfigurationService textResourceConfigurationService: ITextResourceConfigurationService,
		@IEditorService editorService: IEditorService,
		@IEditorGroupsService editorGroupService: IEditorGroupsService
	) {
		super(group, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService);
	}

	getMetadata(): string | undefined {
		const primary = this.getPrimaryEditorPane();
		const secondary = this.getSecondaryEditorPane();

		if (primary instanceof BaseBinaryResourceEditor && secondary instanceof BaseBinaryResourceEditor) {
			return localize('metadataDiff', "{0} ↔ {1}", secondary.getMetadata(), primary.getMetadata());
		}

		return undefined;
	}
}
