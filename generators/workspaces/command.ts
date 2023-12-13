import { JHipsterCommandDefinition } from '../base/api.js';
import { GENERATOR_APP, GENERATOR_GIT } from '../generator-list.js';

const command: JHipsterCommandDefinition = {
  options: {
    appsFolders: {
      name: 'workspacesFolders',
      type: Array,
      description: 'Folders to use as monorepository workspace',
      default: [],
      scope: 'generator',
    },
    workspaces: {
      type: Boolean,
      description: 'Generate workspaces for multiples applications',
      scope: 'generator',
    },
    generateApplications: {
      type: Function,
      scope: 'generator',
      hide: true,
    },
    generateWith: {
      type: String,
      default: GENERATOR_APP,
      scope: 'generator',
      hide: true,
    },
  },
  import: [GENERATOR_GIT],
};

export default command;
