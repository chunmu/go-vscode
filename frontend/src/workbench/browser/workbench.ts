/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './style.ts';
import { runWhenWindowIdle } from '../../base/browser/dom.ts';
import { Event, Emitter, setGlobalLeakWarningThreshold } from '../../base/common/event.ts';
import { RunOnceScheduler, timeout } from '../../base/common/async.ts';
import { isFirefox, isSafari, isChrome } from '../../base/browser/browser.ts';
import { mark } from '../../base/common/performance.ts';
import { onUnexpectedError, setUnexpectedErrorHandler } from '../../base/common/errors.ts';
import { Registry } from '../../platform/registry/common/platform.ts';
import { isWindows, isLinux, isWeb, isNative, isMacintosh } from '../../base/common/platform.ts';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../common/contributions.ts';
import { IEditorFactoryRegistry, EditorExtensions } from '../common/editor.ts';
import { getSingletonServiceDescriptors } from '../../platform/instantiation/common/extensions.ts';
import { Position, Parts, IWorkbenchLayoutService, positionToString } from '../services/layout/browser/layoutService.ts';
import { IStorageService, WillSaveStateReason, StorageScope, StorageTarget } from '../../platform/storage/common/storage.ts';
import { IConfigurationChangeEvent, IConfigurationService } from '../../platform/configuration/common/configuration.ts';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.ts';
import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.ts';
import { LifecyclePhase, ILifecycleService, WillShutdownEvent } from '../services/lifecycle/common/lifecycle.ts';
import { INotificationService } from '../../platform/notification/common/notification.ts';
import { NotificationService } from '../services/notification/common/notificationService.ts';
import { NotificationsCenter } from './parts/notifications/notificationsCenter.ts';
import { NotificationsAlerts } from './parts/notifications/notificationsAlerts.ts';
import { NotificationsStatus } from './parts/notifications/notificationsStatus.ts';
import { registerNotificationCommands } from './parts/notifications/notificationsCommands.ts';
import { NotificationsToasts } from './parts/notifications/notificationsToasts.ts';
import { setARIAContainer } from '../../base/browser/ui/aria/aria.ts';
import { FontMeasurements } from '../../editor/browser/config/fontMeasurements.ts';
import { createBareFontInfoFromRawSettings } from '../../editor/common/config/fontInfoFromSettings.ts';
import { ILogService } from '../../platform/log/common/log.ts';
import { toErrorMessage } from '../../base/common/errorMessage.ts';
import { WorkbenchContextKeysHandler } from './contextkeys.ts';
import { coalesce } from '../../base/common/arrays.ts';
import { InstantiationService } from '../../platform/instantiation/common/instantiationService.ts';
import { Layout } from './layout.ts';
import { IHostService } from '../services/host/browser/host.ts';
import { IDialogService } from '../../platform/dialogs/common/dialogs.ts';
import { mainWindow } from '../../base/browser/window.ts';
import { PixelRatio } from '../../base/browser/pixelRatio.ts';
import { IHoverService, WorkbenchHoverDelegate } from '../../platform/hover/browser/hover.ts';
import { setHoverDelegateFactory } from '../../base/browser/ui/hover/hoverDelegateFactory.ts';
import { setBaseLayerHoverDelegate } from '../../base/browser/ui/hover/hoverDelegate2.ts';
import { AccessibilityProgressSignalScheduler } from '../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.ts';
import { setProgressAccessibilitySignalScheduler } from '../../base/browser/ui/progressbar/progressAccessibilitySignal.ts';
import { AccessibleViewRegistry } from '../../platform/accessibility/browser/accessibleViewRegistry.ts';
import { NotificationAccessibleView } from './parts/notifications/notificationAccessibleView.ts';
import { IMarkdownRendererService } from '../../platform/markdown/browser/markdownRenderer.ts';
import { EditorMarkdownCodeBlockRenderer } from '../../editor/browser/widget/markdownRenderer/browser/editorMarkdownCodeBlockRenderer.ts';

export interface IWorkbenchOptions {

	/**
	 * Extra classes to be added to the workbench container.
	 */
	extraClasses?: string[];

