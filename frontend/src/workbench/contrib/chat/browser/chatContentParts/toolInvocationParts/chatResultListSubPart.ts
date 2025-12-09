/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMarkdownString } from '../../../../../../base/common/htmlContent.ts';
import { URI } from '../../../../../../base/common/uri.ts';
import { Location } from '../../../../../../editor/common/languages.ts';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.ts';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService.ts';
import { IChatCodeBlockInfo } from '../../chat.ts';
import { IChatContentPartRenderContext } from '../chatContentParts.ts';
import { ChatCollapsibleListContentPart, CollapsibleListPool, IChatCollapsibleListItem } from '../chatReferencesContentPart.ts';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.ts';

export class ChatResultListSubPart extends BaseChatToolInvocationSubPart {
	public readonly domNode: HTMLElement;
	public readonly codeblocks: IChatCodeBlockInfo[] = [];

	constructor(
		toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized,
		context: IChatContentPartRenderContext,
		message: string | IMarkdownString,
		toolDetails: Array<URI | Location>,
		listPool: CollapsibleListPool,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super(toolInvocation);

		const collapsibleListPart = this._register(instantiationService.createInstance(
			ChatCollapsibleListContentPart,
			toolDetails.map<IChatCollapsibleListItem>(detail => ({
				kind: 'reference',
				reference: detail,
			})),
			message,
			context,
			listPool,
		));
		this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
		this.domNode = collapsibleListPart.domNode;
	}
}
