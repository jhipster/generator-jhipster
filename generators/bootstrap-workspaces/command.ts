import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const command = {
  configs: {
    customWorkspacesConfig: {
      cli: {
        type: Boolean,
        hide: true,
      },
      description: 'Use custom configuration',
      scope: 'generator',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
