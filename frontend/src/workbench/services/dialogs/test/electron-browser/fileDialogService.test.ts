/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import * as sinon from 'sinon';
import { Schemas } from '../../../../../base/common/network.ts';
import { URI } from '../../../../../base/common/uri.ts';
import { mock } from '../../../../../base/test/common/mock.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.ts';
import { ILanguageService } from '../../../../../editor/common/languages/language.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.ts';
import { IDialogService, IFileDialogService, IOpenDialogOptions, ISaveDialogOptions } from '../../../../../platform/dialogs/common/dialogs.ts';
import { IFileService } from '../../../../../platform/files/common/files.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.ts';
import { ILabelService } from '../../../../../platform/label/common/label.ts';
import { ILogService } from '../../../../../platform/log/common/log.ts';
import { INativeHostService } from '../../../../../platform/native/common/native.ts';
import { IOpenerService } from '../../../../../platform/opener/common/opener.ts';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.ts';
import { IWorkspacesService } from '../../../../../platform/workspaces/common/workspaces.ts';
import { ISimpleFileDialog } from '../../browser/simpleFileDialog.ts';
import { FileDialogService } from '../../electron-browser/fileDialogService.ts';
import { IEditorService } from '../../../editor/common/editorService.ts';
import { BrowserWorkbenchEnvironmentService } from '../../../environment/browser/environmentService.ts';
import { IWorkbenchEnvironmentService } from '../../../environment/common/environmentService.ts';
import { IHistoryService } from '../../../history/common/history.ts';
import { IHostService } from '../../../host/browser/host.ts';
import { IPathService } from '../../../path/common/pathService.ts';
import { BrowserWorkspaceEditingService } from '../../../workspaces/browser/workspaceEditingService.ts';
import { IWorkspaceEditingService } from '../../../workspaces/common/workspaceEditing.ts';
import { workbenchInstantiationService } from '../../../../test/browser/workbenchTestServices.ts';

class TestFileDialogService extends FileDialogService {
	constructor(
		private simple: ISimpleFileDialog,
		@IHostService hostService: IHostService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IHistoryService historyService: IHistoryService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IFileService fileService: IFileService,
		@IOpenerService openerService: IOpenerService,
		@INativeHostService nativeHostService: INativeHostService,
		@IDialogService dialogService: IDialogService,
		@ILanguageService languageService: ILanguageService,
		@IWorkspacesService workspacesService: IWorkspacesService,
		@ILabelService labelService: ILabelService,
		@IPathService pathService: IPathService,
		@ICommandService commandService: ICommandService,
		@IEditorService editorService: IEditorService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@ILogService logService: ILogService
	) {
		super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService,
			openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
	}

	protected override getSimpleFileDialog() {
		if (this.simple) {
			return this.simple;
		} else {
			return super.getSimpleFileDialog();
		}
	}
}

suite('FileDialogService', function () {

	let instantiationService: TestInstantiationService;
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();
	const testFile: URI = URI.file('/test/file');

	setup(async function () {
		disposables.add(instantiationService = workbenchInstantiationService(undefined, disposables));
		const configurationService = new TestConfigurationService();
		await configurationService.setUserConfiguration('files', { simpleDialog: { enable: true } });
		instantiationService.stub(IConfigurationService, configurationService);

	});

	test('Local - open/save workspaces availableFilesystems', async function () {
		class TestSimpleFileDialog implements ISimpleFileDialog {
			async showOpenDialog(options: IOpenDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 1);
				assert.strictEqual(options.availableFileSystems[0], Schemas.file);
				return testFile;
			}
			async showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 1);
				assert.strictEqual(options.availableFileSystems[0], Schemas.file);
				return testFile;
			}
			dispose(): void { }
		}

		const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
		instantiationService.set(IFileDialogService, dialogService);
		const workspaceService: IWorkspaceEditingService = disposables.add(instantiationService.createInstance(BrowserWorkspaceEditingService));
		assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
		assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
	});

	test('Virtual - open/save workspaces availableFilesystems', async function () {
		class TestSimpleFileDialog {
			async showOpenDialog(options: IOpenDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 1);
				assert.strictEqual(options.availableFileSystems[0], Schemas.file);
				return testFile;
			}
			async showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 1);
				assert.strictEqual(options.availableFileSystems[0], Schemas.file);
				return testFile;
			}
			dispose(): void { }
		}

		instantiationService.stub(IPathService, new class {
			defaultUriScheme: string = 'vscode-virtual-test';
			userHome = async () => URI.file('/user/home');
		} as IPathService);
		const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
		instantiationService.set(IFileDialogService, dialogService);
		const workspaceService: IWorkspaceEditingService = disposables.add(instantiationService.createInstance(BrowserWorkspaceEditingService));
		assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
		assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
	});

	test('Remote - open/save workspaces availableFilesystems', async function () {
		class TestSimpleFileDialog implements ISimpleFileDialog {
			async showOpenDialog(options: IOpenDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 2);
				assert.strictEqual(options.availableFileSystems[0], Schemas.vscodeRemote);
				assert.strictEqual(options.availableFileSystems[1], Schemas.file);
				return testFile;
			}
			async showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined> {
				assert.strictEqual(options.availableFileSystems?.length, 2);
				assert.strictEqual(options.availableFileSystems[0], Schemas.vscodeRemote);
				assert.strictEqual(options.availableFileSystems[1], Schemas.file);
				return testFile;
			}
			dispose(): void { }
		}

		instantiationService.set(IWorkbenchEnvironmentService, new class extends mock<BrowserWorkbenchEnvironmentService>() {
			override get remoteAuthority() {
				return 'testRemote';
			}
		});
		instantiationService.stub(IPathService, new class {
			defaultUriScheme: string = Schemas.vscodeRemote;
			userHome = async () => URI.file('/user/home');
		} as IPathService);
		const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
		instantiationService.set(IFileDialogService, dialogService);
		const workspaceService: IWorkspaceEditingService = disposables.add(instantiationService.createInstance(BrowserWorkspaceEditingService));
		assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
		assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
	});

	test('Remote - filters default files/folders to RA (#195938)', async function () {
		class TestSimpleFileDialog implements ISimpleFileDialog {
			async showOpenDialog(): Promise<URI | undefined> {
				return testFile;
			}
			async showSaveDialog(): Promise<URI | undefined> {
				return testFile;
			}
			dispose(): void { }
		}
		instantiationService.set(IWorkbenchEnvironmentService, new class extends mock<BrowserWorkbenchEnvironmentService>() {
			override get remoteAuthority() {
				return 'testRemote';
			}
		});
		instantiationService.stub(IPathService, new class {
			defaultUriScheme: string = Schemas.vscodeRemote;
			userHome = async () => URI.file('/user/home');
		} as IPathService);


		const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
		const historyService = instantiationService.get(IHistoryService);
		const getLastActiveWorkspaceRoot = sinon.spy(historyService, 'getLastActiveWorkspaceRoot');
		const getLastActiveFile = sinon.spy(historyService, 'getLastActiveFile');

		await dialogService.defaultFilePath();
		assert.deepStrictEqual(getLastActiveFile.args, [[Schemas.vscodeRemote, 'testRemote']]);
		assert.deepStrictEqual(getLastActiveWorkspaceRoot.args, [[Schemas.vscodeRemote, 'testRemote']]);

		await dialogService.defaultFolderPath();
		assert.deepStrictEqual(getLastActiveWorkspaceRoot.args[1], [Schemas.vscodeRemote, 'testRemote']);
	});
});
