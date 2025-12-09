/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from '../../../../../base/common/color.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { Registry } from '../../../../../platform/registry/common/platform.ts';
import { Extensions, IColorRegistry } from '../../../../../platform/theme/common/colorRegistry.ts';

suite('ColorRegistry', () => {
	if (process.env.VSCODE_COLOR_REGISTRY_EXPORT) {
		test('exports', () => {
			const themingRegistry = Registry.as<IColorRegistry>(Extensions.ColorContribution);
			const colors = themingRegistry.getColors();
			const replacer = (_key: string, value: unknown) =>
				value instanceof Color ? Color.Format.CSS.formatHexA(value) : value;
			console.log(`#colors:${JSON.stringify(colors, replacer)}\n`);
		});
	}

	ensureNoDisposablesAreLeakedInTestSuite();
});
