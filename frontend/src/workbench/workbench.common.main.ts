/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//#region --- editor/workbench core

import '../editor/editor.all.ts';

import './api/browser/extensionHost.contribution.ts';
import './browser/workbench.contribution.ts';

//#endregion


//#region --- workbench actions

import './browser/actions/textInputActions.ts';
import './browser/actions/developerActions.ts';
import './browser/actions/helpActions.ts';
import './browser/actions/layoutActions.ts';
import './browser/actions/listCommands.ts';
import './browser/actions/navigationActions.ts';
import './browser/actions/windowActions.ts';
import './browser/actions/workspaceActions.ts';
import './browser/actions/workspaceCommands.ts';
import './browser/actions/quickAccessActions.ts';
import './browser/actions/widgetNavigationCommands.ts';

//#endregion


//#region --- API Extension Points

import './services/actions/common/menusExtensionPoint.ts';
import './api/common/configurationExtensionPoint.ts';
import './api/browser/viewsExtensionPoint.ts';

//#endregion


//#region --- workbench parts

import './browser/parts/editor/editor.contribution.ts';
import './browser/parts/editor/editorParts.ts';
import './browser/parts/paneCompositePartService.ts';
import './browser/parts/banner/bannerPart.ts';
import './browser/parts/statusbar/statusbarPart.ts';

//#endregion


//#region --- workbench services

import '../platform/actions/common/actions.contribution.ts';
import '../platform/undoRedo/common/undoRedoService.ts';
import '../platform/mcp/common/mcpResourceScannerService.ts';
import './services/workspaces/common/editSessionIdentityService.ts';
import './services/workspaces/common/canonicalUriService.ts';
import './services/extensions/browser/extensionUrlHandler.ts';
import './services/keybinding/common/keybindingEditing.ts';
import './services/decorations/browser/decorationsService.ts';
import './services/dialogs/common/dialogService.ts';
import './services/progress/browser/progressService.ts';
import './services/editor/browser/codeEditorService.ts';
import './services/preferences/browser/preferencesService.ts';
import './services/configuration/common/jsonEditingService.ts';
import './services/textmodelResolver/common/textModelResolverService.ts';
import './services/editor/browser/editorService.ts';
import './services/editor/browser/editorResolverService.ts';
import './services/aiEmbeddingVector/common/aiEmbeddingVectorService.ts';
import './services/aiRelatedInformation/common/aiRelatedInformationService.ts';
import './services/aiSettingsSearch/common/aiSettingsSearchService.ts';
import './services/history/browser/historyService.ts';
import './services/activity/browser/activityService.ts';
import './services/keybinding/browser/keybindingService.ts';
import './services/untitled/common/untitledTextEditorService.ts';
import './services/textresourceProperties/common/textResourcePropertiesService.ts';
import './services/textfile/common/textEditorService.ts';
import './services/language/common/languageService.ts';
import './services/model/common/modelService.ts';
import './services/notebook/common/notebookDocumentService.ts';
import './services/commands/common/commandService.ts';
import './services/themes/browser/workbenchThemeService.ts';
import './services/label/common/labelService.ts';
import './services/extensions/common/extensionManifestPropertiesService.ts';
import './services/extensionManagement/common/extensionGalleryService.ts';
import './services/extensionManagement/browser/extensionEnablementService.ts';
import './services/extensionManagement/browser/builtinExtensionsScannerService.ts';
import './services/extensionRecommendations/common/extensionIgnoredRecommendationsService.ts';
import './services/extensionRecommendations/common/workspaceExtensionsConfig.ts';
import './services/extensionManagement/common/extensionFeaturesManagemetService.ts';
import './services/notification/common/notificationService.ts';
import './services/userDataSync/common/userDataSyncUtil.ts';
import './services/userDataProfile/browser/userDataProfileImportExportService.ts';
import './services/userDataProfile/browser/userDataProfileManagement.ts';
import './services/userDataProfile/common/remoteUserDataProfiles.ts';
import './services/remote/common/remoteExplorerService.ts';
import './services/remote/common/remoteExtensionsScanner.ts';
import './services/terminal/common/embedderTerminalService.ts';
import './services/workingCopy/common/workingCopyService.ts';
import './services/workingCopy/common/workingCopyFileService.ts';
import './services/workingCopy/common/workingCopyEditorService.ts';
import './services/filesConfiguration/common/filesConfigurationService.ts';
import './services/views/browser/viewDescriptorService.ts';
import './services/views/browser/viewsService.ts';
import './services/quickinput/browser/quickInputService.ts';
import './services/userDataSync/browser/userDataSyncWorkbenchService.ts';
import './services/authentication/browser/authenticationService.ts';
import './services/authentication/browser/authenticationExtensionsService.ts';
import './services/authentication/browser/authenticationUsageService.ts';
import './services/authentication/browser/authenticationAccessService.ts';
import './services/authentication/browser/authenticationMcpUsageService.ts';
import './services/authentication/browser/authenticationMcpAccessService.ts';
import './services/authentication/browser/authenticationMcpService.ts';
import './services/authentication/browser/dynamicAuthenticationProviderStorageService.ts';
import './services/authentication/browser/authenticationQueryService.ts';
import '../platform/hover/browser/hoverService.ts';
import './services/assignment/common/assignmentService.ts';
import './services/outline/browser/outlineService.ts';
import './services/languageDetection/browser/languageDetectionWorkerServiceImpl.ts';
import '../editor/common/services/languageFeaturesService.ts';
import '../editor/common/services/semanticTokensStylingService.ts';
import '../editor/common/services/treeViewsDndService.ts';
import './services/textMate/browser/textMateTokenizationFeature.contribution.ts';
import './services/treeSitter/browser/treeSitter.contribution.ts';
import './services/userActivity/common/userActivityService.ts';
import './services/userActivity/browser/userActivityBrowser.ts';
import './services/editor/browser/editorPaneService.ts';
import './services/editor/common/customEditorLabelService.ts';
import './services/dataChannel/browser/dataChannelService.ts';
import './services/inlineCompletions/common/inlineCompletionsUnification.ts';
import './services/chat/common/chatEntitlementService.ts';

