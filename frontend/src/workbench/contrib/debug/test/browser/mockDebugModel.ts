/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.ts';
import { upcastPartial } from '../../../../../base/test/common/mock.ts';
import { NullLogService } from '../../../../../platform/log/common/log.ts';
import { UriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentityService.ts';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.ts';
import { TestFileService, TestStorageService } from '../../../../test/common/workbenchTestServices.ts';
import { DebugModel } from '../../common/debugModel.ts';
import { MockDebugStorage } from '../common/mockDebug.ts';

const fileService = new TestFileService();
export const mockUriIdentityService = new UriIdentityService(fileService);

export function createMockDebugModel(disposable: Pick<DisposableStore, 'add'>): DebugModel {
	const storage = disposable.add(new TestStorageService());
	const debugStorage = disposable.add(new MockDebugStorage(storage));
	return disposable.add(new DebugModel(debugStorage, upcastPartial<ITextFileService>({ isDirty: (e: unknown) => false }), mockUriIdentityService, new NullLogService()));
}
