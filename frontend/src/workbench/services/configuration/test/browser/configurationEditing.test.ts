/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as sinon from 'sinon';
import assert from 'assert';
import * as json from '../../../../../base/common/json.ts';
import { Event } from '../../../../../base/common/event.ts';
import { Registry } from '../../../../../platform/registry/common/platform.ts';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.ts';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.ts';
import { TestEnvironmentService, TestTextFileService, workbenchInstantiationService } from '../../../../test/browser/workbenchTestServices.ts';
import * as uuid from '../../../../../base/common/uuid.ts';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../../platform/configuration/common/configurationRegistry.ts';
import { WorkspaceService } from '../../browser/configurationService.ts';
import { ConfigurationEditing, ConfigurationEditingErrorCode, EditableConfigurationTarget } from '../../common/configurationEditing.ts';
import { WORKSPACE_STANDALONE_CONFIGURATIONS, FOLDER_SETTINGS_PATH, USER_STANDALONE_CONFIGURATIONS, IConfigurationCache } from '../../common/configuration.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.ts';
import { ITextFileService } from '../../../textfile/common/textfiles.ts';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.ts';
import { TextModelResolverService } from '../../../textmodelResolver/common/textModelResolverService.ts';
import { INotificationService } from '../../../../../platform/notification/common/notification.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { CommandService } from '../../../commands/common/commandService.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { IRemoteAgentService } from '../../../remote/common/remoteAgentService.ts';
import { FileService } from '../../../../../platform/files/common/fileService.ts';
import { NullLogService } from '../../../../../platform/log/common/log.ts';
import { Schemas } from '../../../../../base/common/network.ts';
import { IFileService } from '../../../../../platform/files/common/files.ts';
import { KeybindingsEditingService, IKeybindingEditingService } from '../../../keybinding/common/keybindingEditing.ts';
import { FileUserDataProvider } from '../../../../../platform/userData/common/fileUserDataProvider.ts';
import { UriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentityService.ts';
import { toDisposable } from '../../../../../base/common/lifecycle.ts';
import { InMemoryFileSystemProvider } from '../../../../../platform/files/common/inMemoryFilesystemProvider.ts';
import { joinPath } from '../../../../../base/common/resources.ts';
import { VSBuffer } from '../../../../../base/common/buffer.ts';
import { RemoteAgentService } from '../../../remote/browser/remoteAgentService.ts';
import { getSingleFolderWorkspaceIdentifier } from '../../../workspaces/browser/workspaces.ts';
import { IUserDataProfilesService, UserDataProfilesService } from '../../../../../platform/userDataProfile/common/userDataProfile.ts';
import { hash } from '../../../../../base/common/hash.ts';
import { FilePolicyService } from '../../../../../platform/policy/common/filePolicyService.ts';
import { runWithFakedTimers } from '../../../../../base/test/common/timeTravelScheduler.ts';
import { UserDataProfileService } from '../../../userDataProfile/common/userDataProfileService.ts';
import { IUserDataProfileService } from '../../../userDataProfile/common/userDataProfile.ts';
import { IBrowserWorkbenchEnvironmentService } from '../../../environment/browser/environmentService.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { PolicyCategory } from '../../../../../base/common/policy.ts';

const ROOT = URI.file('tests').with({ scheme: 'vscode-tests' });

class ConfigurationCache implements IConfigurationCache {
	needsCaching(resource: URI): boolean { return false; }
	async read(): Promise<string> { return ''; }
	async write(): Promise<void> { }
	async remove(): Promise<void> { }
}

suite('ConfigurationEditing', () => {

	let instantiationService: TestInstantiationService;
	let userDataProfileService: IUserDataProfileService;
	let environmentService: IBrowserWorkbenchEnvironmentService;
	let fileService: IFileService;
	let workspaceService: WorkspaceService;
	let testObject: ConfigurationEditing;

	suiteSetup(() => {
		const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
		configurationRegistry.registerConfiguration({
			'id': '_test',
			'type': 'object',
			'properties': {
				'configurationEditing.service.testSetting': {
					'type': 'string',
					'default': 'isSet'
				},
				'configurationEditing.service.testSettingTwo': {
					'type': 'string',
					'default': 'isSet'
				},
				'configurationEditing.service.testSettingThree': {
					'type': 'string',
					'default': 'isSet'
				},
				'configurationEditing.service.policySetting': {
					'type': 'string',
					'default': 'isSet',
					policy: {
						name: 'configurationEditing.service.policySetting',
						category: PolicyCategory.Extensions,
						minimumVersion: '1.0.0',
						localization: { description: { key: '', value: '' } }
					}
				}
			}
		});
	});

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	setup(async () => {
		disposables.add(toDisposable(() => sinon.restore()));
		const logService = new NullLogService();
		fileService = disposables.add(new FileService(logService));
		const fileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
		disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));

		const workspaceFolder = joinPath(ROOT, uuid.generateUuid());
		await fileService.createFolder(workspaceFolder);

		instantiationService = workbenchInstantiationService(undefined, disposables);
		environmentService = TestEnvironmentService;
		environmentService.policyFile = joinPath(workspaceFolder, 'policies.json');
		instantiationService.stub(IEnvironmentService, environmentService);
		const uriIdentityService = disposables.add(new UriIdentityService(fileService));
		const userDataProfilesService = instantiationService.stub(IUserDataProfilesService, disposables.add(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService)));
		userDataProfileService = disposables.add(new UserDataProfileService(userDataProfilesService.defaultProfile));
		const remoteAgentService = disposables.add(instantiationService.createInstance(RemoteAgentService));
		disposables.add(fileService.registerProvider(Schemas.vscodeUserData, disposables.add(new FileUserDataProvider(ROOT.scheme, fileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
		instantiationService.stub(IFileService, fileService);
		instantiationService.stub(IRemoteAgentService, remoteAgentService);
		workspaceService = disposables.add(new WorkspaceService({ configurationCache: new ConfigurationCache() }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, new NullLogService(), disposables.add(new FilePolicyService(environmentService.policyFile, fileService, logService))));
		await workspaceService.initialize({
			id: hash(workspaceFolder.toString()).toString(16),
			uri: workspaceFolder
		});
		instantiationService.stub(IWorkspaceContextService, workspaceService);

		await workspaceService.initialize(getSingleFolderWorkspaceIdentifier(workspaceFolder));
		instantiationService.stub(IConfigurationService, workspaceService);
		instantiationService.stub(IKeybindingEditingService, disposables.add(instantiationService.createInstance(KeybindingsEditingService)));
		instantiationService.stub(ITextFileService, disposables.add(instantiationService.createInstance(TestTextFileService)));
		instantiationService.stub(ITextModelService, <ITextModelService>disposables.add(instantiationService.createInstance(TextModelResolverService)));
		instantiationService.stub(ICommandService, CommandService);
		testObject = instantiationService.createInstance(ConfigurationEditing, null);
	});

	test('errors cases - invalid key', async () => {
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'unknown.key', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY);
			return;
		}
		assert.fail('Should fail with ERROR_UNKNOWN_KEY');
	});

	test('errors cases - no workspace', async () => {
		await workspaceService.initialize({ id: uuid.generateUuid() });
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED);
			return;
		}
		assert.fail('Should fail with ERROR_NO_WORKSPACE_OPENED');
	});

	test('errors cases - invalid configuration', async () => {
		await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString(',,,,,,,,,,,,,,'));
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION);
			return;
		}
		assert.fail('Should fail with ERROR_INVALID_CONFIGURATION');
	});

	test('errors cases - invalid global tasks configuration', async () => {
		const resource = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(resource, VSBuffer.fromString(',,,,,,,,,,,,,,'));
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks.configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION);
			return;
		}
		assert.fail('Should fail with ERROR_INVALID_CONFIGURATION');
	});

	test('errors cases - dirty', async () => {
		instantiationService.stub(ITextFileService, 'isDirty', true);
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY);
			return;
		}
		assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.');
	});

	test('do not notify error', async () => {
		instantiationService.stub(ITextFileService, 'isDirty', true);
		const target = sinon.stub();
		instantiationService.stub(INotificationService, <INotificationService>{ prompt: target, _serviceBrand: undefined, filter: false, onDidChangeFilter: undefined!, notify: null!, error: null!, info: null!, warn: null!, status: null!, setFilter: null!, getFilter: null!, getFilters: null!, removeFilter: null! });
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(false, target.calledOnce);
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY);
			return;
		}
		assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.');
	});

	test('errors cases - ERROR_POLICY_CONFIGURATION', async () => {
		await runWithFakedTimers({ useFakeTimers: true }, async () => {
			const promise = Event.toPromise(instantiationService.get(IConfigurationService).onDidChangeConfiguration);
			await fileService.writeFile(environmentService.policyFile!, VSBuffer.fromString('{ "configurationEditing.service.policySetting": "policyValue" }'));
			await promise;
		});
		try {
			await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.policySetting', value: 'value' }, { donotNotifyError: true });
		} catch (error) {
			assert.strictEqual(error.code, ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION);
			return;
		}
		assert.fail('Should fail with ERROR_POLICY_CONFIGURATION');
	});

	test('write policy setting - when not set', async () => {
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.policySetting', value: 'value' }, { donotNotifyError: true });
		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['configurationEditing.service.policySetting'], 'value');
	});

	test('write one setting - empty file', async () => {
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: 'value' });
		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
	});

	test('write one setting - existing file', async () => {
		await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('remove an existing setting - existing file', async () => {
		await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "my.super.setting": "my.super.value", "configurationEditing.service.testSetting": "value" }'));
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: undefined });

		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('remove non existing setting - existing file', async () => {
		await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'configurationEditing.service.testSetting', value: undefined });

		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('write overridable settings to user settings', async () => {
		const key = '[language]';
		const value = { 'configurationEditing.service.testSetting': 'overridden value' };
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key, value });

		const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
		const parsed = json.parse(contents.value.toString());
		assert.deepStrictEqual(parsed[key], value);
	});

	test('write overridable settings to workspace settings', async () => {
		const key = '[language]';
		const value = { 'configurationEditing.service.testSetting': 'overridden value' };
		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key, value });

		const contents = await fileService.readFile(joinPath(workspaceService.getWorkspace().folders[0].uri, FOLDER_SETTINGS_PATH));
		const parsed = json.parse(contents.value.toString());
		assert.deepStrictEqual(parsed[key], value);
	});

	test('write overridable settings to workspace folder settings', async () => {
		const key = '[language]';
		const value = { 'configurationEditing.service.testSetting': 'overridden value' };
		const folderSettingsFile = joinPath(workspaceService.getWorkspace().folders[0].uri, FOLDER_SETTINGS_PATH);
		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE_FOLDER, { key, value }, { scopes: { resource: folderSettingsFile } });

		const contents = await fileService.readFile(folderSettingsFile);
		const parsed = json.parse(contents.value.toString());
		assert.deepStrictEqual(parsed[key], value);
	});

	test('write workspace standalone setting - empty file', async () => {
		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['service.testSetting'], 'value');
	});

	test('write user standalone setting - empty file', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['service.testSetting'], 'value');
	});

	test('write workspace standalone setting - existing file', async () => {
		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));

		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['service.testSetting'], 'value');
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('write user standalone setting - existing file', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));

		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['service.testSetting'], 'value');
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('write user standalone mcp setting - existing file', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['mcp']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));

		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'mcp.service.testSetting', value: 'value' });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['service.testSetting'], 'value');
		assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
	});

	test('write workspace standalone setting - empty file - full JSON', async () => {
		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write user standalone setting - empty file - full JSON', async () => {
		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write workspace standalone setting - existing file - full JSON', async () => {
		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));

		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write user standalone setting - existing file - full JSON', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));

		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write workspace standalone setting - existing file with JSON errors - full JSON', async () => {
		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": ')); // invalid JSON

		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write user standalone setting - existing file with JSON errors - full JSON', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString('{ "my.super.setting": ')); // invalid JSON

		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });

		const contents = await fileService.readFile(target);
		const parsed = json.parse(contents.value.toString());
		assert.strictEqual(parsed['version'], '1.0.0');
		assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
	});

	test('write workspace standalone setting should replace complete file', async () => {
		const target = joinPath(workspaceService.getWorkspace().folders[0].uri, WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString(`{
			"version": "1.0.0",
			"tasks": [
				{
					"taskName": "myTask1"
				},
				{
					"taskName": "myTask2"
				}
			]
		}`));

		await testObject.writeConfiguration(EditableConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] } });

		const actual = await fileService.readFile(target);
		const expected = JSON.stringify({ 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] }, null, '\t');
		assert.strictEqual(actual.value.toString(), expected);
	});

	test('write user standalone setting should replace complete file', async () => {
		const target = joinPath(environmentService.userRoamingDataHome, USER_STANDALONE_CONFIGURATIONS['tasks']);
		await fileService.writeFile(target, VSBuffer.fromString(`{
			"version": "1.0.0",
			"tasks": [
				{
					"taskName": "myTask1"
				},
				{
					"taskName": "myTask2"
				}
			]
		}`));

		await testObject.writeConfiguration(EditableConfigurationTarget.USER_LOCAL, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] } });

		const actual = await fileService.readFile(target);
		const expected = JSON.stringify({ 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] }, null, '\t');
		assert.strictEqual(actual.value.toString(), expected);
	});
});
