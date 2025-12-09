/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export { assertFn } from '../../assert.ts';
export { type EqualityComparer, strictEquals } from '../../equals.ts';
export { BugIndicatingError, onBugIndicatingError, onUnexpectedError } from '../../errors.ts';
export { Event, type IValueWithChangeEvent } from '../../event.ts';
export { DisposableStore, type IDisposable, markAsDisposed, toDisposable, trackDisposable } from '../../lifecycle.ts';
