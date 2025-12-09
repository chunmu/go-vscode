/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import assert from 'assert';
import { tmpdir } from 'os';
import { createCancelablePromise } from '../../../common/async.ts';
import { FileAccess } from '../../../common/network.ts';
import * as path from '../../../common/path.ts';
import { Promises } from '../../../node/pfs.ts';
import { extract } from '../../../node/zip.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../common/utils.ts';
import { getRandomTestPath } from '../testUtils.ts';

suite('Zip', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('extract should handle directories', async () => {
		const testDir = getRandomTestPath(tmpdir(), 'vsctests', 'zip');
		await fs.promises.mkdir(testDir, { recursive: true });

		const fixtures = FileAccess.asFileUri('vs/base/test/node/zip/fixtures').fsPath;
		const fixture = path.join(fixtures, 'extract.zip');

		await createCancelablePromise(token => extract(fixture, testDir, {}, token));
		const doesExist = await Promises.exists(path.join(testDir, 'extension'));
		assert(doesExist);

		await Promises.rm(testDir);
	});
});
