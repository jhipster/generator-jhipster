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
const dockerPrompts = require('../docker-prompts');

module.exports = {
  askForOpenShiftNamespace,
  askForStorageType,
  ...dockerPrompts,
};

async function askForOpenShiftNamespace() {
  if (this.regenerate) return;

  const prompts = [
    {
      type: 'input',
      name: 'openshiftNamespace',
      message: 'What should we use for the OpenShift namespace?',
      default: this.openshiftNamespace ? this.openshiftNamespace : 'default',
    },
  ];

  const props = await this.prompt(prompts);
  this.openshiftNamespace = props.openshiftNamespace;
}

async function askForStorageType() {
  if (this.regenerate) return;

  let storageEnabled = false;
  this.appConfigs.some((appConfig, index) => {
    if (appConfig.prodDatabaseType !== 'no' || appConfig.searchEngine === 'elasticsearch' || appConfig.monitoring === 'prometheus') {
      storageEnabled = true;
      return storageEnabled;
    }
    return false;
  });

  if (storageEnabled === false) {
    return;
  }

  // prompt this only when prodDatabaseType !== 'no' for any of the chosen apps
  const prompts = [
    {
      type: 'list',
      name: 'storageType',
      message: 'Which *type* of database storage would you like to use?',
      choices: [
        {
          value: 'persistent',
          name: 'Persistent Storage',
        },
        {
          value: 'ephemeral',
          name: 'Ephemeral Storage',
        },
      ],
      default: 'ephemeral',
    },
  ];

  const props = await this.prompt(prompts);
  this.storageType = props.storageType;
}
