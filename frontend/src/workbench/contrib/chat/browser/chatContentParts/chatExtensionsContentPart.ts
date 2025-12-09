/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/chatExtensionsContent.css';
import * as dom from '../../../../../base/browser/dom.ts';
import { Emitter, Event } from '../../../../../base/common/event.ts';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { ExtensionsList, getExtensions } from '../../../extensions/browser/extensionsViewer.ts';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.ts';
import { IChatExtensionsContent } from '../../common/chatService.ts';
import { IChatRendererContent } from '../../common/chatViewModel.ts';
import { ChatTreeItem, ChatViewId, IChatCodeBlockInfo } from '../chat.ts';
import { IChatContentPart } from './chatContentParts.ts';
import { PagedModel } from '../../../../../base/common/paging.ts';
import { Codicon } from '../../../../../base/common/codicons.ts';
import { ThemeIcon } from '../../../../../base/common/themables.ts';
import { localize } from '../../../../../nls.ts';

export class ChatExtensionsContentPart extends Disposable implements IChatContentPart {
	public readonly domNode: HTMLElement;

	private _onDidChangeHeight = this._register(new Emitter<void>());
	public readonly onDidChangeHeight = this._onDidChangeHeight.event;

	public get codeblocks(): IChatCodeBlockInfo[] {
		return [];
	}

	public get codeblocksPartId(): string | undefined {
		return undefined;
	}

	constructor(
		private readonly extensionsContent: IChatExtensionsContent,
		@IExtensionsWorkbenchService extensionsWorkbenchService: IExtensionsWorkbenchService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		this.domNode = dom.$('.chat-extensions-content-part');
		const loadingElement = dom.append(this.domNode, dom.$('.loading-extensions-element'));
		dom.append(loadingElement, dom.$(ThemeIcon.asCSSSelector(ThemeIcon.modify(Codicon.loading, 'spin'))), dom.$('span.loading-message', undefined, localize('chat.extensions.loading', 'Loading extensions...')));

		const extensionsList = dom.append(this.domNode, dom.$('.extensions-list'));
		const list = this._register(instantiationService.createInstance(ExtensionsList, extensionsList, ChatViewId, { alwaysConsumeMouseWheel: false }, { onFocus: Event.None, onBlur: Event.None, filters: {} }));
		getExtensions(extensionsContent.extensions, extensionsWorkbenchService).then(extensions => {
			loadingElement.remove();
			if (this._store.isDisposed) {
				return;
			}
			list.setModel(new PagedModel(extensions));
			list.layout();
			this._onDidChangeHeight.fire();
		});
	}

	hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean {
		return other.kind === 'extensions' && other.extensions.length === this.extensionsContent.extensions.length && other.extensions.every(ext => this.extensionsContent.extensions.includes(ext));
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
