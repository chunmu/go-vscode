/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { IProductService } from '../../../../../platform/product/common/productService.ts';
import { IExtensionService } from '../../../../services/extensions/common/extensions.ts';
import { ExtensionIdentifier } from '../../../../../platform/extensions/common/extensions.ts';
import { IExtensionManagementService, InstallOperation } from '../../../../../platform/extensionManagement/common/extensionManagement.ts';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.ts';
import { IDefaultChatAgent } from '../../../../../base/common/product.ts';
import { IChatWidgetService } from '../chat.ts';

export class ChatGettingStartedContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.chatGettingStarted';
	private recentlyInstalled: boolean = false;

	private static readonly hideWelcomeView = 'workbench.chat.hideWelcomeView';

	constructor(
		@IProductService private readonly productService: IProductService,
		@IExtensionService private readonly extensionService: IExtensionService,
		@IExtensionManagementService private readonly extensionManagementService: IExtensionManagementService,
		@IStorageService private readonly storageService: IStorageService,
		@IChatWidgetService private readonly chatWidgetService: IChatWidgetService,
	) {
		super();

		const defaultChatAgent = this.productService.defaultChatAgent;
		const hideWelcomeView = this.storageService.getBoolean(ChatGettingStartedContribution.hideWelcomeView, StorageScope.APPLICATION, false);
		if (!defaultChatAgent || hideWelcomeView) {
			return;
		}

		this.registerListeners(defaultChatAgent);
	}

	private registerListeners(defaultChatAgent: IDefaultChatAgent): void {

		this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
			for (const e of result) {
				if (ExtensionIdentifier.equals(defaultChatAgent.extensionId, e.identifier.id) && e.operation === InstallOperation.Install) {
					this.recentlyInstalled = true;
					return;
				}
			}
		}));

		this._register(this.extensionService.onDidChangeExtensionsStatus(async (event) => {
			for (const ext of event) {
				if (ExtensionIdentifier.equals(defaultChatAgent.extensionId, ext.value)) {
					const extensionStatus = this.extensionService.getExtensionsStatus();
					if (extensionStatus[ext.value].activationTimes && this.recentlyInstalled) {
						this.onDidInstallChat();
						return;
					}
				}
			}
		}));
	}

	private async onDidInstallChat() {

		// Open Chat view
		this.chatWidgetService.revealWidget();

		// Only do this once
		this.storageService.store(ChatGettingStartedContribution.hideWelcomeView, true, StorageScope.APPLICATION, StorageTarget.MACHINE);
		this.recentlyInstalled = false;
	}
}
