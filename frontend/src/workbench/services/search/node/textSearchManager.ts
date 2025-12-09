/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toCanonicalName } from '../../textfile/common/encoding.ts';
import * as pfs from '../../../../base/node/pfs.ts';
import { ITextQuery, ITextSearchStats } from '../common/search.ts';
import { TextSearchProvider2 } from '../common/searchExtTypes.ts';
import { TextSearchManager } from '../common/textSearchManager.ts';

export class NativeTextSearchManager extends TextSearchManager {

	constructor(query: ITextQuery, provider: TextSearchProvider2, _pfs: typeof pfs = pfs, processType: ITextSearchStats['type'] = 'searchProcess') {
		super({ query, provider }, {
			readdir: resource => _pfs.Promises.readdir(resource.fsPath),
			toCanonicalName: name => toCanonicalName(name)
		}, processType);
	}
}
