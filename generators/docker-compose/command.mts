import { JHipsterCommandDefinition } from '../base/api.mjs';

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
