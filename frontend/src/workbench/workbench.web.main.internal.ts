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


//#region --- workbench parts

import './browser/parts/dialogs/dialog.web.contribution.ts';

//#endregion


//#region --- workbench (web main)

import './browser/web.main.ts';

//#endregion


//#region --- workbench services

import './services/integrity/browser/integrityService.ts';
import './services/search/browser/searchService.ts';
import './services/textfile/browser/browserTextFileService.ts';
import './services/keybinding/browser/keyboardLayoutService.ts';
import './services/extensions/browser/extensionService.ts';
import './services/extensionManagement/browser/extensionsProfileScannerService.ts';
import './services/extensions/browser/extensionsScannerService.ts';
import './services/extensionManagement/browser/webExtensionsScannerService.ts';
import './services/extensionManagement/common/extensionManagementServerService.ts';
import './services/mcp/browser/mcpGalleryManifestService.ts';
import './services/mcp/browser/mcpWorkbenchManagementService.ts';
import './services/extensionManagement/browser/extensionGalleryManifestService.ts';
import './services/telemetry/browser/telemetryService.ts';
import './services/url/browser/urlService.ts';
import './services/update/browser/updateService.ts';
import './services/workspaces/browser/workspacesService.ts';
import './services/workspaces/browser/workspaceEditingService.ts';
import './services/dialogs/browser/fileDialogService.ts';
import './services/host/browser/browserHostService.ts';
import './services/lifecycle/browser/lifecycleService.ts';
import './services/clipboard/browser/clipboardService.ts';
import './services/localization/browser/localeService.ts';
import './services/path/browser/pathService.ts';
import './services/themes/browser/browserHostColorSchemeService.ts';
import './services/encryption/browser/encryptionService.ts';
import './services/imageResize/browser/imageResizeService.ts';
import './services/secrets/browser/secretStorageService.ts';
import './services/workingCopy/browser/workingCopyBackupService.ts';
import './services/tunnel/browser/tunnelService.ts';
import './services/files/browser/elevatedFileService.ts';
import './services/workingCopy/browser/workingCopyHistoryService.ts';
import './services/userDataSync/browser/webUserDataSyncEnablementService.ts';
import './services/userDataProfile/browser/userDataProfileStorageService.ts';
import './services/configurationResolver/browser/configurationResolverService.ts';
import '../platform/extensionResourceLoader/browser/extensionResourceLoaderService.ts';
import './services/auxiliaryWindow/browser/auxiliaryWindowService.ts';
import './services/browserElements/browser/webBrowserElementsService.ts';

import { InstantiationType, registerSingleton } from '../platform/instantiation/common/extensions.ts';
import { IAccessibilityService } from '../platform/accessibility/common/accessibility.ts';
import { IContextMenuService } from '../platform/contextview/browser/contextView.ts';
import { ContextMenuService } from '../platform/contextview/browser/contextMenuService.ts';
import { IExtensionTipsService } from '../platform/extensionManagement/common/extensionManagement.ts';
import { ExtensionTipsService } from '../platform/extensionManagement/common/extensionTipsService.ts';
import { IWorkbenchExtensionManagementService } from './services/extensionManagement/common/extensionManagement.ts';
import { ExtensionManagementService } from './services/extensionManagement/common/extensionManagementService.ts';
import { LogLevel } from '../platform/log/common/log.ts';
import { UserDataSyncMachinesService, IUserDataSyncMachinesService } from '../platform/userDataSync/common/userDataSyncMachines.ts';
import { IUserDataSyncStoreService, IUserDataSyncService, IUserDataAutoSyncService, IUserDataSyncLocalStoreService, IUserDataSyncResourceProviderService } from '../platform/userDataSync/common/userDataSync.ts';
import { UserDataSyncStoreService } from '../platform/userDataSync/common/userDataSyncStoreService.ts';
import { UserDataSyncLocalStoreService } from '../platform/userDataSync/common/userDataSyncLocalStoreService.ts';
import { UserDataSyncService } from '../platform/userDataSync/common/userDataSyncService.ts';
import { IUserDataSyncAccountService, UserDataSyncAccountService } from '../platform/userDataSync/common/userDataSyncAccount.ts';
import { UserDataAutoSyncService } from '../platform/userDataSync/common/userDataAutoSyncService.ts';
import { AccessibilityService } from '../platform/accessibility/browser/accessibilityService.ts';
import { ICustomEndpointTelemetryService } from '../platform/telemetry/common/telemetry.ts';
import { NullEndpointTelemetryService } from '../platform/telemetry/common/telemetryUtils.ts';
import { ITitleService } from './services/title/browser/titleService.ts';
import { BrowserTitleService } from './browser/parts/titlebar/titlebarPart.ts';
import { ITimerService, TimerService } from './services/timer/browser/timerService.ts';
import { IDiagnosticsService, NullDiagnosticsService } from '../platform/diagnostics/common/diagnostics.ts';
import { ILanguagePackService } from '../platform/languagePacks/common/languagePacks.ts';
import { WebLanguagePacksService } from '../platform/languagePacks/browser/languagePacks.ts';
import { IWebContentExtractorService, NullWebContentExtractorService, ISharedWebContentExtractorService, NullSharedWebContentExtractorService } from '../platform/webContentExtractor/common/webContentExtractor.ts';

