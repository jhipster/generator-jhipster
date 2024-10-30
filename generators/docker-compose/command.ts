import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const command: JHipsterCommandDefinition = {
  arguments: {
    appsFolders: {
      type: Array,
      description: 'Application folders',
    },
  },
  configs: {
    jwtSecretKey: {
      cli: {
        type: String,
        env: 'JHI_JWT_SECRET_KEY',
      },
      scope: 'generator',
    },
  },
};

export default command;
