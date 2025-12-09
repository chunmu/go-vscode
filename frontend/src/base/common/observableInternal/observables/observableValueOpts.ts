/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISettableObservable } from '../base.ts';
import { DebugNameData, IDebugNameData } from '../debugName.ts';
import { EqualityComparer, strictEquals } from '../commonFacade/deps.ts';
import { ObservableValue } from './observableValue.ts';
import { LazyObservableValue } from './lazyObservableValue.ts';
import { DebugLocation } from '../debugLocation.ts';

export function observableValueOpts<T, TChange = void>(
	options: IDebugNameData & {
		equalsFn?: EqualityComparer<T>;
		lazy?: boolean;
	},
	initialValue: T,
	debugLocation = DebugLocation.ofCaller(),
): ISettableObservable<T, TChange> {
	if (options.lazy) {
		return new LazyObservableValue(
			new DebugNameData(options.owner, options.debugName, undefined),
			initialValue,
			options.equalsFn ?? strictEquals,
			debugLocation
		);
	}
	return new ObservableValue(
		new DebugNameData(options.owner, options.debugName, undefined),
		initialValue,
		options.equalsFn ?? strictEquals,
		debugLocation
	);
}
