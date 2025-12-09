/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LegacyLinesDiffComputer } from './legacyLinesDiffComputer.ts';
import { DefaultLinesDiffComputer } from './defaultLinesDiffComputer/defaultLinesDiffComputer.ts';
import { ILinesDiffComputer } from './linesDiffComputer.ts';

export const linesDiffComputers = {
	getLegacy: () => new LegacyLinesDiffComputer(),
	getDefault: () => new DefaultLinesDiffComputer(),
} satisfies Record<string, () => ILinesDiffComputer>;
