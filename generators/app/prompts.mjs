/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { packageJson as packagejs } from '../../lib/index.mjs';
import generatorsDefaults from '../generator-defaults.cjs';
import { applicationTypes, testFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { httpsGet } from '../base/logic/index.mjs';

const { appDefaultConfig, defaultConfigMicroservice } = generatorsDefaults;
const { GATEWAY, MONOLITH, MICROSERVICE } = applicationTypes;
const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;

export default {
  askForInsightOptIn,
  askForApplicationType,
  askForTestOpts,
  askForMoreModules,
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
        default: appDefaultConfig.applicationType,
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
        default: defaultConfigMicroservice.microfrontend,
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

  const choices = [];
  if (!this.skipClient) {
    // all client side test frameworks should be added here
    choices.push({ name: 'Cypress', value: CYPRESS });
  }
  if (!this.skipServer) {
    // all server side test frameworks should be added here
    choices.push({ name: 'Gatling', value: GATLING }, { name: 'Cucumber', value: CUCUMBER });
  }
  const PROMPT = {
    type: 'checkbox',
    name: 'testFrameworks',
    message: 'Besides JUnit and Jest, which testing frameworks would you like to use?',
    choices,
    default: appDefaultConfig.testFrameworks,
  };

  const answers = await this.prompt(PROMPT);
  this.testFrameworks = this.jhipsterConfig.testFrameworks = answers.testFrameworks;
}

export async function askForMoreModules({ control }) {
  if (control.existingProject && this.options.askAnswered !== true) return;

  await this.prompt({
    type: 'confirm',
    name: 'installModules',
    message: 'Would you like to install other generators from the JHipster Marketplace?',
    default: false,
  }).then(answers => {
    if (answers.installModules) {
      return new Promise(resolve => askModulesToBeInstalled(resolve, this));
    }
    return undefined;
  });
}

export function askModulesToBeInstalled(done, generator) {
  const jHipsterMajorVersion = packagejs.version.match(/^(\d+)/g);

  httpsGet(
    `https://api.npms.io/v2/search?q=keywords:jhipster-module+jhipster-${jHipsterMajorVersion}&from=0&size=50`,
    body => {
      try {
        const moduleResponse = JSON.parse(body);
        const choices = [];
        moduleResponse.results.forEach(modDef => {
          choices.push({
            value: { name: modDef.package.name, version: modDef.package.version },
            name: `(${modDef.package.name}-${modDef.package.version}) ${modDef.package.description}`,
          });
        });
        if (choices.length > 0) {
          generator
            .prompt({
              type: 'checkbox',
              name: 'otherModules',
              message: 'Which other modules would you like to use?',
              choices,
              default: [],
            })
            .then(answers => {
              // [ {name: [moduleName], version:[version]}, ...]
              answers.otherModules.forEach(module => {
                generator.otherModules = generator.otherModules || [];
                generator.otherModules.push({ name: module.name, version: module.version });
              });
              generator.jhipsterConfig.otherModules = generator.otherModules;
              done();
            });
        } else {
          done();
        }
      } catch (err) {
        generator.warning(`Error while parsing. Please install the modules manually or try again later. ${err.message}`);
        generator.debug('Error:', err);
        done();
      }
    },
    error => {
      generator.warning(`Unable to contact server to fetch additional modules: ${error.message}`);
      generator.debug('Error:', error);
      done();
    }
  );
}
