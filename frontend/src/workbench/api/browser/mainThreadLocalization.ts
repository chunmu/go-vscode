/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MainContext, MainThreadLocalizationShape } from '../common/extHost.protocol.ts';
import { extHostNamedCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.ts';
import { URI, UriComponents } from '../../../base/common/uri.ts';
import { IFileService } from '../../../platform/files/common/files.ts';
import { Disposable } from '../../../base/common/lifecycle.ts';
import { ILanguagePackService } from '../../../platform/languagePacks/common/languagePacks.ts';

@extHostNamedCustomer(MainContext.MainThreadLocalization)
export class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {

	constructor(
		extHostContext: IExtHostContext,
		@IFileService private readonly fileService: IFileService,
		@ILanguagePackService private readonly languagePackService: ILanguagePackService
	) {
		super();
	}

	async $fetchBuiltInBundleUri(id: string, language: string): Promise<URI | undefined> {
		try {
			const uri = await this.languagePackService.getBuiltInExtensionTranslationsUri(id, language);
			return uri;
		} catch (e) {
			return undefined;
		}
	}

	async $fetchBundleContents(uriComponents: UriComponents): Promise<string> {
		const contents = await this.fileService.readFile(URI.revive(uriComponents));
		return contents.value.toString();
	}
}
