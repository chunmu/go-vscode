/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../common/contributions.ts';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.ts';

// --- other interested parties
import { JSONValidationExtensionPoint } from '../common/jsonValidationExtensionPoint.ts';
import { ColorExtensionPoint } from '../../services/themes/common/colorExtensionPoint.ts';
import { IconExtensionPoint } from '../../services/themes/common/iconExtensionPoint.ts';
import { TokenClassificationExtensionPoints } from '../../services/themes/common/tokenClassificationExtensionPoint.ts';
import { LanguageConfigurationFileHandler } from '../../contrib/codeEditor/common/languageConfigurationExtensionPoint.ts';
import { StatusBarItemsExtensionPoint } from './statusBarExtensionPoint.ts';

// --- mainThread participants
import './mainThreadLocalization.ts';
import './mainThreadBulkEdits.ts';
import './mainThreadLanguageModels.ts';
import './mainThreadChatAgents2.ts';
import './mainThreadChatCodeMapper.ts';
import './mainThreadLanguageModelTools.ts';
import './mainThreadEmbeddings.ts';
import './mainThreadCodeInsets.ts';
import './mainThreadCLICommands.ts';
import './mainThreadClipboard.ts';
import './mainThreadCommands.ts';
import './mainThreadConfiguration.ts';
import './mainThreadConsole.ts';
import './mainThreadDebugService.ts';
import './mainThreadDecorations.ts';
import './mainThreadDiagnostics.ts';
import './mainThreadDialogs.ts';
import './mainThreadDocumentContentProviders.ts';
import './mainThreadDocuments.ts';
import './mainThreadDocumentsAndEditors.ts';
import './mainThreadEditor.ts';
import './mainThreadEditors.ts';
import './mainThreadEditorTabs.ts';
import './mainThreadErrors.ts';
import './mainThreadExtensionService.ts';
import './mainThreadFileSystem.ts';
import './mainThreadFileSystemEventService.ts';
import './mainThreadLanguageFeatures.ts';
import './mainThreadLanguages.ts';
import './mainThreadLogService.ts';
import './mainThreadMessageService.ts';
import './mainThreadManagedSockets.ts';
import './mainThreadOutputService.ts';
import './mainThreadProgress.ts';
import './mainThreadQuickDiff.ts';
import './mainThreadQuickOpen.ts';
import './mainThreadRemoteConnectionData.ts';
import './mainThreadSaveParticipant.ts';
import './mainThreadSpeech.ts';
import './mainThreadEditSessionIdentityParticipant.ts';
import './mainThreadSCM.ts';
import './mainThreadSearch.ts';
import './mainThreadStatusBar.ts';
import './mainThreadStorage.ts';
import './mainThreadTelemetry.ts';
import './mainThreadTerminalService.ts';
import './mainThreadTerminalShellIntegration.ts';
import './mainThreadTheming.ts';
import './mainThreadTreeViews.ts';
import './mainThreadDownloadService.ts';
import './mainThreadUrls.ts';
import './mainThreadUriOpeners.ts';
import './mainThreadWindow.ts';
import './mainThreadWebviewManager.ts';
import './mainThreadWorkspace.ts';
import './mainThreadComments.ts';
import './mainThreadNotebook.ts';
import './mainThreadNotebookKernels.ts';
import './mainThreadNotebookDocumentsAndEditors.ts';
import './mainThreadNotebookRenderers.ts';
import './mainThreadNotebookSaveParticipant.ts';
import './mainThreadInteractive.ts';
import './mainThreadTask.ts';
import './mainThreadLabelService.ts';
import './mainThreadTunnelService.ts';
import './mainThreadAuthentication.ts';
import './mainThreadTimeline.ts';
import './mainThreadTesting.ts';
import './mainThreadSecretState.ts';
import './mainThreadShare.ts';
import './mainThreadProfileContentHandlers.ts';
import './mainThreadAiRelatedInformation.ts';
import './mainThreadAiEmbeddingVector.ts';
import './mainThreadAiSettingsSearch.ts';
import './mainThreadMcp.ts';
import './mainThreadChatContext.ts';
import './mainThreadChatStatus.ts';
import './mainThreadChatOutputRenderer.ts';
import './mainThreadChatSessions.ts';
import './mainThreadDataChannels.ts';

export class ExtensionPoints implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.extensionPoints';

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		// Classes that handle extension points...
		this.instantiationService.createInstance(JSONValidationExtensionPoint);
		this.instantiationService.createInstance(ColorExtensionPoint);
		this.instantiationService.createInstance(IconExtensionPoint);
		this.instantiationService.createInstance(TokenClassificationExtensionPoints);
		this.instantiationService.createInstance(LanguageConfigurationFileHandler);
		this.instantiationService.createInstance(StatusBarItemsExtensionPoint);
	}
}

registerWorkbenchContribution2(ExtensionPoints.ID, ExtensionPoints, WorkbenchPhase.BlockStartup);
