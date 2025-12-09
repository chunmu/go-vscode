/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICodeEditor } from '../../../browser/editorBrowser.ts';
import { EditorContributionInstantiation, registerEditorContribution } from '../../../browser/editorExtensions.ts';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.ts';
import { ReferencesController } from '../../../contrib/gotoSymbol/browser/peek/referencesController.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { INotificationService } from '../../../../platform/notification/common/notification.ts';
import { IStorageService } from '../../../../platform/storage/common/storage.ts';

export class StandaloneReferencesController extends ReferencesController {

	public constructor(
		editor: ICodeEditor,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICodeEditorService editorService: ICodeEditorService,
		@INotificationService notificationService: INotificationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		super(
			true,
			editor,
			contextKeyService,
			editorService,
			notificationService,
			instantiationService,
			storageService,
			configurationService
		);
	}
}

registerEditorContribution(ReferencesController.ID, StandaloneReferencesController, EditorContributionInstantiation.Lazy);
