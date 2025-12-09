/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { create } from './languageDetectionWebWorker.ts';
import { bootstrapWebWorker } from '../../../../base/common/worker/webWorkerBootstrap.ts';

bootstrapWebWorker(create);
