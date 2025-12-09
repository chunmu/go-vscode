/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { mock, mockObject } from '../../../../../base/test/common/mock.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { IExtensionHostDebugService } from '../../../../../platform/debug/common/extensionHostDebug.ts';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.ts';
import { INotificationService } from '../../../../../platform/notification/common/notification.ts';
import { IOpenerService } from '../../../../../platform/opener/common/opener.ts';
import { RawDebugSession } from '../../browser/rawDebugSession.ts';
import { IDebugger } from '../../common/debug.ts';
import { MockDebugAdapter } from '../common/mockDebug.ts';

suite('RawDebugSession', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	function createTestObjects() {
		const debugAdapter = new MockDebugAdapter();
		const dbgr = mockObject<IDebugger>()({
			type: 'mock-debug'
		});

		const session = new RawDebugSession(
			debugAdapter,
			// eslint-disable-next-line local/code-no-any-casts
			dbgr as any as IDebugger,
			'sessionId',
			'name',
			new (mock<IExtensionHostDebugService>()),
			new (mock<IOpenerService>()),
			new (mock<INotificationService>()),
			new (mock<IDialogService>()));
		disposables.add(session);
		disposables.add(debugAdapter);

		return { debugAdapter, dbgr };
	}

	test('handles startDebugging request success', async () => {
		const { debugAdapter, dbgr } = createTestObjects();
		dbgr.startDebugging.returns(Promise.resolve(true));

		debugAdapter.sendRequestBody('startDebugging', {
			request: 'launch',
			configuration: {
				type: 'some-other-type'
			}
		} as DebugProtocol.StartDebuggingRequestArguments);
		const response = await debugAdapter.waitForResponseFromClient('startDebugging');
		assert.strictEqual(response.command, 'startDebugging');
		assert.strictEqual(response.success, true);
	});

	test('handles startDebugging request failure', async () => {
		const { debugAdapter, dbgr } = createTestObjects();
		dbgr.startDebugging.returns(Promise.resolve(false));

		debugAdapter.sendRequestBody('startDebugging', {
			request: 'launch',
			configuration: {
				type: 'some-other-type'
			}
		} as DebugProtocol.StartDebuggingRequestArguments);
		const response = await debugAdapter.waitForResponseFromClient('startDebugging');
		assert.strictEqual(response.command, 'startDebugging');
		assert.strictEqual(response.success, false);
	});
});
