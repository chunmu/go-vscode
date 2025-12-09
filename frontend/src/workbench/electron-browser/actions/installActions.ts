/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../nls.ts';
import { Action2 } from '../../../platform/actions/common/actions.ts';
import { ILocalizedString } from '../../../platform/action/common/action.ts';
import product from '../../../platform/product/common/product.ts';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.ts';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.ts';
import { INativeHostService } from '../../../platform/native/common/native.ts';
import { toErrorMessage } from '../../../base/common/errorMessage.ts';
import { IProductService } from '../../../platform/product/common/productService.ts';
import { isCancellationError } from '../../../base/common/errors.ts';

const shellCommandCategory: ILocalizedString = localize2('shellCommand', 'Shell Command');

export class InstallShellScriptAction extends Action2 {

	constructor() {
		super({
			id: 'workbench.action.installCommandLine',
			title: localize2('install', "Install '{0}' command in PATH", product.applicationName),
			category: shellCommandCategory,
			f1: true
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const nativeHostService = accessor.get(INativeHostService);
		const dialogService = accessor.get(IDialogService);
		const productService = accessor.get(IProductService);

		try {
			await nativeHostService.installShellCommand();

			dialogService.info(localize('successIn', "Shell command '{0}' successfully installed in PATH.", productService.applicationName));
		} catch (error) {
			if (isCancellationError(error)) {
				return;
			}

			dialogService.error(toErrorMessage(error));
		}
	}
}

export class UninstallShellScriptAction extends Action2 {

	constructor() {
		super({
			id: 'workbench.action.uninstallCommandLine',
			title: localize2('uninstall', "Uninstall '{0}' command from PATH", product.applicationName),
			category: shellCommandCategory,
			f1: true
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const nativeHostService = accessor.get(INativeHostService);
		const dialogService = accessor.get(IDialogService);
		const productService = accessor.get(IProductService);

		try {
			await nativeHostService.uninstallShellCommand();

			dialogService.info(localize('successFrom', "Shell command '{0}' successfully uninstalled from PATH.", productService.applicationName));
		} catch (error) {
			if (isCancellationError(error)) {
				return;
			}

			dialogService.error(toErrorMessage(error));
		}
	}
}
