/** @babel */

export default {

  defaultLocation: {
    title: 'Default Location',
    description: 'Where to open new terminals. They will open in the bottom pane, by default.',
    type: 'string',
    default: 'bottom',
    enum: [
      { value: 'bottom', description: 'Bottom' },
      { value: 'center', description: 'Center' },
      { value: 'left', description: 'Left' },
      { value: 'right', description: 'Right' }
    ]
  },

  fontFamily: {
    title: 'Font Family',
    description: 'The name of the font family used for terminal text. By default, this matches the editor font family.',
    type: 'string',
    default: ''
  },

  matchTheme: {
    title: 'Match Theme',
    description: 'When enabled, the look of the terminal will match the currently configured Atom theme.',
    type: 'boolean',
    default: true
  },

  shellSettings: {
    type: 'object',
    properties: {

      sanitizeEnvironment: {
        title: 'Sanitized Environment Variables',
        description: 'Specify variables to remove from the environment in the terminal session. For example, the default behavior is to unset `NODE_ENV`, since Atom sets this to "production" on launch and may not be what you want when developing a Node application.',
        type: 'array',
        default: [ 'NODE_ENV' ]
      },

      shellPath: {
        title: 'Shell Path',
        description: 'Path to your shell application. Uses the $SHELL environment variable by default on *NIX and %COMSPEC% on Windows.',
        type: 'string',
        default: (() => {
          if (process.platform === 'win32') {
            return process.env.COMSPEC || 'cmd.exe';
          } else {
            return process.env.SHELL || '/bin/bash';
          }
        })()
      },

      shellArgs: {
        title: 'Shell Arguments',
        description: 'Arguments to send to the shell application on launch. Sends "--login" by default on *NIX and nothing on Windows.',
        type: 'string',
        default: (() => {
          if (process.platform !== 'win32' && process.env.SHELL === '/bin/bash') {
            return '--login';
          } else {
            return '';
          }
        })()
      }

    }
  },

  terminalDirectory: {
    title: 'Terminal Directory',
    description: 'What directory to open new terminals in. If you choose "Current File Folder" or "Project Folder" and the script fails to retrieve information about the linked file, it will fall back to the first project\'s folder (the topmost project-folder in tree-view). If there is no project-folder open it will instead fall back to the user\'s home directory',
    type: 'string',
    order: 1,
    default: 'current-file',
    enum: [
      { value: 'current-file', description: 'Current File Folder' },
      { value: 'project-folder', description: 'Project Folder' },
      { value: 'home', description: 'Home' }
    ]
  },

  customTexts: {
    type: 'object',
    description: '$F is replaced by file name, $D is replaced by file directory, $$ is replaced by $ and $P is replaced by absolute path to file (directory followed by filename). Use $P if you want to be able to always get the correct file, regardless of what directory you are currently located at inside the terminal.',
    order: 2,
    properties: {
      focusOnInsert: {
        title: 'Focus On Insert',
        description: 'When enabled, the terminal will be focused when using the insert command.',
        type: 'boolean',
        order: 1,
        default: true
      },
      runInsertedText: {
        title: 'Run Inserted Text',
        description: 'Run text inserted via \'iv-terminal:insert-custom-text\' as a command. **This will append an end-of-line character to input.**',
        type: 'boolean',
        order: 2,
        default: true
      },
      saveOnInsert: {
        title: 'Save On Insert',
        description: 'When enabled, the active file will be saved when using the insert command.',
        type: 'boolean',
        order: 3,
        default: true
      },
      customText1: {
        title: 'Custom text 1',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-1',
        type: 'string',
        default: ''
      },
      customText2: {
        title: 'Custom text 2',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-2',
        type: 'string',
        default: ''
      },
      customText3: {
        title: 'Custom text 3',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-3',
        type: 'string',
        default: ''
      },
      customText4: {
        title: 'Custom text 4',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-4',
        type: 'string',
        default: ''
      },
      customText5: {
        title: 'Custom text 5',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-5',
        type: 'string',
        default: ''
      },
      customText6: {
        title: 'Custom text 6',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-6',
        type: 'string',
        default: ''
      }
    }
  }
};
