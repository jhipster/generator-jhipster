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
import { intersection } from 'lodash-es';

import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE } from '../../lib/core/application-types.ts';
import { clientFrameworkTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import { GENERATOR_COMMON } from '../generator-list.ts';

const { CYPRESS } = testFrameworkTypes;
const { ANGULAR, REACT, VUE, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;

const microfrontendsToPromptValue = (answer: string | { baseName: string }[]) =>
  Array.isArray(answer) ? answer.map(({ baseName }) => baseName).join(',') : answer;
const promptValueToMicrofrontends = (answer: string): { baseName: string }[] =>
  answer
    ? answer
        .split(',')
        .map(baseName => baseName.trim())
        .filter(Boolean)
        .map(baseName => ({ baseName }))
    : [];

const command = {
  configs: {
    clientFramework: {
      description: 'Provide client framework for the application',
      cli: {
        type: String,
      },
      prompt: generator => ({
        type: 'list',
        message: () =>
          generator.jhipsterConfigWithDefaults.applicationType === APPLICATION_TYPE_MICROSERVICE
            ? `Which ${chalk.yellow('*framework*')} would you like to use as microfrontend?`
            : `Which ${chalk.yellow('*framework*')} would you like to use for the client?`,
      }),
      choices: [
        { value: ANGULAR, name: 'Angular' },
        { value: REACT, name: 'React' },
        { value: VUE, name: 'Vue' },
        { value: CLIENT_FRAMEWORK_NO, name: 'No client' },
      ],
      scope: 'storage',
    },
    clientTheme: {
      cli: {
        type: String,
        hide: true,
      },
      scope: 'storage',
    },
    clientThemeVariant: {
      cli: {
        type: String,
        hide: true,
      },
      choices: [
        { value: 'primary', name: 'Primary' },
        { value: 'dark', name: 'Dark' },
        { value: 'light', name: 'Light' },
      ],
      scope: 'storage',
    },
    clientBundler: {
      cli: {
        type: String,
        hide: true,
      },
      choices: ['webpack', 'vite', 'experimentalEsbuild'],
      scope: 'storage',
    },
    clientBundlerName: {
      cli: { type: String, hide: true },
      scope: 'storage',
    },
    clientTestFramework: {
      cli: { type: String, hide: true },
      scope: 'storage',
    },
    clientTestFrameworkName: {
      cli: { type: String, hide: true },
      scope: 'storage',
    },
    devServerPort: {
      cli: {
        type: Number,
        hide: true,
      },
      scope: 'storage',
    },
    devServerPortProxy: {
      cli: {
        type: Number,
        hide: true,
      },
      scope: 'storage',
    },
    microfrontend: {
      description: 'Enable microfrontend support',
      cli: {
        type: Boolean,
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        type: 'confirm',
        when: answers =>
          [ANGULAR, REACT, VUE].includes(answers.clientFramework ?? config.clientFramework) &&
          config.applicationType === APPLICATION_TYPE_GATEWAY,
        message: `Do you want to enable ${chalk.yellow('*microfrontends*')}?`,
        default: false,
      }),
      scope: 'storage',
    },
    microfrontends: {
      description: 'Microfrontends to load',
      cli: {
        type: (val: string) => promptValueToMicrofrontends(val),
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => {
          const askForMicrofrontends = Boolean(
            (answers.microfrontend ?? config.microfrontend) &&
              (answers.applicationType ?? config.applicationType) === APPLICATION_TYPE_GATEWAY,
          );
          if (askForMicrofrontends && answers.microfrontends) {
            answers.microfrontends = microfrontendsToPromptValue(answers.microfrontends);
          } else {
            answers.microfrontends = [];
          }
          return askForMicrofrontends;
        },
        type: 'input',
        message: `Comma separated ${chalk.yellow('*microfrontend*')} app names.`,
        filter: promptValueToMicrofrontends,
        transformer: microfrontendsToPromptValue,
      }),
      scope: 'storage',
    },
    clientTestFrameworks: {
      description: 'Client test frameworks',
      cli: {
        type: Array,
        hide: true,
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => [ANGULAR, REACT, VUE].includes(answers.clientFramework ?? config.clientFramework),
        type: 'checkbox',
        message: 'Besides Jest/Vitest, which testing frameworks would you like to use?',
        default: () => intersection([CYPRESS], config.testFrameworks),
      }),
      choices: [{ name: 'Cypress', value: CYPRESS }],
      scope: 'storage',
    },
    withAdminUi: {
      description: 'Generate administrative user interface',
      cli: {
        type: Boolean,
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        type: 'confirm',
        when: answers => [ANGULAR, REACT, VUE].includes(answers.clientFramework ?? config.clientFramework),
        message: 'Do you want to generate the admin UI?',
      }),
      scope: 'storage',
    },
    clientRootDir: {
      description: 'Client root',
      cli: {
        type: String,
      },
      scope: 'storage',
    },
  },
  import: [GENERATOR_COMMON],
} as const satisfies JHipsterCommandDefinition;

export default command;
