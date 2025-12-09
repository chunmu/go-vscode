/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.ts';
import { assertType } from '../../../../base/common/types.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ITextModelService } from '../../../common/services/resolverService.ts';
import { IOutlineModelService } from './outlineModel.ts';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.ts';

CommandsRegistry.registerCommand('_executeDocumentSymbolProvider', async function (accessor, ...args) {
	const [resource] = args;
	assertType(URI.isUri(resource));

	const outlineService = accessor.get(IOutlineModelService);
	const modelService = accessor.get(ITextModelService);

	const reference = await modelService.createModelReference(resource);
	try {
		return (await outlineService.getOrCreate(reference.object.textEditorModel, CancellationToken.None)).getTopLevelSymbols();
	} finally {
		reference.dispose();
	}
});
