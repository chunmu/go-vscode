/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.ts';
import { URI, UriComponents } from '../../../base/common/uri.ts';
import { ExtHostQuickDiffShape, IMainContext, MainContext, MainThreadQuickDiffShape } from './extHost.protocol.ts';
import { asPromise } from '../../../base/common/async.ts';
import { DocumentSelector } from './extHostTypeConverters.ts';
import { IURITransformer } from '../../../base/common/uriIpc.ts';
import { ExtensionIdentifier, IExtensionDescription } from '../../../platform/extensions/common/extensions.ts';

export class ExtHostQuickDiff implements ExtHostQuickDiffShape {
	private static handlePool: number = 0;

	private proxy: MainThreadQuickDiffShape;
	private providers: Map<number, vscode.QuickDiffProvider> = new Map();

	constructor(
		mainContext: IMainContext,
		private readonly uriTransformer: IURITransformer | undefined
	) {
		this.proxy = mainContext.getProxy(MainContext.MainThreadQuickDiff);
	}

	$provideOriginalResource(handle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null> {
		const uri = URI.revive(uriComponents);
		const provider = this.providers.get(handle);

		if (!provider) {
			return Promise.resolve(null);
		}

		return asPromise(() => provider.provideOriginalResource!(uri, token))
			.then<UriComponents | null>(r => r || null);
	}

	registerQuickDiffProvider(extension: IExtensionDescription, selector: vscode.DocumentSelector, quickDiffProvider: vscode.QuickDiffProvider, id: string, label: string, rootUri?: vscode.Uri): vscode.Disposable {
		const handle = ExtHostQuickDiff.handlePool++;
		this.providers.set(handle, quickDiffProvider);

		const extensionId = ExtensionIdentifier.toKey(extension.identifier);
		this.proxy.$registerQuickDiffProvider(handle, DocumentSelector.from(selector, this.uriTransformer), `${extensionId}.${id}`, label, rootUri);
		return {
			dispose: () => {
				this.proxy.$unregisterQuickDiffProvider(handle);
				this.providers.delete(handle);
			}
		};
	}
}
