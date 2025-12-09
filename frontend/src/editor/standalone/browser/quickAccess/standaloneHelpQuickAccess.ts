/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Registry } from '../../../../platform/registry/common/platform.ts';
import { IQuickAccessRegistry, Extensions } from '../../../../platform/quickinput/common/quickAccess.ts';
import { QuickHelpNLS } from '../../../common/standaloneStrings.ts';
import { HelpQuickAccessProvider } from '../../../../platform/quickinput/browser/helpQuickAccess.ts';

Registry.as<IQuickAccessRegistry>(Extensions.Quickaccess).registerQuickAccessProvider({
	ctor: HelpQuickAccessProvider,
	prefix: '',
	helpEntries: [{ description: QuickHelpNLS.helpQuickAccessActionLabel }]
});
