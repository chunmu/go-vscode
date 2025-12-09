/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.ts';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.ts';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.ts';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.ts';
import { InlineChatController } from '../browser/inlineChatController.ts';
import { AbstractInline1ChatAction, setHoldForSpeech } from '../browser/inlineChatActions.ts';
import { disposableTimeout } from '../../../../base/common/async.ts';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.ts';
import { ICommandService } from '../../../../platform/commands/common/commands.ts';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.ts';
import { StartVoiceChatAction, StopListeningAction, VOICE_KEY_HOLD_THRESHOLD } from '../../chat/electron-browser/actions/voiceChatActions.ts';
import { IChatExecuteActionContext } from '../../chat/browser/actions/chatExecuteActions.ts';
import { CTX_INLINE_CHAT_VISIBLE, InlineChatConfigKeys } from '../common/inlineChat.ts';
import { HasSpeechProvider, ISpeechService } from '../../speech/common/speechService.ts';
import { localize2 } from '../../../../nls.ts';
import { Action2 } from '../../../../platform/actions/common/actions.ts';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.ts';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.ts';

export class HoldToSpeak extends EditorAction2 {

	constructor() {
		super({
			id: 'inlineChat.holdForSpeech',
			category: AbstractInline1ChatAction.category,
			precondition: ContextKeyExpr.and(HasSpeechProvider, CTX_INLINE_CHAT_VISIBLE),
			title: localize2('holdForSpeech', "Hold for Speech"),
			keybinding: {
				when: EditorContextKeys.textInputFocus,
				weight: KeybindingWeight.WorkbenchContrib,
				primary: KeyMod.CtrlCmd | KeyCode.KeyI,
			},
		});
	}

	override runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: unknown[]) {
		const ctrl = InlineChatController.get(editor);
		if (ctrl) {
			holdForSpeech(accessor, ctrl, this);
		}
	}
}

function holdForSpeech(accessor: ServicesAccessor, ctrl: InlineChatController, action: Action2): void {

	const configService = accessor.get(IConfigurationService);
	const speechService = accessor.get(ISpeechService);
	const keybindingService = accessor.get(IKeybindingService);
	const commandService = accessor.get(ICommandService);

	// enabled or possible?
	if (!configService.getValue<boolean>(InlineChatConfigKeys.HoldToSpeech || !speechService.hasSpeechProvider)) {
		return;
	}

	const holdMode = keybindingService.enableKeybindingHoldMode(action.desc.id);
	if (!holdMode) {
		return;
	}
	let listening = false;
	const handle = disposableTimeout(() => {
		// start VOICE input
		commandService.executeCommand(StartVoiceChatAction.ID, { voice: { disableTimeout: true } } satisfies IChatExecuteActionContext);
		listening = true;
	}, VOICE_KEY_HOLD_THRESHOLD);

	holdMode.finally(() => {
		if (listening) {
			commandService.executeCommand(StopListeningAction.ID).finally(() => {
				ctrl.widget.chatWidget.acceptInput();
			});
		}
		handle.dispose();
	});
}

// make this accessible to the chat actions from the browser layer
setHoldForSpeech(holdForSpeech);
