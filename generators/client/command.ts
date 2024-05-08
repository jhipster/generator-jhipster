/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { testFrameworkTypes } from '../../jdl/jhipster/index.js';
import { JHipsterCommandDefinition } from '../base/api.js';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, clientFrameworkTypes } from '../../jdl/index.js';
import { GENERATOR_COMMON } from '../generator-list.js';

const { CYPRESS } = testFrameworkTypes;
const { ANGULAR, REACT, VUE, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;

const microfrontendsToPromptValue = answer => (Array.isArray(answer) ? answer.map(({ baseName }) => baseName).join(',') : answer);
const promptValueToMicrofrontends = answer =>
  answer
    ? answer
        .split(',')
        .map(baseName => baseName.trim())
        .filter(Boolean)
        .map(baseName => ({ baseName }))
    : [];

const command: JHipsterCommandDefinition = {
  options: {},
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
    },
    microfrontends: {
      description: 'Microfrontends to load',
      cli: {
        type: String,
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
    },
    clientTestFrameworks: {
      description: 'Client test frameworks',
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => [ANGULAR, REACT, VUE].includes(answers.clientFramework ?? config.clientFramework),
        type: 'checkbox',
        message: 'Besides Jest/Vitest, which testing frameworks would you like to use?',
        default: () => intersection([CYPRESS], config.testFrameworks),
      }),
      choices: [{ name: 'Cypress', value: CYPRESS }],
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
    },
    clientRootDir: {
      description: 'Client root',
      cli: {
        type: String,
      },
    },
  },
  import: [GENERATOR_COMMON],
};

export default command;
