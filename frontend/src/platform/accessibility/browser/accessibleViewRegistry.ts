/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '../../../base/common/lifecycle.ts';
import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider } from './accessibleView.ts';
import { ContextKeyExpression } from '../../contextkey/common/contextkey.ts';
import { ServicesAccessor } from '../../instantiation/common/instantiation.ts';

export interface IAccessibleViewImplementation {
	type: AccessibleViewType;
	priority: number;
	name: string;
	/**
	 * @returns the provider or undefined if the view should not be shown
	 */
	getProvider: (accessor: ServicesAccessor) => AccessibleContentProvider | ExtensionContentProvider | undefined;
	when?: ContextKeyExpression | undefined;
}

export const AccessibleViewRegistry = new class AccessibleViewRegistry {
	_implementations: IAccessibleViewImplementation[] = [];

	register(implementation: IAccessibleViewImplementation): IDisposable {
		this._implementations.push(implementation);
		return {
			dispose: () => {
				const idx = this._implementations.indexOf(implementation);
				if (idx !== -1) {
					this._implementations.splice(idx, 1);
				}
			}
		};
	}

	getImplementations(): IAccessibleViewImplementation[] {
		return this._implementations;
	}
};

