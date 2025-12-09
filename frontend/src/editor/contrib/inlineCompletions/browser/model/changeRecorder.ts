/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../../base/common/lifecycle.ts';
import { autorun, observableFromEvent } from '../../../../../base/common/observable.ts';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.ts';
import { canLog, ILoggerService, LogLevel } from '../../../../../platform/log/common/log.ts';
import { ICodeEditor } from '../../../../browser/editorBrowser.ts';
import { CodeEditorWidget } from '../../../../browser/widget/codeEditor/codeEditorWidget.ts';
import { IDocumentEventDataSetChangeReason, IRecordableEditorLogEntry, StructuredLogger } from '../structuredLogger.ts';

export interface ITextModelChangeRecorderMetadata {
	source?: string;
	extensionId?: string;
	nes?: boolean;
	type?: 'word' | 'line';
}

export class TextModelChangeRecorder extends Disposable {
	private readonly _structuredLogger;

	constructor(
		private readonly _editor: ICodeEditor,
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
		@ILoggerService private readonly _loggerService: ILoggerService,
	) {
		super();

		this._structuredLogger = this._register(this._instantiationService.createInstance(StructuredLogger.cast<IRecordableEditorLogEntry & IDocumentEventDataSetChangeReason>(),
			'editor.inlineSuggest.logChangeReason.commandId'
		));

		const logger = this._loggerService?.createLogger('textModelChanges', { hidden: false, name: 'Text Model Changes Reason' });

		const loggingLevel = observableFromEvent(this, logger.onDidChangeLogLevel, () => logger.getLevel());

		this._register(autorun(reader => {
			if (!canLog(loggingLevel.read(reader), LogLevel.Trace)) {
				return;
			}

			reader.store.add(this._editor.onDidChangeModelContent((e) => {
				if (this._editor.getModel()?.uri.scheme === 'output') {
					return;
				}
				logger.trace('onDidChangeModelContent: ' + e.detailedReasons.map(r => r.toKey(Number.MAX_VALUE)).join(', '));
			}));
		}));

		this._register(autorun(reader => {
			if (!(this._editor instanceof CodeEditorWidget)) { return; }
			if (!this._structuredLogger.isEnabled.read(reader)) { return; }

			reader.store.add(this._editor.onDidChangeModelContent(e => {
				const tm = this._editor.getModel();
				if (!tm) { return; }

				const reason = e.detailedReasons[0];

				const data: IRecordableEditorLogEntry & IDocumentEventDataSetChangeReason = {
					...reason.metadata,
					sourceId: 'TextModel.setChangeReason',
					source: reason.metadata.source,
					time: Date.now(),
					modelUri: tm.uri,
					modelVersion: tm.getVersionId(),
				};
				setTimeout(() => {
					// To ensure that this reaches the extension host after the content change event.
					// (Without the setTimeout, I observed this command being called before the content change event arrived)
					this._structuredLogger.log(data);
				}, 0);
			}));
		}));
	}
}
