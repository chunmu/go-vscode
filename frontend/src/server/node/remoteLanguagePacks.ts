/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileAccess } from '../../base/common/network.ts';
import { join } from '../../base/common/path.ts';
import type { INLSConfiguration } from '../../nls.ts';
import { resolveNLSConfiguration } from '../../base/node/nls.ts';
import { Promises } from '../../base/node/pfs.ts';
import product from '../../platform/product/common/product.ts';

const nlsMetadataPath = join(FileAccess.asFileUri('').fsPath);
const defaultMessagesFile = join(nlsMetadataPath, 'nls.messages.json');
const nlsConfigurationCache = new Map<string, Promise<INLSConfiguration>>();

export async function getNLSConfiguration(language: string, userDataPath: string): Promise<INLSConfiguration> {
	if (!product.commit || !(await Promises.exists(defaultMessagesFile))) {
		return {
			userLocale: 'en',
			osLocale: 'en',
			resolvedLanguage: 'en',
			defaultMessagesFile,

			// NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
			locale: 'en',
			availableLanguages: {}
		};
	}

	const cacheKey = `${language}||${userDataPath}`;
	let result = nlsConfigurationCache.get(cacheKey);
	if (!result) {
		result = resolveNLSConfiguration({ userLocale: language, osLocale: language, commit: product.commit, userDataPath, nlsMetadataPath });
		nlsConfigurationCache.set(cacheKey, result);
	}

	return result;
}
