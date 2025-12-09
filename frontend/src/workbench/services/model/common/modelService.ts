/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.ts';
import { IModelService } from '../../../../editor/common/services/model.ts';
import { ModelService } from '../../../../editor/common/services/modelService.ts';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { IUndoRedoService } from '../../../../platform/undoRedo/common/undoRedo.ts';
import { IPathService } from '../../path/common/pathService.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';

export class WorkbenchModelService extends ModelService {
	constructor(
		@IConfigurationService configurationService: IConfigurationService,
		@ITextResourcePropertiesService resourcePropertiesService: ITextResourcePropertiesService,
		@IUndoRedoService undoRedoService: IUndoRedoService,
		@IPathService private readonly _pathService: IPathService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super(configurationService, resourcePropertiesService, undoRedoService, instantiationService);
	}

	protected override _schemaShouldMaintainUndoRedoElements(resource: URI) {
		return (
			super._schemaShouldMaintainUndoRedoElements(resource)
			|| resource.scheme === this._pathService.defaultUriScheme
		);
	}
}

registerSingleton(IModelService, WorkbenchModelService, InstantiationType.Delayed);
