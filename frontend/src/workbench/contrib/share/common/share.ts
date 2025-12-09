/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { IDisposable } from '../../../../base/common/lifecycle.ts';
import { URI } from '../../../../base/common/uri.ts';
import { Selection } from '../../../../editor/common/core/selection.ts';
import { LanguageSelector } from '../../../../editor/common/languageSelector.ts';
import { ISubmenuItem } from '../../../../platform/actions/common/actions.ts';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.ts';

export interface IShareableItem {
	resourceUri: URI;
	selection?: Selection;
}

export interface IShareProvider {
	readonly id: string;
	readonly label: string;
	readonly priority: number;
	readonly selector: LanguageSelector;
	prepareShare?(item: IShareableItem, token: CancellationToken): Thenable<boolean | undefined>;
	provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}

export const IShareService = createDecorator<IShareService>('shareService');
export interface IShareService {
	_serviceBrand: undefined;

	registerShareProvider(provider: IShareProvider): IDisposable;
	getShareActions(): ISubmenuItem[];
	provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}
