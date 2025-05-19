import type { JHipsterCommandDefinition } from '../../lib/command/index.js';

const command = {
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
} as const satisfies JHipsterCommandDefinition;

export default command;
