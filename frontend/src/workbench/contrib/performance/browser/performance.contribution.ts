/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../../nls.ts';
import { registerAction2, Action2 } from '../../../../platform/actions/common/actions.ts';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.ts';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.ts';
import { Registry } from '../../../../platform/registry/common/platform.ts';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.ts';
import { Extensions, IWorkbenchContributionsRegistry, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.ts';
import { EditorExtensions, IEditorSerializer, IEditorFactoryRegistry } from '../../../common/editor.ts';
import { PerfviewContrib, PerfviewInput } from './perfviewEditor.ts';
import { IEditorService } from '../../../services/editor/common/editorService.ts';
import { InstantiationService, Trace } from '../../../../platform/instantiation/common/instantiationService.ts';
import { EventProfiling } from '../../../../base/common/event.ts';
import { InputLatencyContrib } from './inputLatencyContrib.ts';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.ts';
import { GCBasedDisposableTracker, setDisposableTracker } from '../../../../base/common/lifecycle.ts';

// -- startup performance view

registerWorkbenchContribution2(
	PerfviewContrib.ID,
	PerfviewContrib,
	{ lazy: true }
);

Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory).registerEditorSerializer(
	PerfviewInput.Id,
	class implements IEditorSerializer {
		canSerialize(): boolean {
			return true;
		}
		serialize(): string {
			return '';
		}
		deserialize(instantiationService: IInstantiationService): PerfviewInput {
			return instantiationService.createInstance(PerfviewInput);
		}
	}
);


registerAction2(class extends Action2 {

	constructor() {
		super({
			id: 'perfview.show',
			title: localize2('show.label', 'Startup Performance'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor) {
		const editorService = accessor.get(IEditorService);
		const contrib = PerfviewContrib.get();
		return editorService.openEditor(contrib.getEditorInput(), { pinned: true });
	}
});


registerAction2(class PrintServiceCycles extends Action2 {

	constructor() {
		super({
			id: 'perf.insta.printAsyncCycles',
			title: localize2('cycles', 'Print Service Cycles'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor) {
		const instaService = accessor.get(IInstantiationService);
		if (instaService instanceof InstantiationService) {
			const cycle = instaService._globalGraph?.findCycleSlow();
			if (cycle) {
				console.warn(`CYCLE`, cycle);
			} else {
				console.warn(`YEAH, no more cycles`);
			}
		}
	}
});

registerAction2(class PrintServiceTraces extends Action2 {

	constructor() {
		super({
			id: 'perf.insta.printTraces',
			title: localize2('insta.trace', 'Print Service Traces'),
			category: Categories.Developer,
			f1: true
		});
	}

	run() {
		if (Trace.all.size === 0) {
			console.log('Enable via `instantiationService.ts#_enableAllTracing`');
			return;
		}

		for (const item of Trace.all) {
			console.log(item);
		}
	}
});


registerAction2(class PrintEventProfiling extends Action2 {

	constructor() {
		super({
			id: 'perf.event.profiling',
			title: localize2('emitter', 'Print Emitter Profiles'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(): void {
		if (EventProfiling.all.size === 0) {
			console.log('USE `EmitterOptions._profName` to enable profiling');
			return;
		}
		for (const item of EventProfiling.all) {
			console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
		}
	}
});

// -- input latency

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(
	InputLatencyContrib,
	LifecyclePhase.Eventually
);


// -- track leaking disposables, those that get GC'ed before having been disposed


class DisposableTracking {
	static readonly Id = 'perf.disposableTracking';
	constructor(@IEnvironmentService envService: IEnvironmentService) {
		if (!envService.isBuilt && !envService.extensionTestsLocationURI) {
			setDisposableTracker(new GCBasedDisposableTracker());
		}
	}
}

registerWorkbenchContribution2(DisposableTracking.Id, DisposableTracking, WorkbenchPhase.Eventually);
