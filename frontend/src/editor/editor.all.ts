/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './browser/coreCommands.ts';
import './browser/widget/codeEditor/codeEditorWidget.ts';
import './browser/widget/diffEditor/diffEditor.contribution.ts';
import './contrib/anchorSelect/browser/anchorSelect.ts';
import './contrib/bracketMatching/browser/bracketMatching.ts';
import './contrib/caretOperations/browser/caretOperations.ts';
import './contrib/caretOperations/browser/transpose.ts';
import './contrib/clipboard/browser/clipboard.ts';
import './contrib/codeAction/browser/codeActionContributions.ts';
import './contrib/codelens/browser/codelensController.ts';
import './contrib/colorPicker/browser/colorPickerContribution.ts';
import './contrib/comment/browser/comment.ts';
import './contrib/contextmenu/browser/contextmenu.ts';
import './contrib/cursorUndo/browser/cursorUndo.ts';
import './contrib/dnd/browser/dnd.ts';
import './contrib/dropOrPasteInto/browser/copyPasteContribution.ts';
import './contrib/dropOrPasteInto/browser/dropIntoEditorContribution.ts';
import './contrib/find/browser/findController.ts';
import './contrib/folding/browser/folding.ts';
import './contrib/fontZoom/browser/fontZoom.ts';
import './contrib/format/browser/formatActions.ts';
import './contrib/documentSymbols/browser/documentSymbols.ts';
import './contrib/inlineCompletions/browser/inlineCompletions.contribution.ts';
import './contrib/inlineProgress/browser/inlineProgress.ts';
import './contrib/gotoSymbol/browser/goToCommands.ts';
import './contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.ts';
import './contrib/gotoError/browser/gotoError.ts';
import './contrib/gpu/browser/gpuActions.ts';
import './contrib/hover/browser/hoverContribution.ts';
import './contrib/indentation/browser/indentation.ts';
import './contrib/inlayHints/browser/inlayHintsContribution.ts';
import './contrib/inPlaceReplace/browser/inPlaceReplace.ts';
import './contrib/insertFinalNewLine/browser/insertFinalNewLine.ts';
import './contrib/lineSelection/browser/lineSelection.ts';
import './contrib/linesOperations/browser/linesOperations.ts';
import './contrib/linkedEditing/browser/linkedEditing.ts';
import './contrib/links/browser/links.ts';
import './contrib/longLinesHelper/browser/longLinesHelper.ts';
import './contrib/middleScroll/browser/middleScroll.contribution.ts';
import './contrib/multicursor/browser/multicursor.ts';
import './contrib/parameterHints/browser/parameterHints.ts';
import './contrib/placeholderText/browser/placeholderText.contribution.ts';
import './contrib/rename/browser/rename.ts';
import './contrib/sectionHeaders/browser/sectionHeaders.ts';
import './contrib/semanticTokens/browser/documentSemanticTokens.ts';
import './contrib/semanticTokens/browser/viewportSemanticTokens.ts';
import './contrib/smartSelect/browser/smartSelect.ts';
import './contrib/snippet/browser/snippetController2.ts';
import './contrib/stickyScroll/browser/stickyScrollContribution.ts';
import './contrib/suggest/browser/suggestController.ts';
import './contrib/suggest/browser/suggestInlineCompletions.ts';
import './contrib/tokenization/browser/tokenization.ts';
import './contrib/toggleTabFocusMode/browser/toggleTabFocusMode.ts';
import './contrib/unicodeHighlighter/browser/unicodeHighlighter.ts';
import './contrib/unusualLineTerminators/browser/unusualLineTerminators.ts';
import './contrib/wordHighlighter/browser/wordHighlighter.ts';
import './contrib/wordOperations/browser/wordOperations.ts';
import './contrib/wordPartOperations/browser/wordPartOperations.ts';
import './contrib/readOnlyMessage/browser/contribution.ts';
import './contrib/diffEditorBreadcrumbs/browser/contribution.ts';
import './contrib/floatingMenu/browser/floatingMenu.contribution.ts';
import './browser/services/contribution.ts';

// Load up these strings even in VSCode, even if they are not used
// in order to get them translated
import './common/standaloneStrings.ts';

import '../base/browser/ui/codicons/codiconStyles.ts'; // The codicons are defined here and must be loaded

