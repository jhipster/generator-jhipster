import { existsSync } from 'fs';
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
    directoryPath: {
      cli: {
        type: String,
        description: 'Root directory where your applications are located',
      },
      prompt: gen => ({
        message: 'Enter the root directory where your applications are located',
        type: 'input',
        when: !gen.customWorkspacesConfig && !(gen.sharedWorkspaces.existingWorkspaces && !gen.options.askAnswered),
        validate: async input => {
          const path = gen.destinationPath(input);
          if (existsSync(path)) {
            const applications = await gen.findApplicationFolders(path);
            return applications.length === 0 ? `No application found in ${path}` : true;
          }
          return `${path} is not a directory or doesn't exist`;
        },
        default: () => '../',
      }),
      scope: 'storage',
    },
    appsFolders: {
      cli: {
        name: 'workspacesFolders',
        type: Array,
        default: [],
        description: 'Folders to use as monorepository workspace',
      },
      prompt: gen => ({
        message: 'Which applications do you want to include in your configuration?',
        type: 'checkbox',
        when: !gen.customWorkspacesConfig && !(gen.sharedWorkspaces.existingWorkspaces && !gen.options.askAnswered),
        validate: async input => {
          const path = gen.destinationPath(input);
          if (existsSync(path)) {
            const applications = await gen.findApplicationFolders(path);
            return applications.length === 0 ? `No application found in ${path}` : true;
          }
          return `${path} is not a directory or doesn't exist`;
        },
        choices: async () =>
          (await gen.findApplicationFolders(gen.directoryPath)).filter(app => app !== 'jhipster-registry' && app !== 'registry'),
        default: async () =>
          (await gen.findApplicationFolders(gen.directoryPath)).filter(app => app !== 'jhipster-registry' && app !== 'registry'),
      }),
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
