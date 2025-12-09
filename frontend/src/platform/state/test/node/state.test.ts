/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { readFileSync, promises } from 'fs';
import { tmpdir } from 'os';
import { DisposableStore } from '../../../../base/common/lifecycle.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { join } from '../../../../base/common/path.ts';
import { URI } from '../../../../base/common/uri.ts';
import { Promises, writeFileSync } from '../../../../base/node/pfs.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.ts';
import { flakySuite, getRandomTestPath } from '../../../../base/test/node/testUtils.ts';
import { IFileService } from '../../../files/common/files.ts';
import { FileService } from '../../../files/common/fileService.ts';
import { DiskFileSystemProvider } from '../../../files/node/diskFileSystemProvider.ts';
import { ILogService, NullLogService } from '../../../log/common/log.ts';
import { FileStorage, SaveStrategy } from '../../node/stateService.ts';

flakySuite('StateService', () => {

	let testDir: string;
	let fileService: IFileService;
	let logService: ILogService;
	let diskFileSystemProvider: DiskFileSystemProvider;

	const disposables = new DisposableStore();

	setup(() => {
		testDir = getRandomTestPath(tmpdir(), 'vsctests', 'statemainservice');

		logService = new NullLogService();

		fileService = disposables.add(new FileService(logService));
		diskFileSystemProvider = disposables.add(new DiskFileSystemProvider(logService));
		disposables.add(fileService.registerProvider(Schemas.file, diskFileSystemProvider));

		return promises.mkdir(testDir, { recursive: true });
	});

	teardown(() => {
		disposables.clear();

		return Promises.rm(testDir);
	});

	test('Basics (delayed strategy)', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		let service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));
		await service.init();

		service.setItem('some.key', 'some.value');
		assert.strictEqual(service.getItem('some.key'), 'some.value');

		service.removeItem('some.key');
		assert.strictEqual(service.getItem('some.key', 'some.default'), 'some.default');

		assert.ok(!service.getItem('some.unknonw.key'));

		service.setItem('some.other.key', 'some.other.value');

		await service.close();

		service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));
		await service.init();

		assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');

		service.setItem('some.other.key', 'some.other.value');
		assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');

		service.setItem('some.undefined.key', undefined);
		assert.strictEqual(service.getItem('some.undefined.key', 'some.default'), 'some.default');

		service.setItem('some.null.key', null);
		assert.strictEqual(service.getItem('some.null.key', 'some.default'), 'some.default');

		service.setItems([
			{ key: 'some.setItems.key1', data: 'some.value' },
			{ key: 'some.setItems.key2', data: 0 },
			{ key: 'some.setItems.key3', data: true },
			{ key: 'some.setItems.key4', data: null },
			{ key: 'some.setItems.key5', data: undefined }
		]);

		assert.strictEqual(service.getItem('some.setItems.key1'), 'some.value');
		assert.strictEqual(service.getItem('some.setItems.key2'), 0);
		assert.strictEqual(service.getItem('some.setItems.key3'), true);
		assert.strictEqual(service.getItem('some.setItems.key4'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key5'), undefined);

		service.setItems([
			{ key: 'some.setItems.key1', data: undefined },
			{ key: 'some.setItems.key2', data: undefined },
			{ key: 'some.setItems.key3', data: undefined },
			{ key: 'some.setItems.key4', data: null },
			{ key: 'some.setItems.key5', data: undefined }
		]);

		assert.strictEqual(service.getItem('some.setItems.key1'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key2'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key3'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key4'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key5'), undefined);

		return service.close();
	});

	test('Basics (immediate strategy)', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		let service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.IMMEDIATE, logService, fileService));
		await service.init();

		service.setItem('some.key', 'some.value');
		assert.strictEqual(service.getItem('some.key'), 'some.value');

		service.removeItem('some.key');
		assert.strictEqual(service.getItem('some.key', 'some.default'), 'some.default');

		assert.ok(!service.getItem('some.unknonw.key'));

		service.setItem('some.other.key', 'some.other.value');

		await service.close();

		service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.IMMEDIATE, logService, fileService));
		await service.init();

		assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');

		service.setItem('some.other.key', 'some.other.value');
		assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');

		service.setItem('some.undefined.key', undefined);
		assert.strictEqual(service.getItem('some.undefined.key', 'some.default'), 'some.default');

		service.setItem('some.null.key', null);
		assert.strictEqual(service.getItem('some.null.key', 'some.default'), 'some.default');

		service.setItems([
			{ key: 'some.setItems.key1', data: 'some.value' },
			{ key: 'some.setItems.key2', data: 0 },
			{ key: 'some.setItems.key3', data: true },
			{ key: 'some.setItems.key4', data: null },
			{ key: 'some.setItems.key5', data: undefined }
		]);

		assert.strictEqual(service.getItem('some.setItems.key1'), 'some.value');
		assert.strictEqual(service.getItem('some.setItems.key2'), 0);
		assert.strictEqual(service.getItem('some.setItems.key3'), true);
		assert.strictEqual(service.getItem('some.setItems.key4'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key5'), undefined);

		service.setItems([
			{ key: 'some.setItems.key1', data: undefined },
			{ key: 'some.setItems.key2', data: undefined },
			{ key: 'some.setItems.key3', data: undefined },
			{ key: 'some.setItems.key4', data: null },
			{ key: 'some.setItems.key5', data: undefined }
		]);

		assert.strictEqual(service.getItem('some.setItems.key1'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key2'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key3'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key4'), undefined);
		assert.strictEqual(service.getItem('some.setItems.key5'), undefined);

		return service.close();
	});

	test('Multiple ops are buffered and applied', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		let service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));
		await service.init();

		service.setItem('some.key1', 'some.value1');
		service.setItem('some.key2', 'some.value2');
		service.setItem('some.key3', 'some.value3');
		service.setItem('some.key4', 'some.value4');
		service.removeItem('some.key4');

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		await service.close();

		service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));
		await service.init();

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		return service.close();
	});

	test('Multiple ops (Immediate Strategy)', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		let service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.IMMEDIATE, logService, fileService));
		await service.init();

		service.setItem('some.key1', 'some.value1');
		service.setItem('some.key2', 'some.value2');
		service.setItem('some.key3', 'some.value3');
		service.setItem('some.key4', 'some.value4');
		service.removeItem('some.key4');

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		await service.close();

		service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.IMMEDIATE, logService, fileService));
		await service.init();

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		return service.close();
	});

	test('Used before init', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		const service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));

		service.setItem('some.key1', 'some.value1');
		service.setItem('some.key2', 'some.value2');
		service.setItem('some.key3', 'some.value3');
		service.setItem('some.key4', 'some.value4');
		service.removeItem('some.key4');

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		await service.init();

		assert.strictEqual(service.getItem('some.key1'), 'some.value1');
		assert.strictEqual(service.getItem('some.key2'), 'some.value2');
		assert.strictEqual(service.getItem('some.key3'), 'some.value3');
		assert.strictEqual(service.getItem('some.key4'), undefined);

		return service.close();
	});

	test('Used after close', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		const service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));

		await service.init();

		service.setItem('some.key1', 'some.value1');
		service.setItem('some.key2', 'some.value2');
		service.setItem('some.key3', 'some.value3');
		service.setItem('some.key4', 'some.value4');

		await service.close();

		service.setItem('some.key5', 'some.marker');

		const contents = readFileSync(storageFile).toString();
		assert.ok(contents.includes('some.value1'));
		assert.ok(!contents.includes('some.marker'));

		return service.close();
	});

	test('Closed before init', async function () {
		const storageFile = join(testDir, 'storage.json');
		writeFileSync(storageFile, '');

		const service = disposables.add(new FileStorage(URI.file(storageFile), SaveStrategy.DELAYED, logService, fileService));

		service.setItem('some.key1', 'some.value1');
		service.setItem('some.key2', 'some.value2');
		service.setItem('some.key3', 'some.value3');
		service.setItem('some.key4', 'some.value4');

		await service.close();

		const contents = readFileSync(storageFile).toString();
		assert.strictEqual(contents.length, 0);
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
