/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import '../../browser/keyboardLayouts/en.darwin.ts';
import '../../browser/keyboardLayouts/de.darwin.ts';
import { KeyboardLayoutContribution } from '../../browser/keyboardLayouts/_.contribution.ts';
import { BrowserKeyboardMapperFactoryBase } from '../../browser/keyboardLayoutService.ts';
import { KeymapInfo, IKeymapInfo } from '../../common/keymapInfo.ts';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.ts';
import { INotificationService } from '../../../../../platform/notification/common/notification.ts';
import { ICommandService } from '../../../../../platform/commands/common/commands.ts';
import { IStorageService } from '../../../../../platform/storage/common/storage.ts';
import { TestNotificationService } from '../../../../../platform/notification/test/common/testNotificationService.ts';
import { TestStorageService } from '../../../../test/common/workbenchTestServices.ts';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.ts';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.ts';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.ts';

class TestKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
	constructor(configurationService: IConfigurationService, notificationService: INotificationService, storageService: IStorageService, commandService: ICommandService) {
		// super(notificationService, storageService, commandService);
		super(configurationService);

		const keymapInfos: IKeymapInfo[] = KeyboardLayoutContribution.INSTANCE.layoutInfos;
		this._keymapInfos.push(...keymapInfos.map(info => (new KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
		this._mru = this._keymapInfos;
		this._initialized = true;
		this.setLayoutFromBrowserAPI();
		const usLayout = this.getUSStandardLayout();
		if (usLayout) {
			this.setActiveKeyMapping(usLayout.mapping);
		}
	}
}

suite('keyboard layout loader', () => {
	const ds = ensureNoDisposablesAreLeakedInTestSuite();
	let instantiationService: TestInstantiationService;
	let instance: TestKeyboardMapperFactory;

	setup(() => {
		instantiationService = new TestInstantiationService();
		const storageService = new TestStorageService();
		const notitifcationService = instantiationService.stub(INotificationService, new TestNotificationService());
		const configurationService = instantiationService.stub(IConfigurationService, new TestConfigurationService());
		const commandService = instantiationService.stub(ICommandService, {});

		ds.add(instantiationService);
		ds.add(storageService);

		instance = new TestKeyboardMapperFactory(configurationService, notitifcationService, storageService, commandService);
		ds.add(instance);
	});

	teardown(() => {
		instantiationService.dispose();
	});

	test('load default US keyboard layout', () => {
		assert.notStrictEqual(instance.activeKeyboardLayout, null);
	});

	test('isKeyMappingActive', () => {
		instance.setUSKeyboardLayout();
		assert.strictEqual(instance.isKeyMappingActive({
			KeyA: {
				value: 'a',
				valueIsDeadKey: false,
				withShift: 'A',
				withShiftIsDeadKey: false,
				withAltGr: 'å',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Å',
				withShiftAltGrIsDeadKey: false
			}
		}), true);

		assert.strictEqual(instance.isKeyMappingActive({
			KeyA: {
				value: 'a',
				valueIsDeadKey: false,
				withShift: 'A',
				withShiftIsDeadKey: false,
				withAltGr: 'å',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Å',
				withShiftAltGrIsDeadKey: false
			},
			KeyZ: {
				value: 'z',
				valueIsDeadKey: false,
				withShift: 'Z',
				withShiftIsDeadKey: false,
				withAltGr: 'Ω',
				withAltGrIsDeadKey: false,
				withShiftAltGr: '¸',
				withShiftAltGrIsDeadKey: false
			}
		}), true);

		assert.strictEqual(instance.isKeyMappingActive({
			KeyZ: {
				value: 'y',
				valueIsDeadKey: false,
				withShift: 'Y',
				withShiftIsDeadKey: false,
				withAltGr: '¥',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Ÿ',
				withShiftAltGrIsDeadKey: false
			},
		}), false);

	});

	test('Switch keymapping', () => {
		instance.setActiveKeyMapping({
			KeyZ: {
				value: 'y',
				valueIsDeadKey: false,
				withShift: 'Y',
				withShiftIsDeadKey: false,
				withAltGr: '¥',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Ÿ',
				withShiftAltGrIsDeadKey: false
			}
		});
		assert.strictEqual(!!instance.activeKeyboardLayout!.isUSStandard, false);
		assert.strictEqual(instance.isKeyMappingActive({
			KeyZ: {
				value: 'y',
				valueIsDeadKey: false,
				withShift: 'Y',
				withShiftIsDeadKey: false,
				withAltGr: '¥',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Ÿ',
				withShiftAltGrIsDeadKey: false
			},
		}), true);

		instance.setUSKeyboardLayout();
		assert.strictEqual(instance.activeKeyboardLayout!.isUSStandard, true);
	});

	test('Switch keyboard layout info', () => {
		instance.setKeyboardLayout('com.apple.keylayout.German');
		assert.strictEqual(!!instance.activeKeyboardLayout!.isUSStandard, false);
		assert.strictEqual(instance.isKeyMappingActive({
			KeyZ: {
				value: 'y',
				valueIsDeadKey: false,
				withShift: 'Y',
				withShiftIsDeadKey: false,
				withAltGr: '¥',
				withAltGrIsDeadKey: false,
				withShiftAltGr: 'Ÿ',
				withShiftAltGrIsDeadKey: false
			},
		}), true);

		instance.setUSKeyboardLayout();
		assert.strictEqual(instance.activeKeyboardLayout!.isUSStandard, true);
	});
});
