/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const constants = require('../generator-constants');
const { clientDefaultConfig } = require('../generator-defaults');
const clientFrameworks = require('../../jdl/jhipster/client-framework-types');

const NO_CLIENT_FRAMEWORK = clientFrameworks.NO;

const { ANGULAR, REACT, VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

module.exports = {
  askForModuleName,
  askForClient,
  askForAdminUi,
  askForClientTheme,
  askForClientThemeVariant,
};

async function askForModuleName() {
  if (this.jhipsterConfig.baseName) return;

  await this.askModuleName(this);
}

async function askForClient() {
  if (this.existingProject) return;

  const applicationType = this.applicationType;

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

  const answers = await this.prompt({
    type: 'list',
    name: 'clientFramework',
    when: () => applicationType !== 'microservice',
    message: `Which ${chalk.yellow('*Framework*')} would you like to use for the client?`,
    choices,
    default: clientDefaultConfig.clientFramework,
  });

  this.clientFramework = this.jhipsterConfig.clientFramework = answers.clientFramework;
  if (this.clientFramework === NO_CLIENT_FRAMEWORK) {
    this.skipClient = this.jhipsterConfig.skipClient = true;
  }
}

async function askForClientTheme() {
  if (this.existingProject) {
    return;
  }

  const self = this;
  const skipClient = this.skipClient;
  const defaultJHipsterChoices = [
    {
      value: 'none',
      name: 'Default JHipster',
    },
  ];

  const bootswatchChoices = await retrieveOnlineBootswatchThemes(self).catch(errorMessage => {
    self.warning(errorMessage);
    return retrieveLocalBootswatchThemes();
  });
  const answers = await this.prompt({
    type: 'list',
    name: 'clientTheme',
    when: () => !skipClient,
    message: 'Would you like to use a Bootswatch theme (https://bootswatch.com/)?',
    choices: [...defaultJHipsterChoices, ...bootswatchChoices],
    default: clientDefaultConfig.clientTheme,
  });

  this.clientTheme = this.jhipsterConfig.clientTheme = answers.clientTheme;
}

async function askForClientThemeVariant() {
  if (this.existingProject) {
    return;
  }
  if (this.clientTheme === 'none') {
    this.clientThemeVariant = '';
    return;
  }

  const skipClient = this.skipClient;

  const choices = [
    { value: 'primary', name: 'Primary' },
    { value: 'dark', name: 'Dark' },
    { value: 'light', name: 'Light' },
  ];

  const answers = await this.prompt({
    type: 'list',
    name: 'clientThemeVariant',
    when: () => !skipClient,
    message: 'Choose a Bootswatch variant navbar theme (https://bootswatch.com/)?',
    choices,
    default: clientDefaultConfig.clientThemeVariant,
  });

  this.clientThemeVariant = this.jhipsterConfig.clientThemeVariant = answers.clientThemeVariant;
}

async function askForAdminUi() {
  if (this.existingProject) {
    return;
  }

  const skipClient = this.skipClient;

  const answers = await this.prompt({
    type: 'confirm',
    name: 'withAdminUi',
    when: () => !skipClient,
    message: 'Do you want to generate the admin UI?',
    default: clientDefaultConfig.withAdminUi,
  });

  this.withAdminUi = this.jhipsterConfig.withAdminUi = answers.withAdminUi;
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
      { value: 'cerulean', name: 'Cyborg' },
      { value: 'darkly', name: 'Darkly' },
      { value: 'flatly', name: 'Flatly' },
      { value: 'journal', name: 'Journal' },
      { value: 'litera', name: 'Litera' },
      { value: 'lumen', name: 'Lumen' },
      { value: 'lux', name: 'Lux' },
      { value: 'materia', name: 'Materia' },
      { value: 'minty', name: 'Minty' },
      { value: 'pulse', name: 'Pulse' },
      { value: 'sandstone', name: 'Sandstone' },
      { value: 'simplex', name: 'Simplex' },
      { value: 'sketchy', name: 'Sketchy' },
      { value: 'slate', name: 'Slate' },
      { value: 'solar', name: 'Solar' },
      { value: 'spacelab', name: 'Spacelab' },
      { value: 'superhero', name: 'Superhero' },
      { value: 'united', name: 'United' },
      { value: 'yeti', name: 'Yeti' },
    ];
  }

  return new Promise((resolve, reject) => {
    generator.httpsGet(
      'https://bootswatch.com/api/4.json',

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
