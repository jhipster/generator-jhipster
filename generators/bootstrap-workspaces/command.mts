import { JHipsterCommandDefinition } from '../base/api.mjs';

const command: JHipsterCommandDefinition = {
  options: {
    customWorkspacesConfig: {
      type: Boolean,
      description: 'Use custom configuration',
      scope: 'generator',
      hide: true,
    },
  },
};

export default command;
