import { JHipsterCommandDefinition } from '../base/api.mjs';

const command: JHipsterCommandDefinition = {
  options: {
    regenerate: {
      name: 'skipPrompts',
      type: Boolean,
      description: 'Generate pre-existing configuration',
      scope: 'generator',
    },
  },
};

export default command;
