/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.ts';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.ts';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.ts';
import { EditorOption } from '../../../../editor/common/config/editorOptions.ts';
import { AccessibilityHelpNLS } from '../../../../editor/common/standaloneStrings.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.ts';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { AccessibilityHelpAction } from './accessibleViewActions.ts';
import { ChatContextKeys } from '../../chat/common/chatContextKeys.ts';
import { CommentAccessibilityHelpNLS } from '../../comments/browser/commentsAccessibility.ts';
import { CommentContextKeys } from '../../comments/common/commentContextKeys.ts';
import { NEW_UNTITLED_FILE_COMMAND_ID } from '../../files/browser/fileConstants.ts';
import { IAccessibleViewService, IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.ts';
import { AccessibilityVerbositySettingId } from './accessibilityConfiguration.ts';
import { ctxHasEditorModification, ctxHasRequestInProgress } from '../../chat/browser/chatEditing/chatEditingEditorContextKeys.ts';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';

export class EditorAccessibilityHelpContribution extends Disposable {
	static ID: 'editorAccessibilityHelpContribution';
	constructor() {
		super();
		this._register(AccessibilityHelpAction.addImplementation(90, 'editor', async accessor => {
			const codeEditorService = accessor.get(ICodeEditorService);
			const accessibleViewService = accessor.get(IAccessibleViewService);
			const instantiationService = accessor.get(IInstantiationService);
			const commandService = accessor.get(ICommandService);
			let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
			if (!codeEditor) {
				await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
				codeEditor = codeEditorService.getActiveCodeEditor()!;
			}
			accessibleViewService.show(instantiationService.createInstance(EditorAccessibilityHelpProvider, codeEditor));
		}));
	}
}

class EditorAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
	id = AccessibleViewProviderId.Editor;
	onClose() {
		this._editor.focus();
	}
	options: IAccessibleViewOptions = { type: AccessibleViewType.Help, readMoreUrl: 'https://go.microsoft.com/fwlink/?linkid=851010' };
	verbositySettingKey = AccessibilityVerbositySettingId.Editor;
	constructor(
		private readonly _editor: ICodeEditor,
		@IKeybindingService private readonly _keybindingService: IKeybindingService,
		@IContextKeyService private readonly _contextKeyService: IContextKeyService,
		@IAccessibilityService private readonly accessibilityService: IAccessibilityService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
	) {
		super();
	}

	provideContent(): string {
		const options = this._editor.getOptions();
		const content = [];

		if (options.get(EditorOption.inDiffEditor)) {
			if (options.get(EditorOption.readOnly)) {
				content.push(AccessibilityHelpNLS.readonlyDiffEditor);
			} else {
				content.push(AccessibilityHelpNLS.editableDiffEditor);
			}
		} else {
			if (options.get(EditorOption.readOnly)) {
				content.push(AccessibilityHelpNLS.readonlyEditor);
			} else {
				content.push(AccessibilityHelpNLS.editableEditor);
			}
		}
		if (this.accessibilityService.isScreenReaderOptimized() && this._configurationService.getValue('accessibility.windowTitleOptimized')) {
			content.push(AccessibilityHelpNLS.defaultWindowTitleIncludesEditorState);
		} else {
			content.push(AccessibilityHelpNLS.defaultWindowTitleExcludingEditorState);
		}
		content.push(AccessibilityHelpNLS.toolbar);

		const chatEditInfo = getChatEditInfo(this._keybindingService, this._contextKeyService, this._editor);
		if (chatEditInfo) {
			content.push(chatEditInfo);
		}

		content.push(AccessibilityHelpNLS.listSignalSounds);
		content.push(AccessibilityHelpNLS.listAlerts);


		const chatCommandInfo = getChatCommandInfo(this._keybindingService, this._contextKeyService);
		if (chatCommandInfo) {
			content.push(chatCommandInfo);
		}

		const commentCommandInfo = getCommentCommandInfo(this._keybindingService, this._contextKeyService, this._editor);
		if (commentCommandInfo) {
			content.push(commentCommandInfo);
		}

		content.push(AccessibilityHelpNLS.suggestActions);
		content.push(AccessibilityHelpNLS.acceptSuggestAction);
		content.push(AccessibilityHelpNLS.toggleSuggestionFocus);

		if (options.get(EditorOption.stickyScroll).enabled) {
			content.push(AccessibilityHelpNLS.stickScroll);
		}

		if (options.get(EditorOption.tabFocusMode)) {
			content.push(AccessibilityHelpNLS.tabFocusModeOnMsg);
		} else {
			content.push(AccessibilityHelpNLS.tabFocusModeOffMsg);
		}
		content.push(AccessibilityHelpNLS.codeFolding);
		content.push(AccessibilityHelpNLS.intellisense);
		content.push(AccessibilityHelpNLS.showOrFocusHover);
		content.push(AccessibilityHelpNLS.goToSymbol);
		content.push(AccessibilityHelpNLS.startDebugging);
		content.push(AccessibilityHelpNLS.setBreakpoint);
		content.push(AccessibilityHelpNLS.debugExecuteSelection);
		content.push(AccessibilityHelpNLS.addToWatch);
		return content.join('\n');
	}
}

export function getCommentCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, editor: ICodeEditor): string | undefined {
	const editorContext = contextKeyService.getContext(editor.getDomNode()!);
	if (editorContext.getValue<boolean>(CommentContextKeys.activeEditorHasCommentingRange.key)) {
		return [CommentAccessibilityHelpNLS.intro, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.nextCommentThread, CommentAccessibilityHelpNLS.previousCommentThread, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join('\n');
	}
	return;
}

export function getChatCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService): string | undefined {
	if (ChatContextKeys.enabled.getValue(contextKeyService)) {
		return [AccessibilityHelpNLS.quickChat, AccessibilityHelpNLS.startInlineChat].join('\n');
	}
	return;
}

export function getChatEditInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, editor: ICodeEditor): string | undefined {
	const editorContext = contextKeyService.getContext(editor.getDomNode()!);
	if (editorContext.getValue<boolean>(ctxHasEditorModification.key)) {
		return AccessibilityHelpNLS.chatEditorModification + '\n' + AccessibilityHelpNLS.chatEditActions;
	} else if (editorContext.getValue<boolean>(ctxHasRequestInProgress.key)) {
		return AccessibilityHelpNLS.chatEditorRequestInProgress;
	}
	return;
}