import { InstantiationType, registerSingleton } from '../platform/instantiation/common/extensions.ts';
import { GlobalExtensionEnablementService } from '../platform/extensionManagement/common/extensionEnablementService.ts';
import { IAllowedExtensionsService, IGlobalExtensionEnablementService } from '../platform/extensionManagement/common/extensionManagement.ts';
import { ContextViewService } from '../platform/contextview/browser/contextViewService.ts';
import { IContextViewService } from '../platform/contextview/browser/contextView.ts';
import { IListService, ListService } from '../platform/list/browser/listService.ts';
import { MarkerDecorationsService } from '../editor/common/services/markerDecorationsService.ts';
import { IMarkerDecorationsService } from '../editor/common/services/markerDecorations.ts';
import { IMarkerService } from '../platform/markers/common/markers.ts';
import { MarkerService } from '../platform/markers/common/markerService.ts';
import { ContextKeyService } from '../platform/contextkey/browser/contextKeyService.ts';
import { IContextKeyService } from '../platform/contextkey/common/contextkey.ts';
import { ITextResourceConfigurationService } from '../editor/common/services/textResourceConfiguration.ts';
import { TextResourceConfigurationService } from '../editor/common/services/textResourceConfigurationService.ts';
import { IDownloadService } from '../platform/download/common/download.ts';
import { DownloadService } from '../platform/download/common/downloadService.ts';
import { OpenerService } from '../editor/browser/services/openerService.ts';
import { IOpenerService } from '../platform/opener/common/opener.ts';
import { IgnoredExtensionsManagementService, IIgnoredExtensionsManagementService } from '../platform/userDataSync/common/ignoredExtensions.ts';
import { ExtensionStorageService, IExtensionStorageService } from '../platform/extensionManagement/common/extensionStorage.ts';
import { IUserDataSyncLogService } from '../platform/userDataSync/common/userDataSync.ts';
import { UserDataSyncLogService } from '../platform/userDataSync/common/userDataSyncLog.ts';
import { AllowedExtensionsService } from '../platform/extensionManagement/common/allowedExtensionsService.ts';
import { IAllowedMcpServersService, IMcpGalleryService } from '../platform/mcp/common/mcpManagement.ts';
import { McpGalleryService } from '../platform/mcp/common/mcpGalleryService.ts';
import { AllowedMcpServersService } from '../platform/mcp/common/allowedMcpServersService.ts';
import { IWebWorkerService } from '../platform/webWorker/browser/webWorkerService.ts';
import { WebWorkerService } from '../platform/webWorker/browser/webWorkerServiceImpl.ts';

