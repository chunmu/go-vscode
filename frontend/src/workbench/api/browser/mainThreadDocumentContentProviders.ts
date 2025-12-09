/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { onUnexpectedError } from '../../../base/common/errors.ts';
import { dispose, DisposableMap } from '../../../base/common/lifecycle.ts';
import { URI, UriComponents } from '../../../base/common/uri.ts';
import { EditOperation } from '../../../editor/common/core/editOperation.ts';
import { Range } from '../../../editor/common/core/range.ts';
import { ITextModel } from '../../../editor/common/model.ts';
import { IEditorWorkerService } from '../../../editor/common/services/editorWorker.ts';
import { IModelService } from '../../../editor/common/services/model.ts';
import { ILanguageService } from '../../../editor/common/languages/language.ts';
import { ITextModelService } from '../../../editor/common/services/resolverService.ts';
import { extHostNamedCustomer, IExtHostContext } from '../../services/extensions/common/extHostCustomers.ts';
import { ExtHostContext, ExtHostDocumentContentProvidersShape, MainContext, MainThreadDocumentContentProvidersShape } from '../common/extHost.protocol.ts';
import { CancellationTokenSource } from '../../../base/common/cancellation.ts';

@extHostNamedCustomer(MainContext.MainThreadDocumentContentProviders)
export class MainThreadDocumentContentProviders implements MainThreadDocumentContentProvidersShape {

	private readonly _resourceContentProvider = new DisposableMap<number>();
	private readonly _pendingUpdate = new Map<string, CancellationTokenSource>();
	private readonly _proxy: ExtHostDocumentContentProvidersShape;

	constructor(
		extHostContext: IExtHostContext,
		@ITextModelService private readonly _textModelResolverService: ITextModelService,
		@ILanguageService private readonly _languageService: ILanguageService,
		@IModelService private readonly _modelService: IModelService,
		@IEditorWorkerService private readonly _editorWorkerService: IEditorWorkerService
	) {
		this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentContentProviders);
	}

	dispose(): void {
		this._resourceContentProvider.dispose();
		dispose(this._pendingUpdate.values());
	}

	$registerTextContentProvider(handle: number, scheme: string): void {
		const registration = this._textModelResolverService.registerTextModelContentProvider(scheme, {
			provideTextContent: (uri: URI): Promise<ITextModel | null> => {
				return this._proxy.$provideTextDocumentContent(handle, uri).then(value => {
					if (typeof value === 'string') {
						const firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
						const languageSelection = this._languageService.createByFilepathOrFirstLine(uri, firstLineText);
						return this._modelService.createModel(value, languageSelection, uri);
					}
					return null;
				});
			}
		});
		this._resourceContentProvider.set(handle, registration);
	}

	$unregisterTextContentProvider(handle: number): void {
		this._resourceContentProvider.deleteAndDispose(handle);
	}

	async $onVirtualDocumentChange(uri: UriComponents, value: string): Promise<void> {
		const model = this._modelService.getModel(URI.revive(uri));
		if (!model) {
			return;
		}

		// cancel and dispose an existing update
		const pending = this._pendingUpdate.get(model.id);
		pending?.cancel();

		// create and keep update token
		const myToken = new CancellationTokenSource();
		this._pendingUpdate.set(model.id, myToken);

		try {
			const edits = await this._editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: value, range: model.getFullModelRange() }]);

			// remove token
			this._pendingUpdate.delete(model.id);

			if (myToken.token.isCancellationRequested) {
				// ignore this
				return;
			}
			if (edits && edits.length > 0) {
				// use the evil-edit as these models show in readonly-editor only
				model.applyEdits(edits.map(edit => EditOperation.replace(Range.lift(edit.range), edit.text)));
			}
		} catch (error) {
			onUnexpectedError(error);
		}
	}
}
