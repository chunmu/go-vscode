/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEditorOptions } from '../../../common/config/editorOptions.ts';
import { TextModel } from '../../../common/model/textModel.ts';
import { ViewModel } from '../../../common/viewModel/viewModelImpl.ts';
import { TestConfiguration } from '../config/testConfiguration.ts';
import { MonospaceLineBreaksComputerFactory } from '../../../common/viewModel/monospaceLineBreaksComputer.ts';
import { createTextModel } from '../../common/testTextModel.ts';
import { TestLanguageConfigurationService } from '../../common/modes/testLanguageConfigurationService.ts';
import { TestThemeService } from '../../../../platform/theme/test/common/testThemeService.ts';

export function testViewModel(text: string[], options: IEditorOptions, callback: (viewModel: ViewModel, model: TextModel) => void): void {
	const EDITOR_ID = 1;

	const configuration = new TestConfiguration(options);
	const model = createTextModel(text.join('\n'));
	const monospaceLineBreaksComputerFactory = MonospaceLineBreaksComputerFactory.create(configuration.options);
	const testLanguageConfigurationService = new TestLanguageConfigurationService();
	const viewModel = new ViewModel(EDITOR_ID, configuration, model, monospaceLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, null!, testLanguageConfigurationService, new TestThemeService(), {
		setVisibleLines(visibleLines, stabilized) {
		},
	}, {
		batchChanges: (cb) => cb(),
	});

	callback(viewModel, model);

	viewModel.dispose();
	model.dispose();
	configuration.dispose();
	testLanguageConfigurationService.dispose();
}
