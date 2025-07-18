import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

export const workflowChoices = ['angular', 'devserver', 'graalvm', 'react', 'docker-compose-integration', 'vue'] as const;
export const eventNameChoices = ['push', 'pull_request', 'daily'] as const;

export default {
  configs: {
    workflow: {
      description: 'Workflow',
      argument: {
        type: String,
      },
      scope: 'generator',
      choices: workflowChoices,
    },
    eventName: {
      cli: {
        type: String,
      },
      scope: 'generator',
      choices: eventNameChoices,
    },
  },
} as const satisfies JHipsterCommandDefinition;
