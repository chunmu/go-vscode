/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This is a facade for the observable implementation. Only import from here!

export { observableValueOpts } from './observables/observableValueOpts.ts';
export { autorun, autorunDelta, autorunHandleChanges, autorunOpts, autorunWithStore, autorunWithStoreHandleChanges, autorunIterableDelta, autorunSelfDisposable } from './reactions/autorun.ts';
export { type IObservable, type IObservableWithChange, type IObserver, type IReader, type ISettable, type ISettableObservable, type ITransaction } from './base.ts';
export { disposableObservableValue } from './observables/observableValue.ts';
export { derived, derivedDisposable, derivedHandleChanges, derivedOpts, derivedWithSetter, derivedWithStore } from './observables/derived.ts';
export { type IDerivedReader } from './observables/derivedImpl.ts';
export { ObservableLazy, ObservableLazyPromise, ObservablePromise, PromiseResult, } from './utils/promise.ts';
export { derivedWithCancellationToken, waitForState } from './utils/utilsCancellation.ts';
export {
	debouncedObservable, debouncedObservable2, derivedObservableWithCache,
	derivedObservableWithWritableCache, keepObserved, mapObservableArrayCached, observableFromPromise,
	recomputeInitiallyAndOnChange,
	signalFromObservable, wasEventTriggeredRecently,
} from './utils/utils.ts';
export { type DebugOwner } from './debugName.ts';
export { type IChangeContext, type IChangeTracker, recordChanges, recordChangesLazy } from './changeTracker.ts';
export { constObservable } from './observables/constObservable.ts';
export { type IObservableSignal, observableSignal } from './observables/observableSignal.ts';
export { observableFromEventOpts } from './observables/observableFromEvent.ts';
export { observableSignalFromEvent } from './observables/observableSignalFromEvent.ts';
export { asyncTransaction, globalTransaction, subtransaction, transaction, TransactionImpl } from './transaction.ts';
export { observableFromValueWithChangeEvent, ValueWithChangeEventFromObservable } from './utils/valueWithChangeEvent.ts';
export { runOnChange, runOnChangeWithCancellationToken, runOnChangeWithStore, type RemoveUndefined } from './utils/runOnChange.ts';
export { derivedConstOnceDefined, latestChangedValue } from './experimental/utils.ts';
export { observableFromEvent } from './observables/observableFromEvent.ts';
export { observableValue } from './observables/observableValue.ts';

export { ObservableSet } from './set.ts';
export { ObservableMap } from './map.ts';
export { DebugLocation } from './debugLocation.ts';

import { addLogger, setLogObservableFn } from './logging/logging.ts';
import { ConsoleObservableLogger, logObservableToConsole } from './logging/consoleObservableLogger.ts';
import { DevToolsLogger } from './logging/debugger/devToolsLogger.ts';
import { env } from '../process.ts';
import { _setDebugGetObservableGraph } from './observables/baseObservable.ts';
import { debugGetObservableGraph } from './logging/debugGetDependencyGraph.ts';

_setDebugGetObservableGraph(debugGetObservableGraph);
setLogObservableFn(logObservableToConsole);

// Remove "//" in the next line to enable logging
const enableLogging = false
	// || Boolean("true") // done "weirdly" so that a lint warning prevents you from pushing this
	;

if (enableLogging) {
	addLogger(new ConsoleObservableLogger());
}

if (env && env['VSCODE_DEV_DEBUG_OBSERVABLES']) {
	// To debug observables you also need the extension "ms-vscode.debug-value-editor"
	addLogger(DevToolsLogger.getInstance());
}
