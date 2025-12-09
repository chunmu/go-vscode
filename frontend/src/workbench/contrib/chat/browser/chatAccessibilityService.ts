/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.ts';
import { renderAsPlaintext } from '../../../../base/browser/markdownRenderer.ts';
import { alert, status } from '../../../../base/browser/ui/aria/aria.ts';
import { Event } from '../../../../base/common/event.ts';
import { MarkdownString } from '../../../../base/common/htmlContent.ts';
import { Disposable, DisposableMap, DisposableStore } from '../../../../base/common/lifecycle.ts';
import { localize } from '../../../../nls.ts';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.ts';
import { AccessibilityProgressSignalScheduler } from '../../../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { FocusMode } from '../../../../platform/native/common/native.ts';
import { IHostService } from '../../../services/host/browser/host.ts';
import { AccessibilityVoiceSettingId } from '../../accessibility/browser/accessibilityConfiguration.ts';
import { ElicitationState, IChatElicitationRequest } from '../common/chatService.ts';
import { IChatResponseViewModel } from '../common/chatViewModel.ts';
import { ChatConfiguration } from '../common/constants.ts';
import { IChatAccessibilityService, IChatWidgetService } from './chat.ts';
import { ChatWidget } from './chatWidget.ts';

const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4000;
export class ChatAccessibilityService extends Disposable implements IChatAccessibilityService {
	declare readonly _serviceBrand: undefined;

	private _pendingSignalMap: DisposableMap<number, AccessibilityProgressSignalScheduler> = this._register(new DisposableMap());

	private _requestId: number = 0;

	private readonly notifications: Set<DisposableStore> = new Set();

	constructor(
		@IAccessibilitySignalService private readonly _accessibilitySignalService: IAccessibilitySignalService,
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
		@IHostService private readonly _hostService: IHostService,
		@IChatWidgetService private readonly _widgetService: IChatWidgetService,
	) {
		super();
	}

	override dispose(): void {
		for (const ds of Array.from(this.notifications)) {
			ds.dispose();
		}
		this.notifications.clear();
		super.dispose();
	}

	acceptRequest(): number {
		this._requestId++;
		this._accessibilitySignalService.playSignal(AccessibilitySignal.chatRequestSent, { allowManyInParallel: true });
		this._pendingSignalMap.set(this._requestId, this._instantiationService.createInstance(AccessibilityProgressSignalScheduler, CHAT_RESPONSE_PENDING_ALLOWANCE_MS, undefined));
		return this._requestId;
	}
	acceptResponse(widget: ChatWidget, container: HTMLElement, response: IChatResponseViewModel | string | undefined, requestId: number, isVoiceInput?: boolean): void {
		this._pendingSignalMap.deleteAndDispose(requestId);
		const isPanelChat = typeof response !== 'string';
		const responseContent = typeof response === 'string' ? response : response?.response.toString();
		this._accessibilitySignalService.playSignal(AccessibilitySignal.chatResponseReceived, { allowManyInParallel: true });
		if (!response || !responseContent) {
			return;
		}
		const plainTextResponse = renderAsPlaintext(new MarkdownString(responseContent));
		const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : '';
		this._showOSNotification(widget, container, plainTextResponse + errorDetails);
		if (!isVoiceInput || this._configurationService.getValue(AccessibilityVoiceSettingId.AutoSynthesize) !== 'on') {
			status(plainTextResponse + errorDetails);
		}
	}
	acceptElicitation(elicitation: IChatElicitationRequest): void {
		if (elicitation.state.get() !== ElicitationState.Pending) {
			return;
		}
		const title = typeof elicitation.title === 'string' ? elicitation.title : elicitation.title.value;
		const message = typeof elicitation.message === 'string' ? elicitation.message : elicitation.message.value;
		alert(title + ' ' + message);
		this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { allowManyInParallel: true });
	}

	private async _showOSNotification(widget: ChatWidget, container: HTMLElement, responseContent: string): Promise<void> {
		if (!this._configurationService.getValue(ChatConfiguration.NotifyWindowOnResponseReceived)) {
			return;
		}

		const targetWindow = dom.getWindow(container);
		if (!targetWindow) {
			return;
		}

		if (targetWindow.document.hasFocus()) {
			return;
		}

		// Don't show notification if there's no meaningful content
		if (!responseContent || !responseContent.trim()) {
			return;
		}

		await this._hostService.focus(targetWindow, { mode: FocusMode.Notify });

		// Dispose any previous unhandled notifications to avoid replacement/coalescing.
		for (const ds of Array.from(this.notifications)) {
			ds.dispose();
			this.notifications.delete(ds);
		}

		const title = widget?.viewModel?.model.title ? localize('chatTitle', "Chat: {0}", widget.viewModel.model.title) : localize('chat.untitledChat', "Untitled Chat");
		const notification = await dom.triggerNotification(title,
			{
				detail: localize('notificationDetail', "New chat response.")
			}
		);
		if (!notification) {
			return;
		}

		const disposables = new DisposableStore();
		disposables.add(notification);
		this.notifications.add(disposables);

		disposables.add(Event.once(notification.onClick)(async () => {
			await this._hostService.focus(targetWindow, { mode: FocusMode.Force });
			await this._widgetService.reveal(widget);
			widget.focusInput();
			disposables.dispose();
			this.notifications.delete(disposables);
		}));

		disposables.add(this._hostService.onDidChangeFocus(focus => {
			if (focus) {
				disposables.dispose();
				this.notifications.delete(disposables);
			}
		}));
	}

}
