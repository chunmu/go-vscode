/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.ts';
import { IWorkbenchContribution } from '../../../common/contributions.ts';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.ts';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.ts';
import { CandidatePort } from '../../../services/remote/common/tunnelModel.ts';

export class ShowCandidateContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.showPortCandidate';

	constructor(
		@IRemoteExplorerService remoteExplorerService: IRemoteExplorerService,
		@IBrowserWorkbenchEnvironmentService environmentService: IBrowserWorkbenchEnvironmentService,
	) {
		super();
		const showPortCandidate = environmentService.options?.tunnelProvider?.showPortCandidate;
		if (showPortCandidate) {
			this._register(remoteExplorerService.setCandidateFilter(async (candidates: CandidatePort[]): Promise<CandidatePort[]> => {
				const filters: boolean[] = await Promise.all(candidates.map(candidate => showPortCandidate(candidate.host, candidate.port, candidate.detail ?? '')));
				const filteredCandidates: CandidatePort[] = [];
				if (filters.length !== candidates.length) {
					return candidates;
				}
				for (let i = 0; i < candidates.length; i++) {
					if (filters[i]) {
						filteredCandidates.push(candidates[i]);
					}
				}
				return filteredCandidates;
			}));
		}
	}
}
