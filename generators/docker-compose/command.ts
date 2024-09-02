import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const command: JHipsterCommandDefinition = {
  arguments: {
    appsFolders: {
      type: Array,
      description: 'Application folders',
    },
  },
  options: {},
};

export default command;
