/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import statistics from '../statistics.cjs';

import { applicationTypes, testFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const { GATEWAY, MONOLITH, MICROSERVICE } = applicationTypes;
const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;

export default {
  askForInsightOptIn,
  askForApplicationType,
  askForTestOpts,
};

export async function askForInsightOptIn() {
  if (!statistics.shouldWeAskForOptIn()) return;
  const answers = await this.prompt({
    type: 'confirm',
    name: 'insight',
    message: `May ${chalk.cyan('JHipster')} anonymously report usage statistics to improve the tool over time?`,
    default: true,
  });
  if (answers.insight !== undefined) {
    statistics.setOptOutStatus(!answers.insight);
  }
}

const microfrontendsToPromptValue = answer => (Array.isArray(answer) ? answer.map(({ baseName }) => baseName).join(',') : answer);
const promptValueToMicrofrontends = answer =>
  answer
    ? answer
        .split(',')
        .map(baseName => baseName.trim())
        .filter(Boolean)
        .map(baseName => ({ baseName }))
    : [];

export async function askForApplicationType({ control }) {
  if (control.existingProject && this.options.askAnswered !== true) return;
  const config = this.jhipsterConfigWithDefaults;

  const applicationTypeChoices = [
    {
      value: MONOLITH,
      name: 'Monolithic application (recommended for simple projects)',
    },
    {
      value: GATEWAY,
      name: 'Gateway application',
    },
    {
      value: MICROSERVICE,
      name: 'Microservice application',
    },
  ];

  await this.prompt(
    [
      {
        type: 'list',
        name: 'applicationType',
        message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
        choices: applicationTypeChoices,
        default: config.applicationType,
      },
      {
        when: answers => {
          const { applicationType } = answers;
          const askForMicrofrontend = [GATEWAY, MICROSERVICE].includes(applicationType);
          if (!askForMicrofrontend) {
            answers.microfrontend = false;
          }
          return askForMicrofrontend;
        },
        type: 'confirm',
        name: 'microfrontend',
        message: `Do you want to enable ${chalk.yellow('*microfrontends*')}?`,
        default: config.microfrontend,
      },
      {
        when: answers => {
          const { applicationType, microfrontend, microfrontends } = answers;
          const askForMicrofrontends = applicationType === GATEWAY && microfrontend;
          if (askForMicrofrontends) {
            answers.microfrontends = microfrontendsToPromptValue(microfrontends);
          } else {
            answers.microfrontends = [];
          }
          return askForMicrofrontends;
        },
        type: 'input',
        name: 'microfrontends',
        message: `Comma separated ${chalk.yellow('*microfrontend*')} app names.`,
        filter: promptValueToMicrofrontends,
        transformer: microfrontendsToPromptValue,
      },
    ],
    this.config
  );

  const { applicationType } = this.jhipsterConfig;
  // TODO drop for v8, setting the generator with config is deprecated
  this.applicationType = applicationType;
}

export async function askForTestOpts({ control }) {
  if (control.existingProject && this.options.askAnswered !== true) return;

  const config = this.jhipsterConfigWithDefaults;
  const choices = [];
  if (!config.skipClient) {
    // all client side test frameworks should be added here
    choices.push({ name: 'Cypress', value: CYPRESS });
  }
  if (!config.skipServer) {
    // all server side test frameworks should be added here
    choices.push({ name: 'Gatling', value: GATLING }, { name: 'Cucumber', value: CUCUMBER });
  }
  const PROMPT = {
    type: 'checkbox',
    name: 'testFrameworks',
    message: 'Besides JUnit and Jest, which testing frameworks would you like to use?',
    choices,
    default: config.testFrameworks,
  };

  const answers = await this.prompt(PROMPT);
  this.testFrameworks = this.jhipsterConfig.testFrameworks = answers.testFrameworks;
}
