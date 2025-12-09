/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.ts';
import { localize } from '../../../../nls.ts';
import { registerColor, textLinkForeground } from '../../../../platform/theme/common/colorRegistry.ts';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.ts';

export const extensionDefaultIcon = registerIcon('extension-default-icon', Codicon.extensionsLarge, localize('extensionDefault', 'Icon used for the default extension in the extensions view and editor.'));
export const verifiedPublisherIcon = registerIcon('extensions-verified-publisher', Codicon.verifiedFilled, localize('verifiedPublisher', 'Icon used for the verified extension publisher in the extensions view and editor.'));
export const extensionVerifiedPublisherIconColor = registerColor('extensionIcon.verifiedForeground', textLinkForeground, localize('extensionIconVerifiedForeground', "The icon color for extension verified publisher."), false);
