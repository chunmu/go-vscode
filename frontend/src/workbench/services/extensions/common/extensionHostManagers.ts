/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.ts';
import { URI } from '../../../../base/common/uri.ts';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.ts';
import { ExtensionHostKind } from './extensionHostKind.ts';
import { IExtensionDescriptionDelta } from './extensionHostProtocol.ts';
import { IResolveAuthorityResult } from './extensionHostProxy.ts';
import { ExtensionRunningLocation } from './extensionRunningLocation.ts';
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionInspectInfo } from './extensions.ts';
import { ResponsiveState } from './rpcProtocol.ts';

export interface IExtensionHostManager {
	readonly pid: number | null;
	readonly kind: ExtensionHostKind;
	readonly startup: ExtensionHostStartup;
	readonly friendyName: string;
	readonly onDidExit: Event<[number, string | null]>;
	readonly onDidChangeResponsiveState: Event<ResponsiveState>;
	disconnect(): Promise<void>;
	dispose(): void;
	ready(): Promise<void>;
	representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
	deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
	containsExtension(extensionId: ExtensionIdentifier): boolean;
	activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
	activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
	activationEventIsDone(activationEvent: string): boolean;
	getInspectPort(tryEnableInspector: boolean): Promise<IExtensionInspectInfo | undefined>;
	resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
	/**
	 * Returns `null` if no resolver for `remoteAuthority` is found.
	 */
	getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
	start(extensionRegistryVersionId: number, allExtensions: readonly IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
	extensionTestsExecute(): Promise<number>;
	setRemoteEnvironment(env: { [key: string]: string | null }): Promise<void>;
}
