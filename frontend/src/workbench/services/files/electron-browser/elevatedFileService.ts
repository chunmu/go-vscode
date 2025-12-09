/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.ts';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.ts';
import { randomPath } from '../../../../base/common/extpath.ts';
import { Schemas } from '../../../../base/common/network.ts';
import { URI } from '../../../../base/common/uri.ts';
import { IFileService, IFileStatWithMetadata, IWriteFileOptions } from '../../../../platform/files/common/files.ts';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.ts';
import { INativeHostService } from '../../../../platform/native/common/native.ts';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.ts';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.ts';
import { IElevatedFileService } from '../common/elevatedFileService.ts';
import { isWindows } from '../../../../base/common/platform.ts';
import { ILabelService } from '../../../../platform/label/common/label.ts';
export class NativeElevatedFileService implements IElevatedFileService {

	readonly _serviceBrand: undefined;

	constructor(
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@IFileService private readonly fileService: IFileService,
		@INativeWorkbenchEnvironmentService private readonly environmentService: INativeWorkbenchEnvironmentService,
		@IWorkspaceTrustRequestService private readonly workspaceTrustRequestService: IWorkspaceTrustRequestService,
		@ILabelService private readonly labelService: ILabelService
	) { }

	isSupported(resource: URI): boolean {
		// Saving elevated is currently only supported for local
		// files for as long as we have no generic support from
		// the file service
		// (https://github.com/microsoft/vscode/issues/48659)
		return resource.scheme === Schemas.file;
	}

	async writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata> {
		const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
			message: isWindows ? localize('fileNotTrustedMessageWindows', "You are about to save '{0}' as admin.", this.labelService.getUriLabel(resource)) : localize('fileNotTrustedMessagePosix', "You are about to save '{0}' as super user.", this.labelService.getUriLabel(resource)),
		});
		if (!trusted) {
			throw new Error(localize('fileNotTrusted', "Workspace is not trusted."));
		}

		const source = URI.file(randomPath(this.environmentService.userDataPath, 'code-elevated'));
		try {
			// write into a tmp file first
			await this.fileService.writeFile(source, value, options);

			// then sudo prompt copy
			await this.nativeHostService.writeElevated(source, resource, options);
		} finally {

			// clean up
			await this.fileService.del(source);
		}

		return this.fileService.resolve(resource, { resolveMetadata: true });
	}
}

registerSingleton(IElevatedFileService, NativeElevatedFileService, InstantiationType.Delayed);
