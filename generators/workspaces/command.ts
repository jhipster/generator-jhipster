import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { GENERATOR_APP, GENERATOR_GIT } from '../generator-list.js';

const command = {
  configs: {
    appsFolders: {
      cli: {
        name: 'workspacesFolders',
        type: Array,
        default: [],
      },
      description: 'Folders to use as monorepository workspace',
      scope: 'storage',
    },
    entrypointGenerator: {
      description: 'Entrypoint generator to be used',
      cli: {
        type: String,
        hide: true,
      },
      scope: 'generator',
    },
    workspaces: {
      cli: {
        type: Boolean,
      },
      description: 'Generate workspaces for multiples applications',
      scope: 'generator',
    },
    generateApplications: {
      cli: {
        type: Function,
        hide: true,
      },
      scope: 'generator',
    },
    generateWith: {
      cli: {
        type: String,
        default: GENERATOR_APP,
        hide: true,
      },
      scope: 'generator',
    },
  },
  import: [GENERATOR_GIT],
} as const satisfies JHipsterCommandDefinition;

export default command;
