/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { IChatTransferService } from '../../common/chatTransferService.ts';

export class ChatTransferContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.chatTransfer';

	constructor(
		@IChatTransferService chatTransferService: IChatTransferService,
	) {
		super();
		chatTransferService.checkAndSetTransferredWorkspaceTrust();
	}
}
