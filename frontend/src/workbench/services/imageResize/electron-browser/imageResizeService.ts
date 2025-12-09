/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IImageResizeService } from '../../../../platform/imageResize/common/imageResizeService.ts';
import { ImageResizeService } from '../../../../platform/imageResize/browser/imageResizeService.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';

registerSingleton(IImageResizeService, ImageResizeService, InstantiationType.Delayed);
