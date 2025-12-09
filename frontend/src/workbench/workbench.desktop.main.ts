/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


// #######################################################################
// ###                                                                 ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO WORKBENCH.COMMON.MAIN.TS !!! ###
// ###                                                                 ###
// #######################################################################

//#region --- workbench common

import './workbench.common.main.ts';

//#endregion


//#region --- workbench (desktop main)

import './electron-browser/desktop.main.ts';
import './electron-browser/desktop.contribution.ts';

//#endregion


//#region --- workbench parts

import './electron-browser/parts/dialogs/dialog.contribution.ts';

//#endregion


//#region --- workbench services

import './services/textfile/electron-browser/nativeTextFileService.ts';
import './services/dialogs/electron-browser/fileDialogService.ts';
import './services/workspaces/electron-browser/workspacesService.ts';
import './services/menubar/electron-browser/menubarService.ts';
import './services/update/electron-browser/updateService.ts';
import './services/url/electron-browser/urlService.ts';
import './services/lifecycle/electron-browser/lifecycleService.ts';
import './services/title/electron-browser/titleService.ts';
import './services/host/electron-browser/nativeHostService.ts';
import './services/request/electron-browser/requestService.ts';
import './services/clipboard/electron-browser/clipboardService.ts';
import './services/contextmenu/electron-browser/contextmenuService.ts';
import './services/workspaces/electron-browser/workspaceEditingService.ts';
import './services/configurationResolver/electron-browser/configurationResolverService.ts';
import './services/accessibility/electron-browser/accessibilityService.ts';
import './services/keybinding/electron-browser/nativeKeyboardLayout.ts';
import './services/path/electron-browser/pathService.ts';
import './services/themes/electron-browser/nativeHostColorSchemeService.ts';
import './services/extensionManagement/electron-browser/extensionManagementService.ts';
import './services/mcp/electron-browser/mcpGalleryManifestService.ts';
import './services/mcp/electron-browser/mcpWorkbenchManagementService.ts';
import './services/encryption/electron-browser/encryptionService.ts';
import './services/imageResize/electron-browser/imageResizeService.ts';
import './services/browserElements/electron-browser/browserElementsService.ts';
import './services/secrets/electron-browser/secretStorageService.ts';
import './services/localization/electron-browser/languagePackService.ts';
import './services/telemetry/electron-browser/telemetryService.ts';
import './services/extensions/electron-browser/extensionHostStarter.ts';
import '../platform/extensionResourceLoader/common/extensionResourceLoaderService.ts';
import './services/localization/electron-browser/localeService.ts';
import './services/extensions/electron-browser/extensionsScannerService.ts';
import './services/extensionManagement/electron-browser/extensionManagementServerService.ts';
import './services/extensionManagement/electron-browser/extensionGalleryManifestService.ts';
import './services/extensionManagement/electron-browser/extensionTipsService.ts';
import './services/userDataSync/electron-browser/userDataSyncService.ts';
import './services/userDataSync/electron-browser/userDataAutoSyncService.ts';
import './services/timer/electron-browser/timerService.ts';
import './services/environment/electron-browser/shellEnvironmentService.ts';
import './services/integrity/electron-browser/integrityService.ts';
import './services/workingCopy/electron-browser/workingCopyBackupService.ts';
import './services/checksum/electron-browser/checksumService.ts';
import '../platform/remote/electron-browser/sharedProcessTunnelService.ts';
import './services/tunnel/electron-browser/tunnelService.ts';
import '../platform/diagnostics/electron-browser/diagnosticsService.ts';
import '../platform/profiling/electron-browser/profilingService.ts';
import '../platform/telemetry/electron-browser/customEndpointTelemetryService.ts';
import '../platform/remoteTunnel/electron-browser/remoteTunnelService.ts';
import './services/files/electron-browser/elevatedFileService.ts';
import './services/search/electron-browser/searchService.ts';
import './services/workingCopy/electron-browser/workingCopyHistoryService.ts';
import './services/userDataSync/browser/userDataSyncEnablementService.ts';
import './services/extensions/electron-browser/nativeExtensionService.ts';
import '../platform/userDataProfile/electron-browser/userDataProfileStorageService.ts';
import './services/auxiliaryWindow/electron-browser/auxiliaryWindowService.ts';
import '../platform/extensionManagement/electron-browser/extensionsProfileScannerService.ts';
import '../platform/webContentExtractor/electron-browser/webContentExtractorService.ts';
import './services/process/electron-browser/processService.ts';

import { registerSingleton } from '../platform/instantiation/common/extensions.ts';
import { IUserDataInitializationService, UserDataInitializationService } from './services/userData/browser/userDataInit.ts';
import { SyncDescriptor } from '../platform/instantiation/common/descriptors.ts';

registerSingleton(IUserDataInitializationService, new SyncDescriptor(UserDataInitializationService, [[]], true));


//#endregion


//#region --- workbench contributions

// Logs
import './contrib/logs/electron-browser/logs.contribution.ts';

// Localizations
import './contrib/localization/electron-browser/localization.contribution.ts';

// Explorer
import './contrib/files/electron-browser/fileActions.contribution.ts';

// CodeEditor Contributions
import './contrib/codeEditor/electron-browser/codeEditor.contribution.ts';

// Debug
import './contrib/debug/electron-browser/extensionHostDebugService.ts';

// Extensions Management
import './contrib/extensions/electron-browser/extensions.contribution.ts';

// Issues
import './contrib/issue/electron-browser/issue.contribution.ts';

// Process Explorer
import './contrib/processExplorer/electron-browser/processExplorer.contribution.ts';

// Remote
import './contrib/remote/electron-browser/remote.contribution.ts';

// Terminal
import './contrib/terminal/electron-browser/terminal.contribution.ts';

// Themes
import './contrib/themes/browser/themes.test.contribution.ts';
import './services/themes/electron-browser/themes.contribution.ts';
// User Data Sync
import './contrib/userDataSync/electron-browser/userDataSync.contribution.ts';

// Tags
import './contrib/tags/electron-browser/workspaceTagsService.ts';
import './contrib/tags/electron-browser/tags.contribution.ts';
// Performance
import './contrib/performance/electron-browser/performance.contribution.ts';

// Tasks
import './contrib/tasks/electron-browser/taskService.ts';

// External terminal
import './contrib/externalTerminal/electron-browser/externalTerminal.contribution.ts';

// Webview
import './contrib/webview/electron-browser/webview.contribution.ts';

// Splash
import './contrib/splash/electron-browser/splash.contribution.ts';

// Local History
import './contrib/localHistory/electron-browser/localHistory.contribution.ts';

// Merge Editor
import './contrib/mergeEditor/electron-browser/mergeEditor.contribution.ts';

// Multi Diff Editor
import './contrib/multiDiffEditor/browser/multiDiffEditor.contribution.ts';

// Remote Tunnel
import './contrib/remoteTunnel/electron-browser/remoteTunnel.contribution.ts';

// Chat
import './contrib/chat/electron-browser/chat.contribution.ts';
import './contrib/inlineChat/electron-browser/inlineChat.contribution.ts';
// Encryption
import './contrib/encryption/electron-browser/encryption.contribution.ts';

// Emergency Alert
import './contrib/emergencyAlert/electron-browser/emergencyAlert.contribution.ts';

// MCP
import './contrib/mcp/electron-browser/mcp.contribution.ts';

// Policy Export
import './contrib/policyExport/electron-browser/policyExport.contribution.ts';

//#endregion


export { main } from './electron-browser/desktop.main.ts';