	/**
	 * Whether to reset the workbench parts layout on startup.
	 */
	resetLayout?: boolean;
}

export class Workbench extends Layout {

	private readonly _onWillShutdown = this._register(new Emitter<WillShutdownEvent>());
	readonly onWillShutdown = this._onWillShutdown.event;

	private readonly _onDidShutdown = this._register(new Emitter<void>());
	readonly onDidShutdown = this._onDidShutdown.event;

	constructor(
		parent: HTMLElement,
		private readonly options: IWorkbenchOptions | undefined,
		private readonly serviceCollection: ServiceCollection,
		logService: ILogService
	) {
		super(parent, { resetLayout: Boolean(options?.resetLayout) });

		// Perf: measure workbench startup time
		mark('code/willStartWorkbench');

		this.registerErrorHandler(logService);
	}

	private registerErrorHandler(logService: ILogService): void {

		// Listen on unhandled rejection events
		// Note: intentionally not registered as disposable to handle
		//       errors that can occur during shutdown phase.
		mainWindow.addEventListener('unhandledrejection', (event) => {

			// See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
			onUnexpectedError(event.reason);

			// Prevent the printing of this event to the console
			event.preventDefault();
		});

		// Install handler for unexpected errors
		setUnexpectedErrorHandler(error => this.handleUnexpectedError(error, logService));
	}

	private previousUnexpectedError: { message: string | undefined; time: number } = { message: undefined, time: 0 };
	private handleUnexpectedError(error: unknown, logService: ILogService): void {
		const message = toErrorMessage(error, true);
		if (!message) {
			return;
		}

		const now = Date.now();
		if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1000) {
			return; // Return if error message identical to previous and shorter than 1 second
		}

		this.previousUnexpectedError.time = now;
		this.previousUnexpectedError.message = message;

