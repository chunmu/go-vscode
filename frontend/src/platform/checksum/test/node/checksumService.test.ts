/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { FileAccess, Schemas } from '../../../../base/common/network.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.ts';
import { ChecksumService } from '../../node/checksumService.ts';
import { IFileService } from '../../../files/common/files.ts';
import { FileService } from '../../../files/common/fileService.ts';
import { DiskFileSystemProvider } from '../../../files/node/diskFileSystemProvider.ts';
import { NullLogService } from '../../../log/common/log.ts';

suite('Checksum Service', () => {

	let diskFileSystemProvider: DiskFileSystemProvider;
	let fileService: IFileService;

	setup(() => {
		const logService = new NullLogService();
		fileService = new FileService(logService);

		diskFileSystemProvider = new DiskFileSystemProvider(logService);
		fileService.registerProvider(Schemas.file, diskFileSystemProvider);
	});

	teardown(() => {
		diskFileSystemProvider.dispose();
		fileService.dispose();
	});

	test('checksum', async () => {
		const checksumService = new ChecksumService(fileService);

		const checksum = await checksumService.checksum(URI.file(FileAccess.asFileUri('vs/platform/checksum/test/node/fixtures/lorem.txt').fsPath));
		assert.ok(checksum === 'd/9bMU0ydNCmc/hg8ItWeiLT/ePnf7gyPRQVGpd6tRI' || checksum === 'eJeeTIS0dzi8MZY+nHhjPBVtNbmGqxfVvgEOB4sqVIc'); // depends on line endings git config
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