registerSingleton(IWorkbenchExtensionManagementService, ExtensionManagementService, InstantiationType.Delayed);
registerSingleton(IAccessibilityService, AccessibilityService, InstantiationType.Delayed);
registerSingleton(IContextMenuService, ContextMenuService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncStoreService, UserDataSyncStoreService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncMachinesService, UserDataSyncMachinesService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncLocalStoreService, UserDataSyncLocalStoreService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncAccountService, UserDataSyncAccountService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncService, UserDataSyncService, InstantiationType.Delayed);
registerSingleton(IUserDataSyncResourceProviderService, UserDataSyncResourceProviderService, InstantiationType.Delayed);
registerSingleton(IUserDataAutoSyncService, UserDataAutoSyncService, InstantiationType.Eager /* Eager to start auto sync */);
registerSingleton(ITitleService, BrowserTitleService, InstantiationType.Eager);
registerSingleton(IExtensionTipsService, ExtensionTipsService, InstantiationType.Delayed);
registerSingleton(ITimerService, TimerService, InstantiationType.Delayed);
registerSingleton(ICustomEndpointTelemetryService, NullEndpointTelemetryService, InstantiationType.Delayed);
registerSingleton(IDiagnosticsService, NullDiagnosticsService, InstantiationType.Delayed);
registerSingleton(ILanguagePackService, WebLanguagePacksService, InstantiationType.Delayed);
registerSingleton(IWebContentExtractorService, NullWebContentExtractorService, InstantiationType.Delayed);
registerSingleton(ISharedWebContentExtractorService, NullSharedWebContentExtractorService, InstantiationType.Delayed);

//#endregion


//#region --- workbench contributions

// Logs
import './contrib/logs/browser/logs.contribution.ts';

// Localization
import './contrib/localization/browser/localization.contribution.ts';

// Performance
import './contrib/performance/browser/performance.web.contribution.ts';

// Preferences
import './contrib/preferences/browser/keyboardLayoutPicker.ts';

// Debug
import './contrib/debug/browser/extensionHostDebugService.ts';

// Welcome Banner
import './contrib/welcomeBanner/browser/welcomeBanner.contribution.ts';

// Webview
import './contrib/webview/browser/webview.web.contribution.ts';

// Extensions Management
import './contrib/extensions/browser/extensions.web.contribution.ts';

// Terminal
import './contrib/terminal/browser/terminal.web.contribution.ts';
import './contrib/externalTerminal/browser/externalTerminal.contribution.ts';
import './contrib/terminal/browser/terminalInstanceService.ts';

// Tasks
import './contrib/tasks/browser/taskService.ts';

// Tags
import './contrib/tags/browser/workspaceTagsService.ts';

// Issues
import './contrib/issue/browser/issue.contribution.ts';

// Splash
import './contrib/splash/browser/splash.contribution.ts';

// Remote Start Entry for the Web
import './contrib/remote/browser/remoteStartEntry.contribution.ts';

// Process Explorer
import './contrib/processExplorer/browser/processExplorer.web.contribution.ts';

//#endregion


//#region --- export workbench factory

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
// Do NOT change these exports in a way that something is removed unless
// intentional. These exports are used by web embedders and thus require
// an adoption when something changes.
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import { create, commands, env, window, workspace, logger } from './browser/web.factory.ts';
import { Menu } from './browser/web.api.ts';
import { URI } from '../base/common/uri.ts';
import { Event, Emitter } from '../base/common/event.ts';
import { Disposable } from '../base/common/lifecycle.ts';
import { GroupOrientation } from './services/editor/common/editorGroupsService.ts';
import { UserDataSyncResourceProviderService } from '../platform/userDataSync/common/userDataSyncResourceProvider.ts';
import { RemoteAuthorityResolverError, RemoteAuthorityResolverErrorCode } from '../platform/remote/common/remoteAuthorityResolver.ts';

// TODO@esm remove me once we stop supporting our web-esm-bridge
// eslint-disable-next-line local/code-no-any-casts
if ((globalThis as any).__VSCODE_WEB_ESM_PROMISE) {
	const exports = {

		// Factory
		create: create,

		// Basic Types
		URI: URI,
		Event: Event,
		Emitter: Emitter,
		Disposable: Disposable,
		// GroupOrientation,
		LogLevel: LogLevel,
		RemoteAuthorityResolverError: RemoteAuthorityResolverError,
		RemoteAuthorityResolverErrorCode: RemoteAuthorityResolverErrorCode,

		// Facade API
		env: env,
		window: window,
		workspace: workspace,
		commands: commands,
		logger: logger,
		Menu: Menu
	};
	// eslint-disable-next-line local/code-no-any-casts
	(globalThis as any).__VSCODE_WEB_ESM_PROMISE(exports);
	// eslint-disable-next-line local/code-no-any-casts
	delete (globalThis as any).__VSCODE_WEB_ESM_PROMISE;
}

export {

	// Factory
	create,

	// Basic Types
	URI,
	Event,
	Emitter,
	Disposable,
	GroupOrientation,
	LogLevel,
	RemoteAuthorityResolverError,
	RemoteAuthorityResolverErrorCode,

	// Facade API
	env,
	window,
	workspace,
	commands,
	logger,
	Menu
};

//#endregion
