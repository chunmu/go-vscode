/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.ts';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.ts';
import { Extensions, IExtensionFeaturesManagementService, IExtensionFeaturesRegistry } from '../../../services/extensionManagement/common/extensionFeatures.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { localize } from '../../../../nls.ts';
import { Codicon } from '../../../../base/common/codicons.ts';

export const ILanguageModelStatsService = createDecorator<ILanguageModelStatsService>('ILanguageModelStatsService');

export interface ILanguageModelStatsService {
	readonly _serviceBrand: undefined;

	update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
}

export class LanguageModelStatsService extends Disposable implements ILanguageModelStatsService {

	declare _serviceBrand: undefined;

	constructor(
		@IExtensionFeaturesManagementService private readonly extensionFeaturesManagementService: IExtensionFeaturesManagementService,
		@IStorageService storageService: IStorageService,
	) {
		super();
		// TODO: @sandy081 - remove this code after a while
		for (const key in storageService.keys(StorageScope.APPLICATION, StorageTarget.USER)) {
			if (key.startsWith('languageModelStats.') || key.startsWith('languageModelAccess.')) {
				storageService.remove(key, StorageScope.APPLICATION);
			}
		}
	}

	async update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void> {
		await this.extensionFeaturesManagementService.getAccess(extensionId, CopilotUsageExtensionFeatureId);
	}

}

export const CopilotUsageExtensionFeatureId = 'copilot';
Registry.as<IExtensionFeaturesRegistry>(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
	id: CopilotUsageExtensionFeatureId,
	label: localize('Language Models', "Copilot"),
	description: localize('languageModels', "Language models usage statistics of this extension."),
	icon: Codicon.copilot,
	access: {
		canToggle: false
	},
	accessDataLabel: localize('chat', "chat"),
});
