/** @babel */

import { CompositeDisposable } from 'atom';
import TerminalSession from './terminal-session';
import TerminalView from './terminal-view';
import config from './config';

const TERMINAL_TAB_URI = 'iv-terminal://';
const path = require('path')

let activeTerminalSessions = {};

function focusTerminal(terminal) {
  panes = atom.workspace.getPanes();
  for (var i in panes) {
    for (var j in panes[i].items) {
      if (panes[i].items[j].filePath && panes[i].items[j].filePath == terminal.filePath) {
        panes[i].activate();
        panes[i].activateItemAtIndex(j);
        return;
      }
    }
  }
}

function handleOpen() {
  editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    key = editor.buffer.getPath();
    if (key in activeTerminalSessions && activeTerminalSessions[key].isOpen) {
      if (atom.config.get('iv-terminal.customTexts.focusOnInsert')) {
        focusTerminal(activeTerminalSessions[key]);
      }
      return;
    }
  }

  return atom.workspace.open(TERMINAL_TAB_URI);
}

function handleCustomInsert(customText) {
  let terminal = atom.workspace.getActivePaneItem();

  calledFromTextEditor = atom.workspace.getActiveTextEditor();
  if (calledFromTextEditor) {
      handleOpen();
      filePath = calledFromTextEditor.buffer.getPath();
      terminal = activeTerminalSessions[filePath];
  }

  terminal.insertCustomText(customText);
}

export default {

  config,

  initialize() {
    this.disposables = new CompositeDisposable();
    this.addViewProvider();
  },

  activate() {
    this.addOpener();
    this.addCommands();
  },

  deactivate() {
    this.disposables.dispose();
  },

  deserializeTerminalSession(data) {
    newTermSess = new TerminalSession(data.filePath, data.config);
    activeTerminalSessions[data.filePath] = newTermSess;
    return newTermSess;
  },

  handleOpen() {
    handleOpen();
  },

  handleClose() {
    const activePane = atom.workspace.getActivePane();
    activePane.destroyActiveItem();
  },

  handleCopy() {
    const activeSession = atom.workspace.getActivePaneItem();
    activeSession.copySelection();
  },

  handlePaste() {
    const activeSession = atom.workspace.getActivePaneItem();
    activeSession.pasteFromClipboard();
  },

  handleInsert1() {
    const customText = atom.config.get('iv-terminal.customTexts.customText1');
    handleCustomInsert(customText);
  },

  handleInsert2() {
    const customText = atom.config.get('iv-terminal.customTexts.customText2');
    handleCustomInsert(customText);
  },

  handleInsert3() {
    const customText = atom.config.get('iv-terminal.customTexts.customText3');
    handleCustomInsert(customText);
  },

  handleInsert4() {
    const customText = atom.config.get('iv-terminal.customTexts.customText4');
    handleCustomInsert(customText);
  },

  handleInsert5() {
    const customText = atom.config.get('iv-terminal.customTexts.customText5');
    handleCustomInsert(customText);
  },

  handleInsert6() {
    const customText = atom.config.get('iv-terminal.customTexts.customText6');
    handleCustomInsert(customText);
  },

  handleClear() {
    let terminal = atom.workspace.getActivePaneItem();

    calledFromTextEditor = atom.workspace.getActiveTextEditor();
    if (calledFromTextEditor) {
        filePath = calledFromTextEditor.buffer.getPath();
        terminal = activeTerminalSessions[filePath];
    }

    if (!terminal || terminal.isOpen == false) {
      return;
    }
    terminal.clear();
  },

  addViewProvider() {
    this.disposables.add(atom.views.addViewProvider(TerminalSession, (session) => {
      return new TerminalView(session).element;
    }));
  },

  addOpener() {
    this.disposables.add(atom.workspace.addOpener((uri) => {
      if (uri === TERMINAL_TAB_URI) {
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return new TerminalSession();
        } else {
          filePath = editor.buffer.getPath();
          newTermSess = new TerminalSession(filePath);
          activeTerminalSessions[filePath] = newTermSess;
          return newTermSess;
        }
      }
    }));
  },

  addCommands() {
    this.disposables.add(atom.commands.add('atom-workspace', {
      'iv-terminal:open': this.handleOpen.bind(this)
    }));
    this.disposables.add(atom.commands.add('terminal-view, atom-text-editor', {
        'iv-terminal:clear': this.handleClear.bind(this),
        'iv-terminal:insert-custom-text-1': this.handleInsert1.bind(this),
        'iv-terminal:insert-custom-text-2': this.handleInsert2.bind(this),
        'iv-terminal:insert-custom-text-3': this.handleInsert3.bind(this),
        'iv-terminal:insert-custom-text-4': this.handleInsert4.bind(this),
        'iv-terminal:insert-custom-text-5': this.handleInsert5.bind(this),
        'iv-terminal:insert-custom-text-6': this.handleInsert6.bind(this)
    }));
    this.disposables.add(atom.commands.add('terminal-view', {
      'iv-terminal:copy': this.handleCopy.bind(this),
      'iv-terminal:paste': this.handlePaste.bind(this),
      'iv-terminal:close': this.handleClose.bind(this)
    }));
  }

};
