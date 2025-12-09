/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BrowserWindowConstructorOptions, HandlerDetails, WebContents } from 'electron';
import { Event } from '../../../base/common/event.ts';
import { IAuxiliaryWindow } from './auxiliaryWindow.ts';
import { createDecorator } from '../../instantiation/common/instantiation.ts';

export const IAuxiliaryWindowsMainService = createDecorator<IAuxiliaryWindowsMainService>('auxiliaryWindowsMainService');

export interface IAuxiliaryWindowsMainService {

	readonly _serviceBrand: undefined;

	readonly onDidMaximizeWindow: Event<IAuxiliaryWindow>;
	readonly onDidUnmaximizeWindow: Event<IAuxiliaryWindow>;
	readonly onDidChangeFullScreen: Event<{ window: IAuxiliaryWindow; fullscreen: boolean }>;
	readonly onDidChangeAlwaysOnTop: Event<{ window: IAuxiliaryWindow; alwaysOnTop: boolean }>;
	readonly onDidTriggerSystemContextMenu: Event<{ readonly window: IAuxiliaryWindow; readonly x: number; readonly y: number }>;

	createWindow(details: HandlerDetails): BrowserWindowConstructorOptions;
	registerWindow(webContents: WebContents): void;

	getWindowByWebContents(webContents: WebContents): IAuxiliaryWindow | undefined;

	getFocusedWindow(): IAuxiliaryWindow | undefined;
	getLastActiveWindow(): IAuxiliaryWindow | undefined;

	getWindows(): readonly IAuxiliaryWindow[];
}
