/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FastDomNode } from '../../../../base/browser/fastDomNode.ts';
import { Position } from '../../../common/core/position.ts';
import { IEditorAriaOptions } from '../../editorBrowser.ts';
import { ViewPart } from '../../view/viewPart.ts';

export abstract class AbstractEditContext extends ViewPart {
	abstract domNode: FastDomNode<HTMLElement>;
	abstract focus(): void;
	abstract isFocused(): boolean;
	abstract refreshFocusState(): void;
	abstract setAriaOptions(options: IEditorAriaOptions): void;
	abstract getLastRenderData(): Position | null;
	abstract writeScreenReaderContent(reason: string): void;
}
