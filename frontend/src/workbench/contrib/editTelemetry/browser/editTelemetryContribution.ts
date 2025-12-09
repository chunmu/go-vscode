/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.ts';
import { autorun, derived } from '../../../../base/common/observable.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.ts';
import { ITelemetryService, TelemetryLevel, telemetryLevelEnabled } from '../../../../platform/telemetry/common/telemetry.ts';
import { AnnotatedDocuments } from './helpers/annotatedDocuments.ts';
import { EditTrackingFeature } from './telemetry/editSourceTrackingFeature.ts';
import { VSCodeWorkspace } from './helpers/vscodeObservableWorkspace.ts';
import { AiStatsFeature } from './editStats/aiStatsFeature.ts';
import { EDIT_TELEMETRY_SETTING_ID, AI_STATS_SETTING_ID } from './settingIds.ts';

export class EditTelemetryContribution extends Disposable {
	constructor(
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
		@ITelemetryService private readonly _telemetryService: ITelemetryService,
	) {
		super();

		const workspace = derived(reader => reader.store.add(this._instantiationService.createInstance(VSCodeWorkspace)));
		const annotatedDocuments = derived(reader => reader.store.add(this._instantiationService.createInstance(AnnotatedDocuments, workspace.read(reader))));

		const editSourceTrackingEnabled = observableConfigValue(EDIT_TELEMETRY_SETTING_ID, true, this._configurationService);
		this._register(autorun(r => {
			const enabled = editSourceTrackingEnabled.read(r);
			if (!enabled || !telemetryLevelEnabled(this._telemetryService, TelemetryLevel.USAGE)) {
				return;
			}
			r.store.add(this._instantiationService.createInstance(EditTrackingFeature, workspace.read(r), annotatedDocuments.read(r)));
		}));

		const aiStatsEnabled = observableConfigValue(AI_STATS_SETTING_ID, true, this._configurationService);
		this._register(autorun(r => {
			const enabled = aiStatsEnabled.read(r);
			if (!enabled) {
				return;
			}

			r.store.add(this._instantiationService.createInstance(AiStatsFeature, annotatedDocuments.read(r)));
		}));
	}
}
