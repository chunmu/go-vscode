/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/agentsessionsview.css';
import { Codicon } from '../../../../../base/common/codicons.ts';
import { localize, localize2 } from '../../../../../nls.ts';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.ts';
import { SyncDescriptor } from '../../../../../platform/instantiation/common/descriptors.ts';
import { Registry } from '../../../../../platform/registry/common/platform.ts';
import { registerIcon } from '../../../../../platform/theme/common/iconRegistry.ts';
import { IViewPaneOptions, ViewPane } from '../../../../browser/parts/views/viewPane.ts';
import { ViewPaneContainer } from '../../../../browser/parts/views/viewPaneContainer.ts';
import { IViewContainersRegistry, Extensions as ViewExtensions, ViewContainerLocation, IViewsRegistry, IViewDescriptor, IViewDescriptorService } from '../../../../common/views.ts';
import { ChatContextKeys } from '../../common/chatContextKeys.ts';
import { ChatConfiguration } from '../../common/constants.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.ts';
import { IHoverService } from '../../../../../platform/hover/browser/hover.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.ts';
import { IOpenerService } from '../../../../../platform/opener/common/opener.ts';
import { IThemeService } from '../../../../../platform/theme/common/themeService.ts';
import { IOpenEvent, WorkbenchCompressibleAsyncDataTree } from '../../../../../platform/list/browser/listService.ts';
import { $, append } from '../../../../../base/browser/dom.ts';
import { AgentSessionsViewModel, IAgentSessionViewModel, IAgentSessionsViewModel, isLocalAgentSessionItem } from './agentSessionViewModel.ts';
import { AgentSessionRenderer, AgentSessionsAccessibilityProvider, AgentSessionsCompressionDelegate, AgentSessionsDataSource, AgentSessionsDragAndDrop, AgentSessionsIdentityProvider, AgentSessionsKeyboardNavigationLabelProvider, AgentSessionsListDelegate, AgentSessionsSorter } from './agentSessionsViewer.ts';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.ts';
import { ButtonWithDropdown } from '../../../../../base/browser/ui/button/button.ts';
import { IAction, Separator, toAction } from '../../../../../base/common/actions.ts';
import { FuzzyScore } from '../../../../../base/common/filters.ts';
import { IMenuService, MenuId } from '../../../../../platform/actions/common/actions.ts';
import { IChatSessionsService } from '../../common/chatSessionsService.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { getSessionItemContextOverlay, NEW_CHAT_SESSION_ACTION_ID } from '../chatSessions/common.ts';
import { ACTION_ID_OPEN_CHAT } from '../actions/chatActions.ts';
import { IProgressService } from '../../../../../platform/progress/common/progress.ts';
import { IChatEditorOptions } from '../chatEditor.ts';
import { assertReturnsDefined } from '../../../../../base/common/types.ts';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.ts';
import { DeferredPromise } from '../../../../../base/common/async.ts';
import { Event } from '../../../../../base/common/event.ts';
import { MutableDisposable } from '../../../../../base/common/lifecycle.ts';
import { ITreeContextMenuEvent } from '../../../../../base/browser/ui/tree/tree.ts';
import { MarshalledId } from '../../../../../base/common/marshallingIds.ts';
import { getActionBarActions, getFlatActionBarActions } from '../../../../../platform/actions/browser/menuEntryActionViewItem.ts';
import { IChatService } from '../../common/chatService.ts';
import { IChatWidgetService } from '../chat.ts';
import { AGENT_SESSIONS_VIEW_ID, AGENT_SESSIONS_VIEW_CONTAINER_ID, AgentSessionProviders } from './agentSessions.ts';
import { TreeFindMode } from '../../../../../base/browser/ui/tree/abstractTree.ts';
import { SIDE_GROUP } from '../../../../services/editor/common/editorService.ts';
import { IMarshalledChatSessionContext } from '../actions/chatSessionActions.ts';
import { distinct } from '../../../../../base/common/arrays.ts';

export class AgentSessionsView extends ViewPane {

