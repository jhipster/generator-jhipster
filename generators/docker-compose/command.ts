import { JHipsterCommandDefinition } from '../base/api.js';

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
