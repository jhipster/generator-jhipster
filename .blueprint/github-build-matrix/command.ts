import type { JHipsterCommandDefinition } from '../../generators/index.js';

export default {
  configs: {
    workflow: {
      description: 'Workflow',
      argument: {
        type: String,
      },
      scope: 'generator',
      choices: ['testcontainers'],
    },
  },
} as const satisfies JHipsterCommandDefinition;
