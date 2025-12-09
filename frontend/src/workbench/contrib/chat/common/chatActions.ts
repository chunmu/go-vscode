/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MarshalledId } from '../../../../base/common/marshallingIds.ts';
import { URI } from '../../../../base/common/uri.ts';

export interface IChatViewTitleActionContext {
	readonly $mid: MarshalledId.ChatViewContext;
	readonly sessionResource: URI;
}

export function isChatViewTitleActionContext(obj: unknown): obj is IChatViewTitleActionContext {
	return !!obj &&
		URI.isUri((obj as IChatViewTitleActionContext).sessionResource)
		&& (obj as IChatViewTitleActionContext).$mid === MarshalledId.ChatViewContext;
}
