/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.ts';
import { IRange } from '../../../common/core/range.ts';
import { DiffAlgorithmName, IEditorWorkerService, IUnicodeHighlightsResult } from '../../../common/services/editorWorker.ts';
import { TextEdit, IInplaceReplaceSupportResult, IColorInformation } from '../../../common/languages.ts';
import { IDocumentDiff, IDocumentDiffProviderOptions } from '../../../common/diff/documentDiffProvider.ts';
import { IChange } from '../../../common/diff/legacyLinesDiffComputer.ts';
import { SectionHeader } from '../../../common/services/findSectionHeaders.ts';
import { StringEdit } from '../../../common/core/edits/stringEdit.ts';

export class TestEditorWorkerService implements IEditorWorkerService {

	declare readonly _serviceBrand: undefined;

	canComputeUnicodeHighlights(uri: URI): boolean { return false; }
	async computedUnicodeHighlights(uri: URI): Promise<IUnicodeHighlightsResult> { return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 }; }
	async computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null> { return null; }
	canComputeDirtyDiff(original: URI, modified: URI): boolean { return false; }
	async computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null> { return null; }
	async computeMoreMinimalEdits(resource: URI, edits: TextEdit[] | null | undefined): Promise<TextEdit[] | undefined> { return undefined; }
	async computeHumanReadableDiff(resource: URI, edits: TextEdit[] | null | undefined): Promise<TextEdit[] | undefined> { return undefined; }
	canComputeWordRanges(resource: URI): boolean { return false; }
	async computeWordRanges(resource: URI, range: IRange): Promise<{ [word: string]: IRange[] } | null> { return null; }
	canNavigateValueSet(resource: URI): boolean { return false; }
	async navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<IInplaceReplaceSupportResult | null> { return null; }
	async findSectionHeaders(uri: URI): Promise<SectionHeader[]> { return []; }
	async computeDefaultDocumentColors(uri: URI): Promise<IColorInformation[] | null> { return null; }

	computeStringEditFromDiff(original: string, modified: string, options: { maxComputationTimeMs: number }, algorithm: DiffAlgorithmName): Promise<StringEdit> {
		throw new Error('Method not implemented.');
	}
}
