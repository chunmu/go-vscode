/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../base/common/buffer.ts';
import { generateUuid, isUUID } from '../../../base/common/uuid.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { IFileService } from '../../files/common/files.ts';
import { IStorageService, StorageScope, StorageTarget } from '../../storage/common/storage.ts';

export async function getServiceMachineId(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService | undefined): Promise<string> {
	let uuid: string | null = storageService ? storageService.get('storage.serviceMachineId', StorageScope.APPLICATION) || null : null;
	if (uuid) {
		return uuid;
	}
	try {
		const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
		const value = contents.value.toString();
		uuid = isUUID(value) ? value : null;
	} catch (e) {
		uuid = null;
	}

	if (!uuid) {
		uuid = generateUuid();
		try {
			await fileService.writeFile(environmentService.serviceMachineIdResource, VSBuffer.fromString(uuid));
		} catch (error) {
			//noop
		}
	}

	storageService?.store('storage.serviceMachineId', uuid, StorageScope.APPLICATION, StorageTarget.MACHINE);

	return uuid;
}