	private sessionsViewModel: IAgentSessionsViewModel | undefined;

	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IChatSessionsService private readonly chatSessionsService: IChatSessionsService,
		@ICommandService private readonly commandService: ICommandService,
		@IProgressService private readonly progressService: IProgressService,
		@IEditorGroupsService private readonly editorGroupsService: IEditorGroupsService,
		@IChatService private readonly chatService: IChatService,
		@IMenuService private readonly menuService: IMenuService,
		@IChatWidgetService private readonly chatWidgetService: IChatWidgetService,
	) {
		super({ ...options, titleMenuId: MenuId.AgentSessionsTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		container.classList.add('agent-sessions-view');

		// New Session
		if (!this.configurationService.getValue('chat.hideNewButtonInAgentSessionsView')) {
			this.createNewSessionButton(container);
		}

		// Sessions List
		this.createList(container);

		this.registerListeners();
	}

	private registerListeners(): void {

		// Sessions List
		const list = assertReturnsDefined(this.list);
		this._register(this.onDidChangeBodyVisibility(visible => {
			if (!visible || this.sessionsViewModel) {
				return;
			}

			if (!this.sessionsViewModel) {
				this.createViewModel();
			} else {
				this.list?.updateChildren();
			}
		}));

		this._register(list.onDidOpen(e => {
			this.openAgentSession(e);
		}));

		this._register(list.onMouseDblClick(({ element }) => {
			if (element === null) {
				this.commandService.executeCommand(ACTION_ID_OPEN_CHAT);
			}
		}));

		this._register(list.onContextMenu((e) => {
			this.showContextMenu(e);
		}));
	}

	private async openAgentSession(e: IOpenEvent<IAgentSessionViewModel | undefined>): Promise<void> {
		const session = e.element;
		if (!session) {
			return;
		}

		let sessionOptions: IChatEditorOptions;
		if (isLocalAgentSessionItem(session)) {
			sessionOptions = {};
		} else {
			sessionOptions = { title: { preferred: session.label } };
		}

		sessionOptions.ignoreInView = true;

		const options: IChatEditorOptions = {
			preserveFocus: false,
			...sessionOptions,
			...e.editorOptions,
		};

		await this.chatSessionsService.activateChatSessionItemProvider(session.providerType); // ensure provider is activated before trying to open

		const group = e.sideBySide ? SIDE_GROUP : undefined;
		await this.chatWidgetService.openSession(session.resource, group, options);
	}

	private async showContextMenu({ element: session, anchor }: ITreeContextMenuEvent<IAgentSessionViewModel>): Promise<void> {
		if (!session) {
			return;
		}

		const provider = await this.chatSessionsService.activateChatSessionItemProvider(session.providerType);
		const contextOverlay = getSessionItemContextOverlay(session, provider, this.chatWidgetService, this.chatService, this.editorGroupsService);
		contextOverlay.push([ChatContextKeys.isCombinedSessionViewer.key, true]);
		const menu = this.menuService.createMenu(MenuId.ChatSessionsMenu, this.contextKeyService.createOverlay(contextOverlay));

		const marshalledSession: IMarshalledChatSessionContext = { session, $mid: MarshalledId.ChatSessionContext };
		this.contextMenuService.showContextMenu({
			getActions: () => distinct(getFlatActionBarActions(menu.getActions({ arg: marshalledSession, shouldForwardArgs: true })), action => action.id),
			getAnchor: () => anchor,
			getActionsContext: () => marshalledSession,
		});

		menu.dispose();
	}

	//#endregion

	//#region New Session Controls

	private newSessionContainer: HTMLElement | undefined;

	private createNewSessionButton(container: HTMLElement): void {
		this.newSessionContainer = append(container, $('.agent-sessions-new-session-container'));

		const newSessionButton = this._register(new ButtonWithDropdown(this.newSessionContainer, {
			title: localize('agentSessions.newSession', "New Session"),
			ariaLabel: localize('agentSessions.newSessionAriaLabel', "New Session"),
			contextMenuProvider: this.contextMenuService,
			actions: {
				getActions: () => {
					return this.getNewSessionActions();
				}
			},
			addPrimaryActionToDropdown: false,
			...defaultButtonStyles,
		}));

		newSessionButton.label = localize('agentSessions.newSession', "New Session");

		this._register(newSessionButton.onDidClick(() => this.commandService.executeCommand(ACTION_ID_OPEN_CHAT)));
	}

	private getNewSessionActions(): IAction[] {
		const actions: IAction[] = [];

		// Default action
		actions.push(toAction({
			id: 'newChatSession.default',
			label: localize('newChatSessionDefault', "New Local Session"),
			run: () => this.commandService.executeCommand(ACTION_ID_OPEN_CHAT)
		}));

		// Background (CLI)
		actions.push(toAction({
			id: 'newChatSessionFromProvider.background',
			label: localize('newBackgroundSession', "New Background Session"),
			run: () => this.commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${AgentSessionProviders.Background}`)
		}));

		// Cloud
		actions.push(toAction({
			id: 'newChatSessionFromProvider.cloud',
			label: localize('newCloudSession', "New Cloud Session"),
			run: () => this.commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${AgentSessionProviders.Cloud}`)
		}));

		let addedSeparator = false;
		for (const provider of this.chatSessionsService.getAllChatSessionContributions()) {
			if (provider.type === AgentSessionProviders.Background || provider.type === AgentSessionProviders.Cloud) {
				continue; // already added above
			}

			if (!addedSeparator) {
				actions.push(new Separator());
				addedSeparator = true;
			}

			const menuActions = this.menuService.getMenuActions(MenuId.ChatSessionsCreateSubMenu, this.scopedContextKeyService.createOverlay([
				[ChatContextKeys.sessionType.key, provider.type]
			]));

			const primaryActions = getActionBarActions(menuActions, () => true).primary;

			// Prefer provider creation actions...
			if (primaryActions.length > 0) {
				actions.push(...primaryActions);
			}

			// ...over our generic one
			else {
				actions.push(toAction({
					id: `newChatSessionFromProvider.${provider.type}`,
					label: localize('newChatSessionFromProvider', "New {0}", provider.displayName),
					run: () => this.commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${provider.type}`)
				}));
			}
		}

		// Install more
		actions.push(new Separator());
		actions.push(toAction({
			id: 'install-extensions',
			label: localize('chatSessions.installExtensions', "Install Chat Extensions..."),
			run: () => this.commandService.executeCommand('chat.sessions.gettingStarted')
		}));

		return actions;
	}

	//#endregion

	//#region Sessions List

	private listContainer: HTMLElement | undefined;
	private list: WorkbenchCompressibleAsyncDataTree<IAgentSessionsViewModel, IAgentSessionViewModel, FuzzyScore> | undefined;

	private createList(container: HTMLElement): void {
		this.listContainer = append(container, $('.agent-sessions-viewer'));

		this.list = this._register(this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree,
			'AgentSessionsView',
			this.listContainer,
			new AgentSessionsListDelegate(),
			new AgentSessionsCompressionDelegate(),
			[
				this.instantiationService.createInstance(AgentSessionRenderer)
			],
			new AgentSessionsDataSource(),
			{
				accessibilityProvider: new AgentSessionsAccessibilityProvider(),
				dnd: this.instantiationService.createInstance(AgentSessionsDragAndDrop),
				identityProvider: new AgentSessionsIdentityProvider(),
				horizontalScrolling: false,
				multipleSelectionSupport: false,
				findWidgetEnabled: true,
				defaultFindMode: TreeFindMode.Filter,
				keyboardNavigationLabelProvider: new AgentSessionsKeyboardNavigationLabelProvider(),
				sorter: new AgentSessionsSorter(),
				paddingBottom: AgentSessionsListDelegate.ITEM_HEIGHT,
				twistieAdditionalCssClass: () => 'force-no-twistie',
			}
		)) as WorkbenchCompressibleAsyncDataTree<IAgentSessionsViewModel, IAgentSessionViewModel, FuzzyScore>;
	}

	private createViewModel(): void {
		const sessionsViewModel = this.sessionsViewModel = this._register(this.instantiationService.createInstance(AgentSessionsViewModel, { filterMenuId: MenuId.AgentSessionsFilterSubMenu }));
		this.list?.setInput(sessionsViewModel);

		this._register(sessionsViewModel.onDidChangeSessions(() => {
			if (this.isBodyVisible()) {
				this.list?.updateChildren();
			}
		}));

		const didResolveDisposable = this._register(new MutableDisposable());
		this._register(sessionsViewModel.onWillResolve(() => {
			const didResolve = new DeferredPromise<void>();
			didResolveDisposable.value = Event.once(sessionsViewModel.onDidResolve)(() => didResolve.complete());

			this.progressService.withProgress(
				{
					location: this.id,
					title: localize('agentSessions.refreshing', 'Refreshing agent sessions...'),
					delay: 500
				},
				() => didResolve.p
			);
		}));
	}

	//#endregion

	//#region Actions internal API

	openFind(): void {
		this.list?.openFind();
	}

	refresh(): void {
		this.sessionsViewModel?.resolve(undefined);
	}

	//#endregion

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);

		let treeHeight = height;
		treeHeight -= this.newSessionContainer?.offsetHeight ?? 0;

		this.list?.layout(treeHeight, width);
	}

	override focus(): void {
		super.focus();

		if (this.list?.getFocus().length) {
			this.list.domFocus();
		}
	}
}

//#region View Registration

const chatAgentsIcon = registerIcon('chat-sessions-icon', Codicon.commentDiscussionSparkle, 'Icon for Agent Sessions View');

const AGENT_SESSIONS_VIEW_TITLE = localize2('agentSessions.view.label', "Agent Sessions");

const agentSessionsViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: AGENT_SESSIONS_VIEW_CONTAINER_ID,
	title: AGENT_SESSIONS_VIEW_TITLE,
	icon: chatAgentsIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [AGENT_SESSIONS_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: AGENT_SESSIONS_VIEW_CONTAINER_ID,
	hideIfEmpty: true,
	order: 6,
}, ViewContainerLocation.AuxiliaryBar);

const agentSessionsViewDescriptor: IViewDescriptor = {
	id: AGENT_SESSIONS_VIEW_ID,
	containerIcon: chatAgentsIcon,
	containerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
	singleViewPaneContainerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
	name: AGENT_SESSIONS_VIEW_TITLE,
	canToggleVisibility: false,
	canMoveView: true,
	openCommandActionDescriptor: {
		id: AGENT_SESSIONS_VIEW_ID,
		title: AGENT_SESSIONS_VIEW_TITLE
	},
	ctorDescriptor: new SyncDescriptor(AgentSessionsView),
	when: ContextKeyExpr.and(
		ChatContextKeys.Setup.hidden.negate(),
		ChatContextKeys.Setup.disabled.negate(),
		ContextKeyExpr.equals(`config.${ChatConfiguration.AgentSessionsViewLocation}`, 'single-view'),
	)
};
Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([agentSessionsViewDescriptor], agentSessionsViewContainer);

//#endregion
