/** @babel */

import { CompositeDisposable, Emitter } from 'atom';
import { spawn as spawnPty } from 'node-pty-prebuilt-multiarch';
import { Terminal as Xterm } from 'xterm';
import path from 'path';

function getLinkedEditor(filePath) {
  editors = atom.workspace.getTextEditors();
  for (var i in editors) {
    if (editors[i].buffer.getPath() == filePath) {
      return editors[i];
    }
  }
  return false;
}

//
// Terminal Session
//
// Maintains all of the essential state for a Terminal Tab.
//
export default class TerminalSession {

  constructor(filePath = "", config = {}) {
    this.isOpen = true;
    this.test = 0;
    this.filePath = filePath;
    this.config = config;
    this.disposables = new CompositeDisposable();
    this.emitter = new Emitter();
    this.pty = this.openPseudoterminal();
    this.xterm = new Xterm();

    this.handleEvents();
  }

  handleEvents() {

    // Process Terminal Input Events
    this.xterm.onData(data => this.pty.write(data));

    // Process Terminal Output Events
    this.pty.onData((data) => {
      if (this.xterm.element) {
        return this.xterm.write(data);
      }
    });

    // Process Terminal Exit Events
    this.pty.onExit(this.destroy.bind(this));

  }

  openPseudoterminal() {
    const shellArguments = this.shellArguments.split(/\s+/g).filter(arg => arg);

    return spawnPty(this.shellPath, shellArguments, {
      name: 'xterm-color',
      env: this.sanitizedEnvironment,
      cwd: this.workingDirectory
    });
  }

  //
  // Clears the contents of the terminal buffer. This is a simple proxy to the
  // `clear()` function on the Xterm instance.
  //
  clear() {
    this.xterm.clear();
  }

  //
  // Copies the current selection to the Atom clipboard.
  //
  copySelection() {
    const selectedText = this.xterm.getSelection();
    atom.clipboard.write(selectedText);
  }

  //
  // Pastes the contents of the Atom clipboard to the terminal (via the
  // pseudoterminal).
  //
  pasteFromClipboard() {
    const text = atom.clipboard.read();
    this.pty.write(text);
  }

  //
  // Insert the text param to the terminal (via the
  // pseudoterminal).
  //
  insertCustomText(customText) {
    text = customText;
    newLine = "\n";
    slash = "/";
    if (process.platform === 'win32') {
      newLine = "\r" + newLine;
      slash = "\\";
    }
    if (!atom.config.get('iv-terminal.customTexts.runInsertedText')) {
      newLine = "";
    }

    if (this.filePath != "") {
      dirName = path.dirname(this.filePath ? this.filePath : '.');
      baseName = path.basename(this.filePath ? this.filePath : '.');
      text = customText
        .replace(/\$P/, dirName+slash+baseName)
        .replace(/\$F/, baseName)
        .replace(/\$D/, dirName)
        .replace(/\$\$/, '$');

      if (atom.config.get('iv-terminal.customTexts.saveOnInsert')) {
        if (linkedEditor = getLinkedEditor(this.filePath)) {
          if (linkedEditor.isModified()) {
            this.editorSubscription = linkedEditor.onDidSave((event) => {
              this.editorSubscription.dispose();
              this.pty.write(text+newLine);
            });
            linkedEditor.save();
            return;
          }
        } else {
          infoString = "File couldn't be saved because the editor linked to the terminal \
                        doesn't appear to be opened.";
          atom.notifications.addInfo(infoString);
        }
      }
    }

    this.pty.write(text+newLine);
  }

  serialize() {
    return {
      deserializer: 'TerminalSession',
      config: {
        sanitizeEnvironment: this.sanitizedEnvironmentKeys,
        shellArgs: this.shellArguments,
        shellPath: this.shellPath,
        workingDirectory: this.workingDirectory
      },
      filePath: this.filePath
    };
  }

  destroy() {
    if (this.test < 1) {
      this.test = 1;
      this.isOpen = false;

      // Kill the Pseudoterminal (pty) Process
      if (this.pty) this.pty.kill();

      // Destroy the Terminal Instance
      if (this.xterm) this.xterm.dispose();

      // Notify any observers that this session is being destroyed.
      this.emitter.emit('did-destroy', this);

      // Clean up any disposables we're responsible for.
      this.emitter.dispose();
      this.disposables.dispose();
    }
  }

  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback);
  }

  //
  // Select a working directory for a new terminal.
  // Uses the project folder of the currently active file, if any,
  // otherwise falls back to the first project's folder, if any,
  // or the user's home directory.
  //
  _getWorkingDirectory() {
    if (this._workingDirectory) return this._workingDirectory;

    termDirectory = atom.config.get('iv-terminal.terminalDirectory');
    if (termDirectory != 'home') {

      if (this.filePath != "") {
        if (termDirectory == 'current-file') {
          return path.dirname(this.filePath);
        } else if (termDirectory == 'project-folder') {
          return atom.project.relativizePath(this.filePath)[0];
        }
      }

      const projectPaths = atom.project.getPaths();
      if (projectPaths.length > 0) {
        return path.resolve(projectPaths[0]);
      }
    }

    return path.resolve(process.env.HOME);
  }

  get sanitizedEnvironment() {
    const sanitizedEnvironment = Object.assign({}, process.env);
    const variablesToDelete = this.sanitizedEnvironmentKeys;

    if (variablesToDelete) {
      variablesToDelete.forEach((variable) => {
        delete sanitizedEnvironment[variable];
      });
    }

    return sanitizedEnvironment;
  }

  get shellPath() {
    if (this._shellPath) return this._shellPath;
    return this._shellPath = this.config.shellPath
      || atom.config.get('iv-terminal.shellSettings.shellPath')
      || process.env.SHELL
      || process.env.COMSPEC;
  }

  get shellArguments() {
    if (this._shellArguments) return this._shellArguments;
    return this._shellArguments = this.config.shellArgs
      || atom.config.get('iv-terminal.shellSettings.shellArgs')
      || '';
  }

  get sanitizedEnvironmentKeys() {
    if (this._sanitizedEnvironmentKeys) return this._sanitizedEnvironmentKeys;
    return this._sanitizedEnvironmentKeys = this.config.sanitizeEnvironment
      || atom.config.get('iv-terminal.shellSettings.sanitizeEnvironment');
  }

  get workingDirectory() {
    if (this._workingDirectory) return this._workingDirectory;
    return this._workingDirectory = this.config.workingDirectory
      || this._getWorkingDirectory();
  }

  getDefaultLocation() {
    return atom.config.get('iv-terminal.defaultLocation');
  }

  getIconName() {
    return 'terminal';
  }

  getTitle() {
    if (this.filePath != "") {
      let fileName = path.basename(this.filePath);
      return 'Terminal - ' + fileName;
    }
    return 'Terminal';
  }

}
