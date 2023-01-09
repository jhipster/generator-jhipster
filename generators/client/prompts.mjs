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
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const NO_CLIENT_FRAMEWORK = clientFrameworkTypes.NO;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;

export async function askForClient({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const config = this.jhipsterConfigWithDefaults;
  const choices = [
    {
      value: ANGULAR,
      name: 'Angular',
    },
    {
      value: REACT,
      name: 'React',
    },
    {
      value: VUE,
      name: 'Vue',
    },
    {
      value: 'no',
      name: 'No client',
    },
  ];

  const answers = await this.prompt(
    {
      type: 'list',
      name: 'clientFramework',
      when: () => this.jhipsterConfig.applicationType !== 'microservice',
      message: `Which ${chalk.yellow('*Framework*')} would you like to use for the client?`,
      choices,
      default: config.clientFramework,
    },
    this.config
  );

  if (answers.clientFramework === NO_CLIENT_FRAMEWORK) {
    this.skipClient = this.jhipsterConfig.skipClient = true;
    this.cancelCancellableTasks();
  }
}

export async function askForClientTheme({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const config = this.jhipsterConfigWithDefaults;
  await this.prompt(
    {
      type: 'list',
      name: 'clientTheme',
      when: () => !this.jhipsterConfig.skipClient,
      message: 'Would you like to use a Bootswatch theme (https://bootswatch.com/)?',
      choices: async () => {
        const bootswatchChoices = await retrieveOnlineBootswatchThemes(this).catch(errorMessage => {
          this.warning(errorMessage);
          return retrieveLocalBootswatchThemes();
        });
        return [
          {
            value: 'none',
            name: 'Default JHipster',
          },
          ...bootswatchChoices,
        ];
      },
      default: config.clientTheme,
    },
    this.config
  );
}

export async function askForClientThemeVariant({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;
  if (this.jhipsterConfig.clientTheme === 'none') {
    return;
  }

  const config = this.jhipsterConfigWithDefaults;
  await this.prompt(
    {
      type: 'list',
      name: 'clientThemeVariant',
      when: () => !this.jhipsterConfig.skipClient,
      message: 'Choose a Bootswatch variant navbar theme (https://bootswatch.com/)?',
      choices: [
        { value: 'primary', name: 'Primary' },
        { value: 'dark', name: 'Dark' },
        { value: 'light', name: 'Light' },
      ],
      default: config.clientThemeVariant,
    },
    this.config
  );
}

export async function askForAdminUi({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const config = this.jhipsterConfigWithDefaults;
  await this.prompt(
    {
      type: 'confirm',
      name: 'withAdminUi',
      when: () => !this.jhipsterConfig.skipClient,
      message: 'Do you want to generate the admin UI?',
      default: config.withAdminUi,
    },
    this.config
  );
}

async function retrieveOnlineBootswatchThemes(generator) {
  return _retrieveBootswatchThemes(generator, true);
}

async function retrieveLocalBootswatchThemes(generator) {
  return _retrieveBootswatchThemes(generator, false);
}

async function _retrieveBootswatchThemes(generator, useApi) {
  const errorMessage = 'Could not fetch bootswatch themes from API. Using default ones.';
  if (!useApi) {
    return [
      { value: 'cerulean', name: 'Cerulean' },
      { value: 'cosmo', name: 'Cosmo' },
      { value: 'cyborg', name: 'Cyborg' },
      { value: 'darkly', name: 'Darkly' },
      { value: 'flatly', name: 'Flatly' },
      { value: 'journal', name: 'Journal' },
      { value: 'litera', name: 'Litera' },
      { value: 'lumen', name: 'Lumen' },
      { value: 'lux', name: 'Lux' },
      { value: 'materia', name: 'Materia' },
      { value: 'minty', name: 'Minty' },
      { value: 'morph', name: 'Morph' },
      { value: 'pulse', name: 'Pulse' },
      { value: 'quartz', name: 'Quartz' },
      { value: 'sandstone', name: 'Sandstone' },
      { value: 'simplex', name: 'Simplex' },
      { value: 'sketchy', name: 'Sketchy' },
      { value: 'slate', name: 'Slate' },
      { value: 'solar', name: 'Solar' },
      { value: 'spacelab', name: 'Spacelab' },
      { value: 'superhero', name: 'Superhero' },
      { value: 'united', name: 'United' },
      { value: 'vapor', name: 'Vapor' },
      { value: 'yeti', name: 'Yeti' },
      { value: 'zephyr', name: 'Zephyr' },
    ];
  }

  return new Promise((resolve, reject) => {
    generator.httpsGet(
      'https://bootswatch.com/api/5.json',

      body => {
        try {
          const { themes } = JSON.parse(body);

          const bootswatchChoices = themes.map(theme => ({
            value: theme.name.toLowerCase(),
            name: theme.name,
          }));

          resolve(bootswatchChoices);
        } catch (err) {
          reject(errorMessage);
        }
      },
      () => {
        reject(errorMessage);
      }
    );
  });
}
