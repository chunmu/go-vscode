/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { getMachineId, getSqmMachineId, getDevDeviceId } from '../../node/id.ts';
import { getMac } from '../../node/macAddress.ts';
import { flakySuite } from './testUtils.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../common/utils.ts';

flakySuite('ID', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('getMachineId', async function () {
		const errors = [];
		const id = await getMachineId(err => errors.push(err));
		assert.ok(id);
		assert.strictEqual(errors.length, 0);
	});

	test('getSqmId', async function () {
		const errors = [];
		const id = await getSqmMachineId(err => errors.push(err));
		assert.ok(typeof id === 'string');
		assert.strictEqual(errors.length, 0);
	});

	test('getDevDeviceId', async function () {
		const errors = [];
		const id = await getDevDeviceId(err => errors.push(err));
		assert.ok(typeof id === 'string');
		assert.strictEqual(errors.length, 0);
	});

	test('getMac', async () => {
		const macAddress = getMac();
		assert.ok(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress), `Expected a MAC address, got: ${macAddress}`);
	});
});