registerSingleton(IUserDataSyncLogService, UserDataSyncLogService, InstantiationType.Delayed);
registerSingleton(IAllowedExtensionsService, AllowedExtensionsService, InstantiationType.Delayed);
registerSingleton(IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService, InstantiationType.Delayed);
registerSingleton(IGlobalExtensionEnablementService, GlobalExtensionEnablementService, InstantiationType.Delayed);
registerSingleton(IExtensionStorageService, ExtensionStorageService, InstantiationType.Delayed);
registerSingleton(IContextViewService, ContextViewService, InstantiationType.Delayed);
registerSingleton(IListService, ListService, InstantiationType.Delayed);
registerSingleton(IMarkerDecorationsService, MarkerDecorationsService, InstantiationType.Delayed);
registerSingleton(IMarkerService, MarkerService, InstantiationType.Delayed);
registerSingleton(IContextKeyService, ContextKeyService, InstantiationType.Delayed);
registerSingleton(ITextResourceConfigurationService, TextResourceConfigurationService, InstantiationType.Delayed);
registerSingleton(IDownloadService, DownloadService, InstantiationType.Delayed);
registerSingleton(IOpenerService, OpenerService, InstantiationType.Delayed);
registerSingleton(IWebWorkerService, WebWorkerService, InstantiationType.Delayed);
registerSingleton(IMcpGalleryService, McpGalleryService, InstantiationType.Delayed);
registerSingleton(IAllowedMcpServersService, AllowedMcpServersService, InstantiationType.Delayed);

//#endregion


//#region --- workbench contributions

// Default Account
import './services/accounts/common/defaultAccount.ts';

// Telemetry
import './contrib/telemetry/browser/telemetry.contribution.ts';

// Preferences
import './contrib/preferences/browser/preferences.contribution.ts';
import './contrib/preferences/browser/keybindingsEditorContribution.ts';
import './contrib/preferences/browser/preferencesSearch.ts';

// Performance
import './contrib/performance/browser/performance.contribution.ts';

// Notebook
import './contrib/notebook/browser/notebook.contribution.ts';

// Speech
import './contrib/speech/browser/speech.contribution.ts';

// Chat
import './contrib/chat/browser/chat.contribution.ts';
import './contrib/inlineChat/browser/inlineChat.contribution.ts';
import './contrib/mcp/browser/mcp.contribution.ts';
import './contrib/chat/browser/chatSessions.contribution.ts';
import './contrib/chat/browser/chatContext.contribution.ts';

// Interactive
import './contrib/interactive/browser/interactive.contribution.ts';

// repl
import './contrib/replNotebook/browser/repl.contribution.ts';

// Testing
import './contrib/testing/browser/testing.contribution.ts';

// Logs
import './contrib/logs/common/logs.contribution.ts';

// Quickaccess
import './contrib/quickaccess/browser/quickAccess.contribution.ts';

// Explorer
import './contrib/files/browser/explorerViewlet.ts';
import './contrib/files/browser/fileActions.contribution.ts';
import './contrib/files/browser/files.contribution.ts';

// Bulk Edit
import './contrib/bulkEdit/browser/bulkEditService.ts';
import './contrib/bulkEdit/browser/preview/bulkEdit.contribution.ts';

// Search
import './contrib/search/browser/search.contribution.ts';
import './contrib/search/browser/searchView.ts';

// Search Editor
import './contrib/searchEditor/browser/searchEditor.contribution.ts';

// Sash
import './contrib/sash/browser/sash.contribution.ts';

// SCM
import './contrib/scm/browser/scm.contribution.ts';

// Debug
import './contrib/debug/browser/debug.contribution.ts';
import './contrib/debug/browser/debugEditorContribution.ts';
import './contrib/debug/browser/breakpointEditorContribution.ts';
import './contrib/debug/browser/callStackEditorContribution.ts';
import './contrib/debug/browser/repl.ts';
import './contrib/debug/browser/debugViewlet.ts';

// Markers
import './contrib/markers/browser/markers.contribution.ts';

// Process Explorer
import './contrib/processExplorer/browser/processExplorer.contribution.ts';

// Merge Editor
import './contrib/mergeEditor/browser/mergeEditor.contribution.ts';

// Multi Diff Editor
import './contrib/multiDiffEditor/browser/multiDiffEditor.contribution.ts';

// Commands
import './contrib/commands/common/commands.contribution.ts';

// Comments
import './contrib/comments/browser/comments.contribution.ts';

// URL Support
import './contrib/url/browser/url.contribution.ts';

// Webview
import './contrib/webview/browser/webview.contribution.ts';
import './contrib/webviewPanel/browser/webviewPanel.contribution.ts';
import './contrib/webviewView/browser/webviewView.contribution.ts';
import './contrib/customEditor/browser/customEditor.contribution.ts';

// External Uri Opener
import './contrib/externalUriOpener/common/externalUriOpener.contribution.ts';

