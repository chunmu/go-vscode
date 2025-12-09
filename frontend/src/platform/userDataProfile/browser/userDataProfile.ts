/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BroadcastDataChannel } from '../../../base/browser/broadcast.ts';
import { revive } from '../../../base/common/marshalling.ts';
import { UriDto } from '../../../base/common/uri.ts';
import { IEnvironmentService } from '../../environment/common/environment.ts';
import { IFileService } from '../../files/common/files.ts';
import { ILogService } from '../../log/common/log.ts';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.ts';
import { DidChangeProfilesEvent, IUserDataProfile, IUserDataProfilesService, reviveProfile, StoredProfileAssociations, StoredUserDataProfile, UserDataProfilesService } from '../common/userDataProfile.ts';

type BroadcastedProfileChanges = UriDto<Omit<DidChangeProfilesEvent, 'all'>>;

export class BrowserUserDataProfilesService extends UserDataProfilesService implements IUserDataProfilesService {

	private readonly changesBroadcastChannel: BroadcastDataChannel<BroadcastedProfileChanges>;

	constructor(
		@IEnvironmentService environmentService: IEnvironmentService,
		@IFileService fileService: IFileService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILogService logService: ILogService,
	) {
		super(environmentService, fileService, uriIdentityService, logService);
		this.changesBroadcastChannel = this._register(new BroadcastDataChannel<BroadcastedProfileChanges>(`${UserDataProfilesService.PROFILES_KEY}.changes`));
		this._register(this.changesBroadcastChannel.onDidReceiveData(changes => {
			try {
				this._profilesObject = undefined;
				const added = changes.added.map(p => reviveProfile(p, this.profilesHome.scheme));
				const removed = changes.removed.map(p => reviveProfile(p, this.profilesHome.scheme));
				const updated = changes.updated.map(p => reviveProfile(p, this.profilesHome.scheme));

				this.updateTransientProfiles(
					added.filter(a => a.isTransient),
					removed.filter(a => a.isTransient),
					updated.filter(a => a.isTransient)
				);

				this._onDidChangeProfiles.fire({
					added,
					removed,
					updated,
					all: this.profiles
				});
			} catch (error) {/* ignore */ }
		}));
	}

	private updateTransientProfiles(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]): void {
		if (added.length) {
			this.transientProfilesObject.profiles.push(...added);
		}
		if (removed.length || updated.length) {
			const allTransientProfiles = this.transientProfilesObject.profiles;
			this.transientProfilesObject.profiles = [];
			for (const profile of allTransientProfiles) {
				if (removed.some(p => profile.id === p.id)) {
					continue;
				}
				this.transientProfilesObject.profiles.push(updated.find(p => profile.id === p.id) ?? profile);
			}
		}
	}

	protected override getStoredProfiles(): StoredUserDataProfile[] {
		try {
			const value = localStorage.getItem(UserDataProfilesService.PROFILES_KEY);
			if (value) {
				return revive(JSON.parse(value));
			}
		} catch (error) {
			/* ignore */
			this.logService.error(error);
		}
		return [];
	}

	protected override triggerProfilesChanges(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]) {
		super.triggerProfilesChanges(added, removed, updated);
		this.changesBroadcastChannel.postData({ added, removed, updated });
	}

	protected override saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void {
		localStorage.setItem(UserDataProfilesService.PROFILES_KEY, JSON.stringify(storedProfiles));
	}

	protected override getStoredProfileAssociations(): StoredProfileAssociations {
		try {
			const value = localStorage.getItem(UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY);
			if (value) {
				return JSON.parse(value);
			}
		} catch (error) {
			/* ignore */
			this.logService.error(error);
		}
		return {};
	}

	protected override saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void {
		localStorage.setItem(UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY, JSON.stringify(storedProfileAssociations));
	}

}
