/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { URI } from '../../../../../base/common/uri.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { getWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier } from '../../browser/workspaces.ts';

suite('Workspaces', () => {
	test('workspace identifiers are stable', function () {

		// workspace identifier
		assert.strictEqual(getWorkspaceIdentifier(URI.parse('vscode-remote:/hello/test')).id, '474434e4');

		// single folder identifier
		assert.strictEqual(getSingleFolderWorkspaceIdentifier(URI.parse('vscode-remote:/hello/test'))?.id, '474434e4');
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