// Extensions Management
import './contrib/extensions/browser/extensions.contribution.ts';
import './contrib/extensions/browser/extensionsViewlet.ts';

// Output View
import './contrib/output/browser/output.contribution.ts';
import './contrib/output/browser/outputView.ts';

// Terminal
import './contrib/terminal/terminal.all.ts';

// External terminal
import './contrib/externalTerminal/browser/externalTerminal.contribution.ts';

// Relauncher
import './contrib/relauncher/browser/relauncher.contribution.ts';

// Tasks
import './contrib/tasks/browser/task.contribution.ts';

// Remote
import './contrib/remote/common/remote.contribution.ts';
import './contrib/remote/browser/remote.contribution.ts';

// Emmet
import './contrib/emmet/browser/emmet.contribution.ts';

// CodeEditor Contributions
import './contrib/codeEditor/browser/codeEditor.contribution.ts';

// Markdown
import './contrib/markdown/browser/markdown.contribution.ts';

// Keybindings Contributions
import './contrib/keybindings/browser/keybindings.contribution.ts';

// Snippets
import './contrib/snippets/browser/snippets.contribution.ts';

// Formatter Help
import './contrib/format/browser/format.contribution.ts';

// Folding
import './contrib/folding/browser/folding.contribution.ts';

// Limit Indicator
import './contrib/limitIndicator/browser/limitIndicator.contribution.ts';

// Inlay Hint Accessibility
import './contrib/inlayHints/browser/inlayHintsAccessibilty.ts';

// Themes
import './contrib/themes/browser/themes.contribution.ts';

// Update
import './contrib/update/browser/update.contribution.ts';

// Surveys
import './contrib/surveys/browser/nps.contribution.ts';
import './contrib/surveys/browser/languageSurveys.contribution.ts';

// Welcome
import './contrib/welcomeGettingStarted/browser/gettingStarted.contribution.ts';
import './contrib/welcomeWalkthrough/browser/walkThrough.contribution.ts';
import './contrib/welcomeViews/common/viewsWelcome.contribution.ts';
import './contrib/welcomeViews/common/newFile.contribution.ts';

// Call Hierarchy
import './contrib/callHierarchy/browser/callHierarchy.contribution.ts';

// Type Hierarchy
import './contrib/typeHierarchy/browser/typeHierarchy.contribution.ts';

// Outline
import './contrib/codeEditor/browser/outline/documentSymbolsOutline.ts';
import './contrib/outline/browser/outline.contribution.ts';

// Language Detection
import './contrib/languageDetection/browser/languageDetection.contribution.ts';

// Language Status
import './contrib/languageStatus/browser/languageStatus.contribution.ts';

// Authentication
import './contrib/authentication/browser/authentication.contribution.ts';

// User Data Sync
import './contrib/userDataSync/browser/userDataSync.contribution.ts';

// User Data Profiles
import './contrib/userDataProfile/browser/userDataProfile.contribution.ts';

// Continue Edit Session
import './contrib/editSessions/browser/editSessions.contribution.ts';

// Remote Coding Agents
import './contrib/remoteCodingAgents/browser/remoteCodingAgents.contribution.ts';

// Code Actions
import './contrib/codeActions/browser/codeActions.contribution.ts';

// Timeline
import './contrib/timeline/browser/timeline.contribution.ts';

// Local History
import './contrib/localHistory/browser/localHistory.contribution.ts';

// Workspace
import './contrib/workspace/browser/workspace.contribution.ts';

// Workspaces
import './contrib/workspaces/browser/workspaces.contribution.ts';

// List
import './contrib/list/browser/list.contribution.ts';

// Accessibility Signals
import './contrib/accessibilitySignals/browser/accessibilitySignal.contribution.ts';

// Bracket Pair Colorizer 2 Telemetry
import './contrib/bracketPairColorizer2Telemetry/browser/bracketPairColorizer2Telemetry.contribution.ts';

// Accessibility
import './contrib/accessibility/browser/accessibility.contribution.ts';

// Share
import './contrib/share/browser/share.contribution.ts';

// Synchronized Scrolling
import './contrib/scrollLocking/browser/scrollLocking.contribution.ts';

// Inline Completions
import './contrib/inlineCompletions/browser/inlineCompletions.contribution.ts';

// Drop or paste into
import './contrib/dropOrPasteInto/browser/dropOrPasteInto.contribution.ts';

// Edit Telemetry
import './contrib/editTelemetry/browser/editTelemetry.contribution.ts';

// Opener
import './contrib/opener/browser/opener.contribution.ts';

//#endregion
