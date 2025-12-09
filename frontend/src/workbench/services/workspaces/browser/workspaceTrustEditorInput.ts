/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { ThemeIcon } from '../../../../base/common/themables.ts';
import { URI } from '../../../../base/common/uri.ts';
import { localize } from '../../../../nls.ts';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.ts';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.ts';
import { EditorInput } from '../../../common/editor/editorInput.ts';

const WorkspaceTrustEditorIcon = registerIcon('workspace-trust-editor-label-icon', Codicon.shield, localize('workspaceTrustEditorLabelIcon', 'Icon of the workspace trust editor label.'));

export class WorkspaceTrustEditorInput extends EditorInput {
	static readonly ID: string = 'workbench.input.workspaceTrust';

	override get capabilities(): EditorInputCapabilities {
		return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton;
	}

	override get typeId(): string {
		return WorkspaceTrustEditorInput.ID;
	}

	readonly resource: URI = URI.from({
		scheme: Schemas.vscodeWorkspaceTrust,
		path: `workspaceTrustEditor`
	});

	override matches(otherInput: EditorInput | IUntypedEditorInput): boolean {
		return super.matches(otherInput) || otherInput instanceof WorkspaceTrustEditorInput;
	}

	override getName(): string {
		return localize('workspaceTrustEditorInputName', "Workspace Trust");
	}

	override getIcon(): ThemeIcon {
		return WorkspaceTrustEditorIcon;
	}
}
