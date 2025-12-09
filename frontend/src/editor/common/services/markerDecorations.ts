/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextModel, IModelDecoration } from '../model.ts';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.ts';
import { IMarker } from '../../../platform/markers/common/markers.ts';
import { Event } from '../../../base/common/event.ts';
import { Range } from '../core/range.ts';
import { URI } from '../../../base/common/uri.ts';
import { IDisposable } from '../../../base/common/lifecycle.ts';

export const IMarkerDecorationsService = createDecorator<IMarkerDecorationsService>('markerDecorationsService');

export interface IMarkerDecorationsService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeMarker: Event<ITextModel>;

	getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;

	getLiveMarkers(uri: URI): [Range, IMarker][];

	addMarkerSuppression(uri: URI, range: Range): IDisposable;
}
