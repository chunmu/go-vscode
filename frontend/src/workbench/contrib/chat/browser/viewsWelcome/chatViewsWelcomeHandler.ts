/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MarkdownString } from '../../../../../base/common/htmlContent.ts';
import { IJSONSchema, TypeFromJsonSchema } from '../../../../../base/common/jsonSchema.ts';
import { ThemeIcon } from '../../../../../base/common/themables.ts';
import { localize } from '../../../../../nls.ts';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.ts';
import { ILogService } from '../../../../../platform/log/common/log.ts';
import { Registry } from '../../../../../platform/registry/common/platform.ts';
import { IWorkbenchContribution } from '../../../../common/contributions.ts';
import { checkProposedApiEnabled } from '../../../../services/extensions/common/extensions.ts';
import * as extensionsRegistry from '../../../../services/extensions/common/extensionsRegistry.ts';
import { ChatViewsWelcomeExtensions, IChatViewsWelcomeContributionRegistry, IChatViewsWelcomeDescriptor } from './chatViewsWelcome.ts';


const chatViewsWelcomeJsonSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['icon', 'title', 'contents', 'when'],
	properties: {
		icon: {
			type: 'string',
			description: localize('chatViewsWelcome.icon', 'The icon for the welcome message.'),
		},
		title: {
			type: 'string',
			description: localize('chatViewsWelcome.title', 'The title of the welcome message.'),
		},
		content: {
			type: 'string',
			description: localize('chatViewsWelcome.content', 'The content of the welcome message. The first command link will be rendered as a button.'),
		},
		when: {
			type: 'string',
			description: localize('chatViewsWelcome.when', 'Condition when the welcome message is shown.'),
		}
	}
} as const satisfies IJSONSchema;

type IRawChatViewsWelcomeContribution = TypeFromJsonSchema<typeof chatViewsWelcomeJsonSchema>;

const chatViewsWelcomeExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint<IRawChatViewsWelcomeContribution[]>({
	extensionPoint: 'chatViewsWelcome',
	jsonSchema: {
		description: localize('vscode.extension.contributes.chatViewsWelcome', 'Contributes a welcome message to a chat view'),
		type: 'array',
		items: chatViewsWelcomeJsonSchema,
	},
});

export class ChatViewsWelcomeHandler implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.chatViewsWelcomeHandler';

	constructor(
		@ILogService private readonly logService: ILogService,
	) {
		chatViewsWelcomeExtensionPoint.setHandler((extensions, delta) => {
			for (const extension of delta.added) {
				for (const providerDescriptor of extension.value) {
					checkProposedApiEnabled(extension.description, 'chatParticipantPrivate');

					const when = ContextKeyExpr.deserialize(providerDescriptor.when);
					if (!when) {
						this.logService.error(`Could not deserialize 'when' clause for chatViewsWelcome contribution: ${providerDescriptor.when}`);
						continue;
					}

					const descriptor: IChatViewsWelcomeDescriptor = {
						...providerDescriptor,
						when,
						icon: ThemeIcon.fromString(providerDescriptor.icon),
						content: new MarkdownString(providerDescriptor.content, { isTrusted: true }), // private API with command links
					};
					Registry.as<IChatViewsWelcomeContributionRegistry>(ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry).register(descriptor);
				}
			}
		});
	}
}
