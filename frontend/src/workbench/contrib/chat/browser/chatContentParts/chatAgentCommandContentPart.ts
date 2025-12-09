/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { IHoverService } from '../../../../../platform/hover/browser/hover.ts';
import { IChatAgentCommand } from '../../common/chatAgents.ts';
import { chatSubcommandLeader } from '../../common/chatParserTypes.ts';
import { IChatRendererContent } from '../../common/chatViewModel.ts';
import { ChatTreeItem } from '../chat.ts';
import { IChatContentPart } from './chatContentParts.ts';
import { Codicon } from '../../../../../base/common/codicons.ts';
import { localize } from '../../../../../nls.ts';
import { Button } from '../../../../../base/browser/ui/button/button.ts';
import { generateUuid } from '../../../../../base/common/uuid.ts';
import { HoverStyle } from '../../../../../base/browser/ui/hover/hover.ts';


export class ChatAgentCommandContentPart extends Disposable implements IChatContentPart {

	readonly domNode: HTMLElement = document.createElement('span');

	constructor(
		cmd: IChatAgentCommand,
		onClick: () => void,
		@IHoverService private readonly _hoverService: IHoverService,
	) {
		super();
		this.domNode.classList.add('chat-agent-command');
		this.domNode.setAttribute('aria-label', cmd.name);
		this.domNode.setAttribute('role', 'button');

		const groupId = generateUuid();

		const commandSpan = document.createElement('span');
		this.domNode.appendChild(commandSpan);
		commandSpan.innerText = chatSubcommandLeader + cmd.name;
		this._store.add(this._hoverService.setupDelayedHover(commandSpan, {
			content: cmd.description,
			style: HoverStyle.Pointer,
		}, { groupId }));

		const rerun = localize('rerun', "Rerun without {0}{1}", chatSubcommandLeader, cmd.name);
		const btn = new Button(this.domNode, { ariaLabel: rerun });
		btn.icon = Codicon.close;
		this._store.add(btn.onDidClick(() => onClick()));
		this._store.add(btn);
		this._store.add(this._hoverService.setupDelayedHover(btn.element, {
			content: rerun,
			style: HoverStyle.Pointer,
		}, { groupId }));
	}

	hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean {
		return false;
	}
}
