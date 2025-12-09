/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.ts';
import { localize } from '../../../../../nls.ts';
import { IChatRequestVariableEntry } from '../../common/chatVariableEntries.ts';

export const ScreenshotVariableId = 'screenshot-focused-window';

export function convertBufferToScreenshotVariable(buffer: VSBuffer): IChatRequestVariableEntry {
	return {
		id: ScreenshotVariableId,
		name: localize('screenshot', 'Screenshot'),
		value: buffer.buffer,
		kind: 'image'
	};
}
