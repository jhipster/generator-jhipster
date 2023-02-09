import { JHipsterCommandDefinition } from '../base/api.mjs';
import { GENERATOR_APP, GENERATOR_WORKSPACES } from '../generator-list.mjs';

const command: JHipsterCommandDefinition = {
  arguments: {
    jdlFiles: {
      type: Array,
    },
  },
  options: {
    interactive: {
      description:
        'Generate multiple applications in series so that questions can be interacted with. This is the default when there is an existing application configuration in any of the folders',
      type: Boolean,
      scope: 'generator',
    },
    jsonOnly: {
      description: 'Generate only the JSON files and skip entity regeneration',
      type: Boolean,
      scope: 'generator',
    },
    ignoreApplication: {
      description: 'Ignores application generation',
      type: Boolean,
      scope: 'generator',
    },
    ignoreDeployments: {
      description: 'Ignores deployments generation',
      type: Boolean,
      scope: 'generator',
    },
    skipSampleRepository: {
      description: 'Disable fetching sample files when the file is not a URL',
      type: Boolean,
      scope: 'generator',
    },
    inline: {
      description: 'Pass JDL content inline. Argument can be skipped when passing this',
      type: String,
      scope: 'generator',
    },
    skipUserManagement: {
      description: 'Skip the user management module during app generation',
      type: Boolean,
      scope: 'generator',
    },
    unidirectionalRelationships: {
      description: 'Generate unidirectional relationships',
      type: Boolean,
      scope: 'generator',
    },
    forceNoFiltering: {
      description: "Don't filter jdl entities",
      type: Boolean,
      scope: 'generator',
    },
  },
  import: [GENERATOR_APP, GENERATOR_WORKSPACES],
};

export default command;
