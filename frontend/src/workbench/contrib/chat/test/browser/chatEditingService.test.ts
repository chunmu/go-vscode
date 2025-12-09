/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { CancellationToken } from '../../../../../base/common/cancellation.ts';
import { Disposable, DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.ts';
import { waitForState } from '../../../../../base/common/observable.ts';
import { isEqual } from '../../../../../base/common/resources.ts';
import { assertType } from '../../../../../base/common/types.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { mock } from '../../../../../base/test/common/mock.ts';
import { runWithFakedTimers } from '../../../../../base/test/common/timeTravelScheduler.ts';
import { assertThrowsAsync, ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { EditOperation } from '../../../../../editor/common/core/editOperation.ts';
import { Position } from '../../../../../editor/common/core/position.ts';
import { Range } from '../../../../../editor/common/core/range.ts';
import { TextEdit } from '../../../../../editor/common/languages.ts';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.ts';
import { IModelService } from '../../../../../editor/common/services/model.ts';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.ts';
import { SyncDescriptor } from '../../../../../platform/instantiation/common/descriptors.ts';
import { ServiceCollection } from '../../../../../platform/instantiation/common/serviceCollection.ts';
import { IWorkbenchAssignmentService } from '../../../../services/assignment/common/assignmentService.ts';
import { NullWorkbenchAssignmentService } from '../../../../services/assignment/test/common/nullAssignmentService.ts';
import { nullExtensionDescription } from '../../../../services/extensions/common/extensions.ts';
import { workbenchInstantiationService } from '../../../../test/browser/workbenchTestServices.ts';
import { TestWorkerService } from '../../../inlineChat/test/browser/testWorkerService.ts';
import { IMcpService } from '../../../mcp/common/mcpTypes.ts';
import { TestMcpService } from '../../../mcp/test/common/testMcpService.ts';
import { IMultiDiffSourceResolver, IMultiDiffSourceResolverService } from '../../../multiDiffEditor/browser/multiDiffSourceResolverService.ts';
import { NotebookTextModel } from '../../../notebook/common/model/notebookTextModel.ts';
import { INotebookService } from '../../../notebook/common/notebookService.ts';
import { ChatEditingService } from '../../browser/chatEditing/chatEditingServiceImpl.ts';
import { ChatSessionsService } from '../../browser/chatSessions.contribution.ts';
import { ChatAgentService, IChatAgentData, IChatAgentImplementation, IChatAgentService } from '../../common/chatAgents.ts';
import { ChatEditingSessionState, IChatEditingService, IChatEditingSession, ModifiedFileEntryState } from '../../common/chatEditingService.ts';
import { ChatModel } from '../../common/chatModel.ts';
import { IChatService } from '../../common/chatService.ts';
import { ChatService } from '../../common/chatServiceImpl.ts';
import { IChatSessionsService } from '../../common/chatSessionsService.ts';
import { IChatSlashCommandService } from '../../common/chatSlashCommands.ts';
import { ChatTransferService, IChatTransferService } from '../../common/chatTransferService.ts';
import { IChatVariablesService } from '../../common/chatVariables.ts';
import { ChatAgentLocation, ChatModeKind } from '../../common/constants.ts';
import { ILanguageModelsService } from '../../common/languageModels.ts';
import { NullLanguageModelsService } from '../common/languageModels.ts';
import { MockChatVariablesService } from '../common/mockChatVariables.ts';

function getAgentData(id: string): IChatAgentData {
	return {
		name: id,
		id: id,
		extensionId: nullExtensionDescription.identifier,
		extensionVersion: undefined,
		extensionPublisherId: '',
		publisherDisplayName: '',
		extensionDisplayName: '',
		locations: [ChatAgentLocation.Chat],
		modes: [ChatModeKind.Ask],
		metadata: {},
		slashCommands: [],
		disambiguation: [],
	};
}

suite('ChatEditingService', function () {

	const store = new DisposableStore();
	let editingService: ChatEditingService;
	let chatService: IChatService;
	let textModelService: ITextModelService;

	setup(function () {
		const collection = new ServiceCollection();
		collection.set(IWorkbenchAssignmentService, new NullWorkbenchAssignmentService());
		collection.set(IChatAgentService, new SyncDescriptor(ChatAgentService));
		collection.set(IChatVariablesService, new MockChatVariablesService());
		collection.set(IChatSlashCommandService, new class extends mock<IChatSlashCommandService>() { });
		collection.set(IChatTransferService, new SyncDescriptor(ChatTransferService));
		collection.set(IChatSessionsService, new SyncDescriptor(ChatSessionsService));
		collection.set(IChatEditingService, new SyncDescriptor(ChatEditingService));
		collection.set(IEditorWorkerService, new SyncDescriptor(TestWorkerService));
		collection.set(IChatService, new SyncDescriptor(ChatService));
		collection.set(IMcpService, new TestMcpService());
		collection.set(ILanguageModelsService, new SyncDescriptor(NullLanguageModelsService));
		collection.set(IMultiDiffSourceResolverService, new class extends mock<IMultiDiffSourceResolverService>() {
			override registerResolver(_resolver: IMultiDiffSourceResolver): IDisposable {
				return Disposable.None;
			}
		});
		collection.set(INotebookService, new class extends mock<INotebookService>() {
			override getNotebookTextModel(_uri: URI): NotebookTextModel | undefined {
				return undefined;
			}
			override hasSupportedNotebooks(_resource: URI): boolean {
				return false;
			}
		});
		const insta = store.add(store.add(workbenchInstantiationService(undefined, store)).createChild(collection));
		store.add(insta.get(IEditorWorkerService) as TestWorkerService);
		const value = insta.get(IChatEditingService);
		assert.ok(value instanceof ChatEditingService);
		editingService = value;

		chatService = insta.get(IChatService);

		store.add(insta.get(IChatSessionsService) as ChatSessionsService); // Needs to be disposed in between test runs to clear extensionPoint contribution
		store.add(chatService as ChatService);

		const chatAgentService = insta.get(IChatAgentService);

		const agent: IChatAgentImplementation = {
			async invoke(request, progress, history, token) {
				return {};
			},
		};
		store.add(chatAgentService.registerAgent('testAgent', { ...getAgentData('testAgent'), isDefault: true }));
		store.add(chatAgentService.registerAgentImplementation('testAgent', agent));

		textModelService = insta.get(ITextModelService);

		const modelService = insta.get(IModelService);

		store.add(textModelService.registerTextModelContentProvider('test', {
			async provideTextContent(resource) {
				return store.add(modelService.createModel(resource.path.repeat(10), null, resource, false));
			},
		}));
	});

	teardown(async () => {
		store.clear();
		await chatService.waitForModelDisposals();
	});

	ensureNoDisposablesAreLeakedInTestSuite();

	test('create session', async function () {
		assert.ok(editingService);

		const modelRef = chatService.startSession(ChatAgentLocation.EditorInline, CancellationToken.None);
		const model = modelRef.object as ChatModel;
		const session = editingService.createEditingSession(model, true);

		assert.strictEqual(session.chatSessionResource.toString(), model.sessionResource.toString());
		assert.strictEqual(session.isGlobalEditingSession, true);

		await assertThrowsAsync(async () => {
			// DUPE not allowed
			editingService.createEditingSession(model);
		});

		session.dispose();
		modelRef.dispose();
	});

	test('create session, file entry & isCurrentlyBeingModifiedBy', async function () {
		assert.ok(editingService);

		const uri = URI.from({ scheme: 'test', path: 'HelloWorld' });

		const modelRef = chatService.startSession(ChatAgentLocation.Chat, CancellationToken.None);
		const model = modelRef.object as ChatModel;
		const session = model.editingSession;
		if (!session) {
			assert.fail('session not created');
		}

		const chatRequest = model?.addRequest({ text: '', parts: [] }, { variables: [] }, 0);
		assertType(chatRequest.response);
		chatRequest.response.updateContent({ kind: 'textEdit', uri, edits: [], done: false });
		chatRequest.response.updateContent({ kind: 'textEdit', uri, edits: [{ range: new Range(1, 1, 1, 1), text: 'FarBoo\n' }], done: false });
		chatRequest.response.updateContent({ kind: 'textEdit', uri, edits: [], done: true });

		const entry = await waitForState(session.entries.map(value => value.find(a => isEqual(a.modifiedURI, uri))));

		assert.ok(isEqual(entry.modifiedURI, uri));

		await waitForState(entry.isCurrentlyBeingModifiedBy.map(value => value === chatRequest.response));
		assert.ok(entry.isCurrentlyBeingModifiedBy.get()?.responseModel === chatRequest.response);

		const unset = waitForState(entry.isCurrentlyBeingModifiedBy.map(res => res === undefined));

		chatRequest.response.complete();

		await unset;

		await entry.reject();

		modelRef.dispose();
	});

	async function idleAfterEdit(session: IChatEditingSession, model: ChatModel, uri: URI, edits: TextEdit[]) {
		const isStreaming = waitForState(session.state.map(s => s === ChatEditingSessionState.StreamingEdits), Boolean);

		const chatRequest = model.addRequest({ text: '', parts: [] }, { variables: [] }, 0);
		assertType(chatRequest.response);

		chatRequest.response.updateContent({ kind: 'textEdit', uri, edits, done: true });

		const entry = await waitForState(session.entries.map(value => value.find(a => isEqual(a.modifiedURI, uri))));

		assert.ok(isEqual(entry.modifiedURI, uri));

		chatRequest.response.complete();

		await isStreaming;

		const isIdle = waitForState(session.state.map(s => s === ChatEditingSessionState.Idle), Boolean);
		await isIdle;

		return entry;
	}

	test('mirror typing outside -> accept', async function () {
		return runWithFakedTimers({}, async () => {
			assert.ok(editingService);

			const uri = URI.from({ scheme: 'test', path: 'abc\n' });

			const modelRef = store.add(chatService.startSession(ChatAgentLocation.Chat, CancellationToken.None));
			const model = modelRef.object as ChatModel;
			const session = model.editingSession;
			assertType(session, 'session not created');

			const entry = await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'FarBoo\n' }]);
			const original = store.add(await textModelService.createModelReference(entry.originalURI)).object.textEditorModel;
			const modified = store.add(await textModelService.createModelReference(entry.modifiedURI)).object.textEditorModel;

			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Modified);

			assert.strictEqual(original.getValue(), 'abc\n'.repeat(10));
			assert.strictEqual(modified.getValue(), 'FarBoo\n' + 'abc\n'.repeat(10));

			modified.pushEditOperations(null, [EditOperation.insert(new Position(3, 1), 'USER_TYPE\n')], () => null);

			assert.ok(modified.getValue().includes('USER_TYPE'));
			assert.ok(original.getValue().includes('USER_TYPE'));

			await entry.accept();
			assert.strictEqual(modified.getValue(), original.getValue());
			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Accepted);

			assert.ok(modified.getValue().includes('FarBoo'));
			assert.ok(original.getValue().includes('FarBoo'));
		});
	});

	test('mirror typing outside -> reject', async function () {
		return runWithFakedTimers({}, async () => {
			assert.ok(editingService);

			const uri = URI.from({ scheme: 'test', path: 'abc\n' });

			const modelRef = store.add(chatService.startSession(ChatAgentLocation.Chat, CancellationToken.None));
			const model = modelRef.object as ChatModel;
			const session = model.editingSession;
			assertType(session, 'session not created');

			const entry = await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'FarBoo\n' }]);
			const original = store.add(await textModelService.createModelReference(entry.originalURI)).object.textEditorModel;
			const modified = store.add(await textModelService.createModelReference(entry.modifiedURI)).object.textEditorModel;

			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Modified);

			assert.strictEqual(original.getValue(), 'abc\n'.repeat(10));
			assert.strictEqual(modified.getValue(), 'FarBoo\n' + 'abc\n'.repeat(10));

			modified.pushEditOperations(null, [EditOperation.insert(new Position(3, 1), 'USER_TYPE\n')], () => null);

			assert.ok(modified.getValue().includes('USER_TYPE'));
			assert.ok(original.getValue().includes('USER_TYPE'));

			await entry.reject();
			assert.strictEqual(modified.getValue(), original.getValue());
			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Rejected);

			assert.ok(!modified.getValue().includes('FarBoo'));
			assert.ok(!original.getValue().includes('FarBoo'));
		});
	});

	test('NO mirror typing inside -> accept', async function () {
		return runWithFakedTimers({}, async () => {
			assert.ok(editingService);

			const uri = URI.from({ scheme: 'test', path: 'abc\n' });

			const modelRef = store.add(chatService.startSession(ChatAgentLocation.Chat, CancellationToken.None));
			const model = modelRef.object as ChatModel;
			const session = model.editingSession;
			assertType(session, 'session not created');

			const entry = await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'FarBoo\n' }]);
			const original = store.add(await textModelService.createModelReference(entry.originalURI)).object.textEditorModel;
			const modified = store.add(await textModelService.createModelReference(entry.modifiedURI)).object.textEditorModel;

			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Modified);

			assert.strictEqual(original.getValue(), 'abc\n'.repeat(10));
			assert.strictEqual(modified.getValue(), 'FarBoo\n' + 'abc\n'.repeat(10));

			modified.pushEditOperations(null, [EditOperation.replace(new Range(1, 2, 1, 7), 'ooBar')], () => null);

			assert.ok(modified.getValue().includes('FooBar'));
			assert.ok(!original.getValue().includes('FooBar')); // typed in the AI edits, DO NOT transpose

			await entry.accept();
			assert.strictEqual(modified.getValue(), original.getValue());
			assert.strictEqual(entry.state.get(), ModifiedFileEntryState.Accepted);

			assert.ok(modified.getValue().includes('FooBar'));
			assert.ok(original.getValue().includes('FooBar'));
		});
	});

	test('ChatEditingService merges text edits it shouldn\'t merge, #272679', async function () {
		return runWithFakedTimers({}, async () => {
			assert.ok(editingService);

			const uri = URI.from({ scheme: 'test', path: 'abc' });

			const modified = store.add(await textModelService.createModelReference(uri)).object.textEditorModel;

			const modelRef = store.add(chatService.startSession(ChatAgentLocation.Chat, CancellationToken.None));
			const model = modelRef.object as ChatModel;
			const session = model.editingSession;
			assertType(session, 'session not created');

			modified.setValue('');
			await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'a' }, { range: new Range(1, 1, 1, 1), text: 'b' }]);
			assert.strictEqual(modified.getValue(), 'ab');

			modified.setValue('');
			await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'a' }]);
			await idleAfterEdit(session, model, uri, [{ range: new Range(1, 1, 1, 1), text: 'b' }]);
			assert.strictEqual(modified.getValue(), 'ba');
		});
	});

});
