/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { Progress } from '../../../../../platform/progress/common/progress.ts';
import { ITextQuery, QueryType } from '../../common/search.ts';
import { ProviderResult, TextSearchComplete2, TextSearchProviderOptions, TextSearchProvider2, TextSearchQuery2, TextSearchResult2 } from '../../common/searchExtTypes.ts';
import { NativeTextSearchManager } from '../../node/textSearchManager.ts';

suite('NativeTextSearchManager', () => {
	test('fixes encoding', async () => {
		let correctEncoding = false;
		const provider: TextSearchProvider2 = {
			provideTextSearchResults(query: TextSearchQuery2, options: TextSearchProviderOptions, progress: Progress<TextSearchResult2>, token: CancellationToken): ProviderResult<TextSearchComplete2> {
				correctEncoding = options.folderOptions[0].encoding === 'windows-1252';

				return null;
			}
		};

		const query: ITextQuery = {
			type: QueryType.Text,
			contentPattern: {
				pattern: 'a'
			},
			folderQueries: [{
				folder: URI.file('/some/folder'),
				fileEncoding: 'windows1252'
			}]
		};

		const m = new NativeTextSearchManager(query, provider);
		await m.search(() => { }, CancellationToken.None);

		assert.ok(correctEncoding);
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
