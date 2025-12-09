/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StringEdit, StringReplacement } from '../edits/stringEdit.ts';
import { TextEdit, TextReplacement } from '../edits/textEdit.ts';
import { _setPositionOffsetTransformerDependencies } from './positionToOffsetImpl.ts';
import { TextLength } from './textLength.ts';

export { PositionOffsetTransformerBase, PositionOffsetTransformer } from './positionToOffsetImpl.ts';

_setPositionOffsetTransformerDependencies({
	StringEdit: StringEdit,
	StringReplacement: StringReplacement,
	TextReplacement: TextReplacement,
	TextEdit: TextEdit,
	TextLength: TextLength,
});

// TODO@hediet this is dept and needs to go. See https://github.com/microsoft/vscode/issues/251126.
export function ensureDependenciesAreSet(): void {
	// Noop
}
