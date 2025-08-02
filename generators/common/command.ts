/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.ts';
import { applicationTypesChoices } from '../../lib/core/application-types.ts';

const command = {
  configs: {
    defaultEnvironment: {
      description: 'Default environment for the application',
      cli: {
        type: String,
        hide: true,
        env: 'JHI_PROFILE',
      },
      choices: ['prod', 'dev'],
      default: 'prod',
      scope: 'storage',
    },
    skipClient: {
      cli: {
        description: 'Skip the client-side application generation',
        type: Boolean,
      },
      scope: 'storage',
    },
    skipServer: {
      cli: {
        description: 'Skip the server-side application generation',
        type: Boolean,
      },
      scope: 'storage',
    },
    skipUserManagement: {
      description: 'Skip the user management module during app generation',
      cli: {
        type: Boolean,
      },
      scope: 'storage',
    },
    applicationType: {
      description: 'Application type to generate',
      cli: {
        type: String,
      },
      prompt: {
        type: 'list',
        message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
      },
      choices: applicationTypesChoices,
      scope: 'storage',
    },
  },
  import: [GENERATOR_BOOTSTRAP_APPLICATION_BASE, 'jhipster:javascript:prettier', 'jhipster:javascript:husky'],
} as const satisfies JHipsterCommandDefinition;

export default command;
