/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.ts';
import { Button, IButtonStyles } from '../../../../base/browser/ui/button/button.ts';
import { MarkdownString } from '../../../../base/common/htmlContent.ts';
import { Disposable } from '../../../../base/common/lifecycle.ts';
import { localize } from '../../../../nls.ts';
import { IChatAgentService } from '../common/chatAgents.ts';
import { formatChatQuestion } from '../common/chatParserTypes.ts';
import { IChatFollowup } from '../common/chatService.ts';
import { ChatAgentLocation } from '../common/constants.ts';

const $ = dom.$;

export class ChatFollowups<T extends IChatFollowup> extends Disposable {
	constructor(
		container: HTMLElement,
		followups: T[],
		private readonly location: ChatAgentLocation,
		private readonly options: IButtonStyles | undefined,
		private readonly clickHandler: (followup: T) => void,
		@IChatAgentService private readonly chatAgentService: IChatAgentService
	) {
		super();

		const followupsContainer = dom.append(container, $('.interactive-session-followups'));
		followups.forEach(followup => this.renderFollowup(followupsContainer, followup));
	}

	private renderFollowup(container: HTMLElement, followup: T): void {

		if (!this.chatAgentService.getDefaultAgent(this.location)) {
			// No default agent yet, which affects how followups are rendered, so can't render this yet
			return;
		}

		const tooltipPrefix = formatChatQuestion(this.chatAgentService, this.location, '', followup.agentId, followup.subCommand);
		if (tooltipPrefix === undefined) {
			return;
		}

		const baseTitle = followup.kind === 'reply' ?
			(followup.title || followup.message)
			: followup.title;
		const message = followup.kind === 'reply' ? followup.message : followup.title;
		const tooltip = (tooltipPrefix +
			(followup.tooltip || message)).trim();
		const button = this._register(new Button(container, { ...this.options, title: tooltip }));
		if (followup.kind === 'reply') {
			button.element.classList.add('interactive-followup-reply');
		} else if (followup.kind === 'command') {
			button.element.classList.add('interactive-followup-command');
		}
		button.element.ariaLabel = localize('followUpAriaLabel', "Follow up question: {0}", baseTitle);
		button.label = new MarkdownString(baseTitle);

		this._register(button.onDidClick(() => this.clickHandler(followup)));
	}
}
