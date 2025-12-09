/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IExternalTerminalService as ICommonExternalTerminalService } from '../common/externalTerminal.ts';
import { createDecorator } from '../../instantiation/common/instantiation.ts';
import { registerMainProcessRemoteService } from '../../ipc/electron-browser/services.ts';

export const IExternalTerminalService = createDecorator<IExternalTerminalService>('externalTerminal');

export interface IExternalTerminalService extends ICommonExternalTerminalService {
	readonly _serviceBrand: undefined;
}

registerMainProcessRemoteService(IExternalTerminalService, 'externalTerminal');
