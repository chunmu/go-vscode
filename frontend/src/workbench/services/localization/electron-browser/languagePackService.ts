/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILanguagePackService } from '../../../../platform/languagePacks/common/languagePacks.ts';
import { registerSharedProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.ts';

registerSharedProcessRemoteService(ILanguagePackService, 'languagePacks');