		// Log it
		logService.error(message);
	}

	startup(): IInstantiationService {
		try {

			// Configure emitter leak warning threshold
			this._register(setGlobalLeakWarningThreshold(175));

			// Services
			const instantiationService = this.initServices(this.serviceCollection);

			instantiationService.invokeFunction(accessor => {
				const lifecycleService = accessor.get(ILifecycleService);
				const storageService = accessor.get(IStorageService);
				const configurationService = accessor.get(IConfigurationService);
				const hostService = accessor.get(IHostService);
				const hoverService = accessor.get(IHoverService);
				const dialogService = accessor.get(IDialogService);
				const notificationService = accessor.get(INotificationService) as NotificationService;
				const markdownRendererService = accessor.get(IMarkdownRendererService);

				// Set code block renderer for markdown rendering
				markdownRendererService.setDefaultCodeBlockRenderer(instantiationService.createInstance(EditorMarkdownCodeBlockRenderer));

				// Default Hover Delegate must be registered before creating any workbench/layout components
				// as these possibly will use the default hover delegate
				setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, { instantHover: enableInstantHover }, {}));
				setBaseLayerHoverDelegate(hoverService);

				// Layout
				this.initLayout(accessor);

				// Registries
				Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).start(accessor);
				Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory).start(accessor);

				// Context Keys
				this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));

				// Register Listeners
				this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);

				// Render Workbench
				this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);

				// Workbench Layout
				this.createWorkbenchLayout();

				// Layout
				this.layout();

				// Restore
				this.restore(lifecycleService);
			});

			return instantiationService;
		} catch (error) {
			onUnexpectedError(error);

			throw error; // rethrow because this is a critical issue we cannot handle properly here
		}
	}

	private initServices(serviceCollection: ServiceCollection): IInstantiationService {

		// Layout Service
		serviceCollection.set(IWorkbenchLayoutService, this);

		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//
		// NOTE: Please do NOT register services here. Use `registerSingleton()`
		//       from `workbench.common.main.ts` if the service is shared between
		//       desktop and web or `workbench.desktop.main.ts` if the service
		//       is desktop only.
		//
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		// All Contributed Services
		const contributedServices = getSingletonServiceDescriptors();
		for (const [id, descriptor] of contributedServices) {
			serviceCollection.set(id, descriptor);
		}

		const instantiationService = new InstantiationService(serviceCollection, true);

		// Wrap up
		instantiationService.invokeFunction(accessor => {
			const lifecycleService = accessor.get(ILifecycleService);

			// TODO@Sandeep debt around cyclic dependencies
			const configurationService = accessor.get(IConfigurationService);
			if (configurationService && 'acquireInstantiationService' in configurationService) {
				(configurationService as { acquireInstantiationService: (instantiationService: unknown) => void }).acquireInstantiationService(instantiationService);
			}

			// Signal to lifecycle that services are set
			lifecycleService.phase = LifecyclePhase.Ready;
		});

		return instantiationService;
	}

	private registerListeners(lifecycleService: ILifecycleService, storageService: IStorageService, configurationService: IConfigurationService, hostService: IHostService, dialogService: IDialogService): void {

		// Configuration changes
		this._register(configurationService.onDidChangeConfiguration(e => this.updateFontAliasing(e, configurationService)));

		// Font Info
		if (isNative) {
			this._register(storageService.onWillSaveState(e => {
				if (e.reason === WillSaveStateReason.SHUTDOWN) {
					this.storeFontInfo(storageService);
				}
			}));
		} else {
			this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
		}

		// Lifecycle
		this._register(lifecycleService.onWillShutdown(event => this._onWillShutdown.fire(event)));
		this._register(lifecycleService.onDidShutdown(() => {
			this._onDidShutdown.fire();
			this.dispose();
		}));

		// In some environments we do not get enough time to persist state on shutdown.
		// In other cases, VSCode might crash, so we periodically save state to reduce
		// the chance of loosing any state.
		// The window loosing focus is a good indication that the user has stopped working
		// in that window so we pick that at a time to collect state.
		this._register(hostService.onDidChangeFocus(focus => {
			if (!focus) {
				storageService.flush();
			}
		}));

		// Dialogs showing/hiding
		this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add('modal-dialog-visible')));
		this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove('modal-dialog-visible')));
	}

	private fontAliasing: 'default' | 'antialiased' | 'none' | 'auto' | undefined;
	private updateFontAliasing(e: IConfigurationChangeEvent | undefined, configurationService: IConfigurationService) {
		if (!isMacintosh) {
			return; // macOS only
		}

		if (e && !e.affectsConfiguration('workbench.fontAliasing')) {
			return;
		}

		const aliasing = configurationService.getValue<'default' | 'antialiased' | 'none' | 'auto'>('workbench.fontAliasing');
		if (this.fontAliasing === aliasing) {
			return;
		}

		this.fontAliasing = aliasing;

		// Remove all
		const fontAliasingValues: (typeof aliasing)[] = ['antialiased', 'none', 'auto'];
		this.mainContainer.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));

		// Add specific
		if (fontAliasingValues.some(option => option === aliasing)) {
			this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
		}
	}

	private restoreFontInfo(storageService: IStorageService, configurationService: IConfigurationService): void {
		const storedFontInfoRaw = storageService.get('editorFontInfo', StorageScope.APPLICATION);
		if (storedFontInfoRaw) {
			try {
				const storedFontInfo = JSON.parse(storedFontInfoRaw);
				if (Array.isArray(storedFontInfo)) {
					FontMeasurements.restoreFontInfo(mainWindow, storedFontInfo);
				}
			} catch (err) {
				/* ignore */
			}
		}

		FontMeasurements.readFontInfo(mainWindow, createBareFontInfoFromRawSettings(configurationService.getValue('editor'), PixelRatio.getInstance(mainWindow).value));
	}

	private storeFontInfo(storageService: IStorageService): void {
		const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
		if (serializedFontInfo) {
			storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
	}

	private renderWorkbench(instantiationService: IInstantiationService, notificationService: NotificationService, storageService: IStorageService, configurationService: IConfigurationService): void {

		// ARIA & Signals
		setARIAContainer(this.mainContainer);
		setProgressAccessibilitySignalScheduler((msDelayTime: number, msLoopTime?: number) => instantiationService.createInstance(AccessibilityProgressSignalScheduler, msDelayTime, msLoopTime));

		// State specific classes
		const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
		const workbenchClasses = coalesce([
			'monaco-workbench',
			platformClass,
			isWeb ? 'web' : undefined,
			isChrome ? 'chromium' : isFirefox ? 'firefox' : isSafari ? 'safari' : undefined,
			...this.getLayoutClasses(),
			...(this.options?.extraClasses ? this.options.extraClasses : [])
		]);

		this.mainContainer.classList.add(...workbenchClasses);

		// Apply font aliasing
		this.updateFontAliasing(undefined, configurationService);

		// Warm up font cache information before building up too many dom elements
		this.restoreFontInfo(storageService, configurationService);

		// Create Parts
		for (const { id, role, classes, options } of [
			{ id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'] },
			{ id: Parts.BANNER_PART, role: 'banner', classes: ['banner'] },
			{ id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] }, // Use role 'none' for some parts to make screen readers less chatty #114892
			{ id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
			{ id: Parts.EDITOR_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
			{ id: Parts.PANEL_PART, role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
			{ id: Parts.AUXILIARYBAR_PART, role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === Position.LEFT ? 'right' : 'left'] },
			{ id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] }
		]) {
			const partContainer = this.createPart(id, role, classes);

			mark(`code/willCreatePart/${id}`);
			this.getPart(id).create(partContainer, options);
			mark(`code/didCreatePart/${id}`);
		}

		// Notification Handlers
		this.createNotificationsHandlers(instantiationService, notificationService);

		// Add Workbench to DOM
		this.parent.appendChild(this.mainContainer);
	}

	private createPart(id: string, role: string, classes: string[]): HTMLElement {
		const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
		part.classList.add('part', ...classes);
		part.id = id;
		part.setAttribute('role', role);
		if (role === 'status') {
			part.setAttribute('aria-live', 'off');
		}

		return part;
	}

	private createNotificationsHandlers(instantiationService: IInstantiationService, notificationService: NotificationService): void {

		// Instantiate Notification components
		const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.mainContainer, notificationService.model));
		const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.mainContainer, notificationService.model));
		this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
		const notificationsStatus = instantiationService.createInstance(NotificationsStatus, notificationService.model);

		// Visibility
		this._register(notificationsCenter.onDidChangeVisibility(() => {
			notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
			notificationsToasts.update(notificationsCenter.isVisible);
		}));

		this._register(notificationsToasts.onDidChangeVisibility(() => {
			notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
		}));

		// Register Commands
		registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);

		// Register notification accessible view
		AccessibleViewRegistry.register(new NotificationAccessibleView());

		// Register with Layout
		this.registerNotifications({
			onDidChangeNotificationsVisibility: Event.map(Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
		});
	}

	private restore(lifecycleService: ILifecycleService): void {

		// Ask each part to restore
		try {
			this.restoreParts();
		} catch (error) {
			onUnexpectedError(error);
		}

		// Transition into restored phase after layout has restored
		// but do not wait indefinitely on this to account for slow
		// editors restoring. Since the workbench is fully functional
		// even when the visible editors have not resolved, we still
		// want contributions on the `Restored` phase to work before
		// slow editors have resolved. But we also do not want fast
		// editors to resolve slow when too many contributions get
		// instantiated, so we find a middle ground solution via
		// `Promise.race`
		this.whenReady.finally(() =>
			Promise.race([
				this.whenRestored,
				timeout(2000)
			]).finally(() => {

				// Update perf marks only when the layout is fully
				// restored. We want the time it takes to restore
				// editors to be included in these numbers

				function markDidStartWorkbench() {
					mark('code/didStartWorkbench');
					performance.measure('perf: workbench create & restore', 'code/didLoadWorkbenchMain', 'code/didStartWorkbench');
				}

				if (this.isRestored()) {
					markDidStartWorkbench();
				} else {
					this.whenRestored.finally(() => markDidStartWorkbench());
				}

				// Set lifecycle phase to `Restored`
				lifecycleService.phase = LifecyclePhase.Restored;

				// Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
				const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
					this._register(runWhenWindowIdle(mainWindow, () => lifecycleService.phase = LifecyclePhase.Eventually, 2500));
				}, 2500));
				eventuallyPhaseScheduler.schedule();
			})
		);
	}
}
