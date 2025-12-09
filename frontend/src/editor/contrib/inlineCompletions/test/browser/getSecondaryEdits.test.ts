/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { Position } from '../../../../common/core/position.ts';
import { getSecondaryEdits } from '../../browser/model/inlineCompletionsModel.ts';
import { TextEdit, TextReplacement } from '../../../../common/core/edits/textEdit.ts';
import { createTextModel } from '../../../../test/common/testTextModel.ts';
import { Range } from '../../../../common/core/range.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { isDefined } from '../../../../../base/common/types.ts';

suite('getSecondaryEdits', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('basic', async function () {

		const textModel = createTextModel([
			'function fib(',
			'function fib('
		].join('\n'));
		const positions = [
			new Position(1, 14),
			new Position(2, 14)
		];
		const primaryEdit = new TextReplacement(new Range(1, 1, 1, 14), 'function fib() {');
		const secondaryEdits = getSecondaryEdits(textModel, positions, primaryEdit);
		assert.deepStrictEqual(secondaryEdits, [new TextReplacement(
			new Range(2, 14, 2, 14),
			') {'
		)]);
		textModel.dispose();
	});

	test('cursor not on same line as primary edit 1', async function () {

		const textModel = createTextModel([
			'function fib(',
			'',
			'function fib(',
			''
		].join('\n'));
		const positions = [
			new Position(2, 1),
			new Position(4, 1)
		];
		const primaryEdit = new TextReplacement(new Range(1, 1, 2, 1), [
			'function fib() {',
			'	return 0;',
			'}'
		].join('\n'));
		const secondaryEdits = getSecondaryEdits(textModel, positions, primaryEdit);
		assert.deepStrictEqual(TextEdit.fromParallelReplacementsUnsorted(secondaryEdits.filter(isDefined)).toString(textModel.getValue()), '...ction fib(❰\n↦) {\n\t... 0;\n}❱');
		textModel.dispose();
	});

	test('cursor not on same line as primary edit 2', async function () {

		const textModel = createTextModel([
			'class A {',
			'',
			'class B {',
			'',
			'function f() {}'
		].join('\n'));
		const positions = [
			new Position(2, 1),
			new Position(4, 1)
		];
		const primaryEdit = new TextReplacement(new Range(1, 1, 2, 1), [
			'class A {',
			'	public x: number = 0;',
			'   public y: number = 0;',
			'}'
		].join('\n'));
		const secondaryEdits = getSecondaryEdits(textModel, positions, primaryEdit);
		assert.deepStrictEqual(secondaryEdits, [new TextReplacement(
			new Range(4, 1, 4, 1), [
				'	public x: number = 0;',
				'   public y: number = 0;',
				'}'
			].join('\n')
		)]);
		textModel.dispose();
	});
});
