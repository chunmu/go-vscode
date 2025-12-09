/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { ISearchService } from '../common/search.ts';
import { SearchService } from '../common/searchService.ts';

registerSingleton(ISearchService, SearchService, InstantiationType.Delayed);
