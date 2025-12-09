/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { setDefaultResultOrder } from 'dns';
import * as fs from 'fs';
import { hostname, release } from 'os';
import { raceTimeout } from '../../base/common/async.ts';
import { toErrorMessage } from '../../base/common/errorMessage.ts';
import { isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from '../../base/common/errors.ts';
import { Disposable } from '../../base/common/lifecycle.ts';
import { Schemas } from '../../base/common/network.ts';
import { isAbsolute, join } from '../../base/common/path.ts';
import { isWindows, isMacintosh, isLinux } from '../../base/common/platform.ts';
import { cwd } from '../../base/common/process.ts';
import { URI } from '../../base/common/uri.ts';
import { IConfigurationService } from '../../platform/configuration/common/configuration.ts';
import { ConfigurationService } from '../../platform/configuration/common/configurationService.ts';
import { IDownloadService } from '../../platform/download/common/download.ts';
import { DownloadService } from '../../platform/download/common/downloadService.ts';
import { NativeParsedArgs } from '../../platform/environment/common/argv.ts';
import { INativeEnvironmentService } from '../../platform/environment/common/environment.ts';
import { NativeEnvironmentService } from '../../platform/environment/node/environmentService.ts';
import { ExtensionGalleryServiceWithNoStorageService } from '../../platform/extensionManagement/common/extensionGalleryService.ts';
import { IAllowedExtensionsService, IExtensionGalleryService, InstallOptions } from '../../platform/extensionManagement/common/extensionManagement.ts';
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from '../../platform/extensionManagement/node/extensionSignatureVerificationService.ts';
import { ExtensionManagementCLI } from '../../platform/extensionManagement/common/extensionManagementCLI.ts';
import { IExtensionsProfileScannerService } from '../../platform/extensionManagement/common/extensionsProfileScannerService.ts';
import { IExtensionsScannerService } from '../../platform/extensionManagement/common/extensionsScannerService.ts';
import { ExtensionManagementService, INativeServerExtensionManagementService } from '../../platform/extensionManagement/node/extensionManagementService.ts';
import { ExtensionsScannerService } from '../../platform/extensionManagement/node/extensionsScannerService.ts';
import { IFileService } from '../../platform/files/common/files.ts';
import { FileService } from '../../platform/files/common/fileService.ts';
import { DiskFileSystemProvider } from '../../platform/files/node/diskFileSystemProvider.ts';
import { SyncDescriptor } from '../../platform/instantiation/common/descriptors.ts';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.ts';
import { InstantiationService } from '../../platform/instantiation/common/instantiationService.ts';
import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.ts';
import { ILanguagePackService } from '../../platform/languagePacks/common/languagePacks.ts';
import { NativeLanguagePackService } from '../../platform/languagePacks/node/languagePacks.ts';
import { ConsoleLogger, getLogLevel, ILogger, ILoggerService, ILogService, LogLevel } from '../../platform/log/common/log.ts';
import { FilePolicyService } from '../../platform/policy/common/filePolicyService.ts';
import { IPolicyService, NullPolicyService } from '../../platform/policy/common/policy.ts';
import { NativePolicyService } from '../../platform/policy/node/nativePolicyService.ts';
import product from '../../platform/product/common/product.ts';
import { IProductService } from '../../platform/product/common/productService.ts';
import { IRequestService } from '../../platform/request/common/request.ts';
import { RequestService } from '../../platform/request/node/requestService.ts';
import { SaveStrategy, StateReadonlyService } from '../../platform/state/node/stateService.ts';
import { resolveCommonProperties } from '../../platform/telemetry/common/commonProperties.ts';
import { ITelemetryService } from '../../platform/telemetry/common/telemetry.ts';
import { ITelemetryServiceConfig, TelemetryService } from '../../platform/telemetry/common/telemetryService.ts';
import { supportsTelemetry, NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry, ITelemetryAppender } from '../../platform/telemetry/common/telemetryUtils.ts';
import { OneDataSystemAppender } from '../../platform/telemetry/node/1dsAppender.ts';
import { buildTelemetryMessage } from '../../platform/telemetry/node/telemetry.ts';
import { IUriIdentityService } from '../../platform/uriIdentity/common/uriIdentity.ts';
import { UriIdentityService } from '../../platform/uriIdentity/common/uriIdentityService.ts';
import { IUserDataProfile, IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.ts';
import { UserDataProfilesReadonlyService } from '../../platform/userDataProfile/node/userDataProfile.ts';
import { resolveMachineId, resolveSqmId, resolveDevDeviceId } from '../../platform/telemetry/node/telemetryUtils.ts';
import { ExtensionsProfileScannerService } from '../../platform/extensionManagement/node/extensionsProfileScannerService.ts';
import { LogService } from '../../platform/log/common/logService.ts';
import { LoggerService } from '../../platform/log/node/loggerService.ts';
import { localize } from '../../nls.ts';
import { FileUserDataProvider } from '../../platform/userData/common/fileUserDataProvider.ts';
import { addUNCHostToAllowlist, getUNCHost } from '../../base/node/unc.ts';
import { AllowedExtensionsService } from '../../platform/extensionManagement/common/allowedExtensionsService.ts';
import { McpManagementCli } from '../../platform/mcp/common/mcpManagementCli.ts';
import { IExtensionGalleryManifestService } from '../../platform/extensionManagement/common/extensionGalleryManifest.ts';
import { ExtensionGalleryManifestService } from '../../platform/extensionManagement/common/extensionGalleryManifestService.ts';
import { IAllowedMcpServersService, IMcpGalleryService, IMcpManagementService } from '../../platform/mcp/common/mcpManagement.ts';
import { McpManagementService } from '../../platform/mcp/node/mcpManagementService.ts';
import { IMcpResourceScannerService, McpResourceScannerService } from '../../platform/mcp/common/mcpResourceScannerService.ts';
import { McpGalleryService } from '../../platform/mcp/common/mcpGalleryService.ts';
import { AllowedMcpServersService } from '../../platform/mcp/common/allowedMcpServersService.ts';
import { IMcpGalleryManifestService } from '../../platform/mcp/common/mcpGalleryManifest.ts';
import { McpGalleryManifestService } from '../../platform/mcp/common/mcpGalleryManifestService.ts';
import { LINUX_SYSTEM_POLICY_FILE_PATH } from '../../base/common/policy.ts';

class CliMain extends Disposable {

	constructor(
		private argv: NativeParsedArgs
	) {
		super();

		this.registerListeners();
	}

	private registerListeners(): void {

		// Dispose on exit
		process.once('exit', () => this.dispose());
	}

	async run(): Promise<void> {

		// Services
		const [instantiationService, appenders] = await this.initServices();

		return instantiationService.invokeFunction(async accessor => {
			const logService = accessor.get(ILogService);
			const fileService = accessor.get(IFileService);
			const environmentService = accessor.get(INativeEnvironmentService);
			const userDataProfilesService = accessor.get(IUserDataProfilesService);

			// Log info
			logService.info('CLI main', this.argv);

			// Error handler
			this.registerErrorHandler(logService);

			// DNS result order
			// Refs https://github.com/microsoft/vscode/issues/264136
			setDefaultResultOrder('ipv4first');

			// Run based on argv
			await this.doRun(environmentService, fileService, userDataProfilesService, instantiationService);

			// Flush the remaining data in AI adapter (with 1s timeout)
			await Promise.all(appenders.map(a => {
				raceTimeout(a.flush(), 1000);
			}));
			return;
		});
	}

	private async initServices(): Promise<[IInstantiationService, ITelemetryAppender[]]> {
		const services = new ServiceCollection();

		// Product
		const productService = { _serviceBrand: undefined, ...product };
		services.set(IProductService, productService);

		// Environment
		const environmentService = new NativeEnvironmentService(this.argv, productService);
		services.set(INativeEnvironmentService, environmentService);

		// Init folders
		await Promise.all([
			this.allowWindowsUNCPath(environmentService.appSettingsHome.with({ scheme: Schemas.file }).fsPath),
			this.allowWindowsUNCPath(environmentService.extensionsPath)
		].map(path => path ? fs.promises.mkdir(path, { recursive: true }) : undefined));

		// Logger
		const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
		services.set(ILoggerService, loggerService);

		// Log
		const logger = this._register(loggerService.createLogger('cli', { name: localize('cli', "CLI") }));
		const otherLoggers: ILogger[] = [];
		if (loggerService.getLogLevel() === LogLevel.Trace) {
			otherLoggers.push(new ConsoleLogger(loggerService.getLogLevel()));
		}

		const logService = this._register(new LogService(logger, otherLoggers));
		services.set(ILogService, logService);

		// Files
		const fileService = this._register(new FileService(logService));
		services.set(IFileService, fileService);

		const diskFileSystemProvider = this._register(new DiskFileSystemProvider(logService));
		fileService.registerProvider(Schemas.file, diskFileSystemProvider);

		// Uri Identity
		const uriIdentityService = new UriIdentityService(fileService);
		services.set(IUriIdentityService, uriIdentityService);

		// User Data Profiles
		const stateService = new StateReadonlyService(SaveStrategy.DELAYED, environmentService, logService, fileService);
		const userDataProfilesService = new UserDataProfilesReadonlyService(stateService, uriIdentityService, environmentService, fileService, logService);
		services.set(IUserDataProfilesService, userDataProfilesService);

		// Use FileUserDataProvider for user data to
		// enable atomic read / write operations.
		fileService.registerProvider(Schemas.vscodeUserData, new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));

		// Policy
		let policyService: IPolicyService | undefined;
		if (isWindows && productService.win32RegValueName) {
			policyService = this._register(new NativePolicyService(logService, productService.win32RegValueName));
		} else if (isMacintosh && productService.darwinBundleIdentifier) {
			policyService = this._register(new NativePolicyService(logService, productService.darwinBundleIdentifier));
		} else if (isLinux) {
			policyService = this._register(new FilePolicyService(URI.file(LINUX_SYSTEM_POLICY_FILE_PATH), fileService, logService));
		} else if (environmentService.policyFile) {
			policyService = this._register(new FilePolicyService(environmentService.policyFile, fileService, logService));
		} else {
			policyService = new NullPolicyService();
		}
		services.set(IPolicyService, policyService);

		// Configuration
		const configurationService = this._register(new ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
		services.set(IConfigurationService, configurationService);

		// Initialize
		await Promise.all([
			stateService.init(),
			configurationService.initialize()
		]);

		// Get machine ID
		let machineId: string | undefined = undefined;
		try {
			machineId = await resolveMachineId(stateService, logService);
		} catch (error) {
			if (error.code !== 'ENOENT') {
				logService.error(error);
			}
		}
		const sqmId = await resolveSqmId(stateService, logService);
		const devDeviceId = await resolveDevDeviceId(stateService, logService);

		// Initialize user data profiles after initializing the state
		userDataProfilesService.init();

		// URI Identity
		services.set(IUriIdentityService, new UriIdentityService(fileService));

		// Request
		const requestService = new RequestService('local', configurationService, environmentService, logService);
		services.set(IRequestService, requestService);

		// Download Service
		services.set(IDownloadService, new SyncDescriptor(DownloadService, undefined, true));

		// Extensions
		services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService, undefined, true));
		services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService, undefined, true));
		services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService, undefined, true));
		services.set(IAllowedExtensionsService, new SyncDescriptor(AllowedExtensionsService, undefined, true));
		services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService, undefined, true));
		services.set(IExtensionGalleryManifestService, new SyncDescriptor(ExtensionGalleryManifestService));
		services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService, undefined, true));

		// Localizations
		services.set(ILanguagePackService, new SyncDescriptor(NativeLanguagePackService, undefined, false));

		// MCP
		services.set(IAllowedMcpServersService, new SyncDescriptor(AllowedMcpServersService, undefined, true));
		services.set(IMcpResourceScannerService, new SyncDescriptor(McpResourceScannerService, undefined, true));
		services.set(IMcpGalleryManifestService, new SyncDescriptor(McpGalleryManifestService, undefined, true));
		services.set(IMcpGalleryService, new SyncDescriptor(McpGalleryService, undefined, true));
		services.set(IMcpManagementService, new SyncDescriptor(McpManagementService, undefined, true));

		// Telemetry
		const appenders: ITelemetryAppender[] = [];
		const isInternal = isInternalTelemetry(productService, configurationService);
		if (supportsTelemetry(productService, environmentService)) {
			if (productService.aiConfig?.ariaKey) {
				appenders.push(new OneDataSystemAppender(requestService, isInternal, 'monacoworkbench', null, productService.aiConfig.ariaKey));
			}

			const config: ITelemetryServiceConfig = {
				appenders,
				sendErrorTelemetry: false,
				commonProperties: resolveCommonProperties(release(), hostname(), process.arch, productService.commit, productService.version, machineId, sqmId, devDeviceId, isInternal, productService.date),
				piiPaths: getPiiPathsFromEnvironment(environmentService)
			};

			services.set(ITelemetryService, new SyncDescriptor(TelemetryService, [config], false));

		} else {
			services.set(ITelemetryService, NullTelemetryService);
		}

		return [new InstantiationService(services), appenders];
	}

	private allowWindowsUNCPath(path: string): string {
		if (isWindows) {
			const host = getUNCHost(path);
			if (host) {
				addUNCHostToAllowlist(host);
			}
		}

		return path;
	}

	private registerErrorHandler(logService: ILogService): void {

		// Install handler for unexpected errors
		setUnexpectedErrorHandler(error => {
			const message = toErrorMessage(error, true);
			if (!message) {
				return;
			}

			logService.error(`[uncaught exception in CLI]: ${message}`);
		});

		// Handle unhandled errors that can occur
		process.on('uncaughtException', err => {
			if (!isSigPipeError(err)) {
				onUnexpectedError(err);
			}
		});
		process.on('unhandledRejection', (reason: unknown) => onUnexpectedError(reason));
	}

	private async doRun(environmentService: INativeEnvironmentService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, instantiationService: IInstantiationService): Promise<void> {
		let profile: IUserDataProfile | undefined = undefined;
		if (environmentService.args.profile) {
			profile = userDataProfilesService.profiles.find(p => p.name === environmentService.args.profile);
			if (!profile) {
				throw new Error(`Profile '${environmentService.args.profile}' not found.`);
			}
		}
		const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;

		// List Extensions
		if (this.argv['list-extensions']) {
			return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).listExtensions(!!this.argv['show-versions'], this.argv['category'], profileLocation);
		}

		// Install Extension
		else if (this.argv['install-extension'] || this.argv['install-builtin-extension']) {
			const installOptions: InstallOptions = { isMachineScoped: !!this.argv['do-not-sync'], installPreReleaseVersion: !!this.argv['pre-release'], donotIncludePackAndDependencies: !!this.argv['do-not-include-pack-dependencies'], profileLocation };
			return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).installExtensions(this.asExtensionIdOrVSIX(this.argv['install-extension'] || []), this.asExtensionIdOrVSIX(this.argv['install-builtin-extension'] || []), installOptions, !!this.argv['force']);
		}

		// Uninstall Extension
		else if (this.argv['uninstall-extension']) {
			return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).uninstallExtensions(this.asExtensionIdOrVSIX(this.argv['uninstall-extension']), !!this.argv['force'], profileLocation);
		}

		else if (this.argv['update-extensions']) {
			return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).updateExtensions(profileLocation);
		}

		// Locate Extension
		else if (this.argv['locate-extension']) {
			return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).locateExtension(this.argv['locate-extension']);
		}

		// Install MCP server
		else if (this.argv['add-mcp']) {
			return instantiationService.createInstance(McpManagementCli, new ConsoleLogger(LogLevel.Info, false)).addMcpDefinitions(this.argv['add-mcp']);
		}

		// Telemetry
		else if (this.argv['telemetry']) {
			console.log(await buildTelemetryMessage(environmentService.appRoot, environmentService.extensionsPath));
		}
	}

	private asExtensionIdOrVSIX(inputs: string[]): (string | URI)[] {
		return inputs.map(input => /\.vsix$/i.test(input) ? URI.file(isAbsolute(input) ? input : join(cwd(), input)) : input);
	}
}

export async function main(argv: NativeParsedArgs): Promise<void> {
	const cliMain = new CliMain(argv);

	try {
		await cliMain.run();
	} finally {
		cliMain.dispose();
	}
}
