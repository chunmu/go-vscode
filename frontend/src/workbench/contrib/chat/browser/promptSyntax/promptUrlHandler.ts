/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { streamToBuffer, VSBuffer } from '../../../../../base/common/buffer.ts';
import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { IFileService } from '../../../../../platform/files/common/files.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { INotificationService } from '../../../../../platform/notification/common/notification.ts';
import { IOpenerService } from '../../../../../platform/opener/common/opener.ts';
import { IRequestService } from '../../../../../platform/request/common/request.ts';
import { IURLHandler, IURLService } from '../../../../../platform/url/common/url.ts';
import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { askForPromptFileName } from './pickers/askForPromptName.ts';
import { askForPromptSourceFolder } from './pickers/askForPromptSourceFolder.ts';
import { getCleanPromptName } from '../../common/promptSyntax/config/promptFileLocations.ts';
import { PromptsType } from '../../common/promptSyntax/promptTypes.ts';
import { ILogService } from '../../../../../platform/log/common/log.ts';
import { localize } from '../../../../../nls.ts';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.ts';
import { Schemas } from '../../../../../base/common/network.ts';
import { MarkdownString } from '../../../../../base/common/htmlContent.ts';
import { IHostService } from '../../../../services/host/browser/host.ts';
import { mainWindow } from '../../../../../base/browser/window.ts';

// example URL: code-oss:chat-prompt/install?url=https://gist.githubusercontent.com/aeschli/43fe78babd5635f062aef0195a476aad/raw/dfd71f60058a4dd25f584b55de3e20f5fd580e63/filterEvenNumbers.prompt.md

export class PromptUrlHandler extends Disposable implements IWorkbenchContribution, IURLHandler {

	static readonly ID = 'workbench.contrib.promptUrlHandler';

	constructor(
		@IURLService urlService: IURLService,
		@INotificationService private readonly notificationService: INotificationService,
		@IRequestService private readonly requestService: IRequestService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IFileService private readonly fileService: IFileService,
		@IOpenerService private readonly openerService: IOpenerService,
		@ILogService private readonly logService: ILogService,
		@IDialogService private readonly dialogService: IDialogService,

		@IHostService private readonly hostService: IHostService,
	) {
		super();
		this._register(urlService.registerHandler(this));
	}

	async handleURL(uri: URI): Promise<boolean> {
		let promptType: PromptsType | undefined;
		switch (uri.path) {
			case 'chat-prompt/install':
				promptType = PromptsType.prompt;
				break;
			case 'chat-instructions/install':
				promptType = PromptsType.instructions;
				break;
			case 'chat-mode/install':
			case 'chat-agent/install':
				promptType = PromptsType.agent;
				break;
			default:
				return false;
		}

		try {
			const query = decodeURIComponent(uri.query);
			if (!query || !query.startsWith('url=')) {
				return true;
			}

			const urlString = query.substring(4);
			const url = URI.parse(urlString);
			if (url.scheme !== Schemas.https && url.scheme !== Schemas.http) {
				this.logService.error(`[PromptUrlHandler] Invalid URL: ${urlString}`);
				return true;
			}

			await this.hostService.focus(mainWindow);

			if (await this.shouldBlockInstall(promptType, url)) {
				return true;
			}

			const result = await this.requestService.request({ type: 'GET', url: urlString }, CancellationToken.None);
			if (result.res.statusCode !== 200) {
				this.logService.error(`[PromptUrlHandler] Failed to fetch URL: ${urlString}`);
				this.notificationService.error(localize('failed', 'Failed to fetch URL: {0}', urlString));
				return true;
			}

			const responseData = (await streamToBuffer(result.stream)).toString();

			const newFolder = await this.instantiationService.invokeFunction(askForPromptSourceFolder, promptType);
			if (!newFolder) {
				return true;
			}

			const newName = await this.instantiationService.invokeFunction(askForPromptFileName, promptType, newFolder.uri, getCleanPromptName(url));
			if (!newName) {
				return true;
			}

			const promptUri = URI.joinPath(newFolder.uri, newName);

			await this.fileService.createFolder(newFolder.uri);
			await this.fileService.createFile(promptUri, VSBuffer.fromString(responseData));

			await this.openerService.open(promptUri);
			return true;

		} catch (error) {
			this.logService.error(`Error handling prompt URL ${uri.toString()}`, error);
			return true;
		}
	}

	private async shouldBlockInstall(promptType: PromptsType, url: URI): Promise<boolean> {
		let uriLabel = url.toString();
		if (uriLabel.length > 50) {
			uriLabel = `${uriLabel.substring(0, 35)}...${uriLabel.substring(uriLabel.length - 15)}`;
		}

		const detail = new MarkdownString('', { supportHtml: true });
		detail.appendMarkdown(localize('confirmOpenDetail2', "This will access {0}.\n\n", `[${uriLabel}](${url.toString()})`));
		detail.appendMarkdown(localize('confirmOpenDetail3', "If you did not initiate this request, it may represent an attempted attack on your system. Unless you took an explicit action to initiate this request, you should press 'No'"));

		let message: string;
		switch (promptType) {
			case PromptsType.prompt:
				message = localize('confirmInstallPrompt', "An external application wants to create a prompt file with content from a URL. Do you want to continue by selecting a destination folder and name?");
				break;
			case PromptsType.instructions:
				message = localize('confirmInstallInstructions', "An external application wants to create an instructions file with content from a URL. Do you want to continue by selecting a destination folder and name?");
				break;
			default:
				message = localize('confirmInstallAgent', "An external application wants to create a custom agent with content from a URL. Do you want to continue by selecting a destination folder and name?");
				break;
		}

		const { confirmed } = await this.dialogService.confirm({
			type: 'warning',
			primaryButton: localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
			cancelButton: localize('noButton', "No"),
			message,
			custom: {
				markdownDetails: [{
					markdown: detail
				}]
			}
		});

		return !confirmed;

	}
}
