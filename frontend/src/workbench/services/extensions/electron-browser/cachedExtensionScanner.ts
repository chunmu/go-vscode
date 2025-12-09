/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as platform from '../../../../base/common/platform.ts';
import { IExtensionDescription, IExtension } from '../../../../platform/extensions/common/extensions.ts';
import { dedupExtensions } from '../common/extensionsUtil.ts';
import { IExtensionsScannerService, IScannedExtension, toExtensionDescription as toExtensionDescriptionFromScannedExtension } from '../../../../platform/extensionManagement/common/extensionsScannerService.ts';
import { ILogService } from '../../../../platform/log/common/log.ts';
import Severity from '../../../../base/common/severity.ts';
import { localize } from '../../../../nls.ts';
import { INotificationService } from '../../../../platform/notification/common/notification.ts';
import { IHostService } from '../../host/browser/host.ts';
import { timeout } from '../../../../base/common/async.ts';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.ts';
import { getErrorMessage } from '../../../../base/common/errors.ts';
import { IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.ts';
import { toExtensionDescription } from '../common/extensions.ts';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.ts';

export class CachedExtensionScanner {

	public readonly scannedExtensions: Promise<IExtensionDescription[]>;
	private _scannedExtensionsResolve!: (result: IExtensionDescription[]) => void;
	private _scannedExtensionsReject!: (err: unknown) => void;

	constructor(
		@INotificationService private readonly _notificationService: INotificationService,
		@IHostService private readonly _hostService: IHostService,
		@IExtensionsScannerService private readonly _extensionsScannerService: IExtensionsScannerService,
		@IUserDataProfileService private readonly _userDataProfileService: IUserDataProfileService,
		@IWorkbenchExtensionManagementService private readonly _extensionManagementService: IWorkbenchExtensionManagementService,
		@IWorkbenchEnvironmentService private readonly _environmentService: IWorkbenchEnvironmentService,
		@ILogService private readonly _logService: ILogService,
	) {
		this.scannedExtensions = new Promise<IExtensionDescription[]>((resolve, reject) => {
			this._scannedExtensionsResolve = resolve;
			this._scannedExtensionsReject = reject;
		});
	}

	public async startScanningExtensions(): Promise<void> {
		try {
			const extensions = await this._scanInstalledExtensions();
			this._scannedExtensionsResolve(extensions);
		} catch (err) {
			this._scannedExtensionsReject(err);
		}
	}

	private async _scanInstalledExtensions(): Promise<IExtensionDescription[]> {
		try {
			const language = platform.language;
			const result = await Promise.allSettled([
				this._extensionsScannerService.scanSystemExtensions({ language, checkControlFile: true }),
				this._extensionsScannerService.scanUserExtensions({ language, profileLocation: this._userDataProfileService.currentProfile.extensionsResource, useCache: true }),
				this._environmentService.remoteAuthority ? [] : this._extensionManagementService.getInstalledWorkspaceExtensions(false)
			]);

			let hasErrors = false;

			let scannedSystemExtensions: IScannedExtension[] = [];
			if (result[0].status === 'fulfilled') {
				scannedSystemExtensions = result[0].value;
			} else {
				hasErrors = true;
				this._logService.error(`Error scanning system extensions:`, getErrorMessage(result[0].reason));
			}

			let scannedUserExtensions: IScannedExtension[] = [];
			if (result[1].status === 'fulfilled') {
				scannedUserExtensions = result[1].value;
			} else {
				hasErrors = true;
				this._logService.error(`Error scanning user extensions:`, getErrorMessage(result[1].reason));
			}

			let workspaceExtensions: IExtension[] = [];
			if (result[2].status === 'fulfilled') {
				workspaceExtensions = result[2].value;
			} else {
				hasErrors = true;
				this._logService.error(`Error scanning workspace extensions:`, getErrorMessage(result[2].reason));
			}

			const scannedDevelopedExtensions: IScannedExtension[] = [];
			try {
				const allScannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment([...scannedSystemExtensions, ...scannedUserExtensions], { language, includeInvalid: true });
				const invalidExtensions: IScannedExtension[] = [];
				for (const extensionUnderDevelopment of allScannedDevelopedExtensions) {
					if (extensionUnderDevelopment.isValid) {
						scannedDevelopedExtensions.push(extensionUnderDevelopment);
					} else {
						invalidExtensions.push(extensionUnderDevelopment);
					}
				}
				if (invalidExtensions.length > 0) {
					this._notificationService.prompt(
						Severity.Warning,
						invalidExtensions.length === 1
							? localize('extensionUnderDevelopment.invalid', "Failed loading extension '{0}' under development because it is invalid: {1}", invalidExtensions[0].location.fsPath, invalidExtensions[0].validations[0][1])
							: localize('extensionsUnderDevelopment.invalid', "Failed loading extensions {0} under development because they are invalid: {1}", invalidExtensions.map(ext => `'${ext.location.fsPath}'`).join(', '), invalidExtensions.map(ext => `${ext.validations[0][1]}`).join(', ')),
						[]
					);
				}
			} catch (error) {
				this._logService.error(error);
			}

			const system = scannedSystemExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, false));
			const user = scannedUserExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, false));
			const workspace = workspaceExtensions.map(e => toExtensionDescription(e, false));
			const development = scannedDevelopedExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, true));
			const r = dedupExtensions(system, user, workspace, development, this._logService);

			if (!hasErrors) {
				const disposable = this._extensionsScannerService.onDidChangeCache(() => {
					disposable.dispose();
					this._notificationService.prompt(
						Severity.Error,
						localize('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window."),
						[{
							label: localize('reloadWindow', "Reload Window"),
							run: () => this._hostService.reload()
						}]
					);
				});
				timeout(5000).then(() => disposable.dispose());
			}

			return r;
		} catch (err) {
			this._logService.error(`Error scanning installed extensions:`);
			this._logService.error(err);
			return [];
		}
	}

}
