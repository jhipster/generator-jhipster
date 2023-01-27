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
import _ from 'lodash';

import { databaseTypes } from '../../jdl/jhipster/index.mjs';

const { H2_DISK, H2_MEMORY, NO: NO_DATABASE } = databaseTypes;

export default {
  prompting,
};

async function prompting() {
  const databaseType = this.databaseType;
  const prompts = [
    {
      name: 'cloudfoundryDeployedName',
      message: 'Name to deploy as:',
      default: this.baseName,
    },
    {
      type: 'list',
      name: 'cloudfoundryProfile',
      message: 'Which profile would you like to use?',
      choices: [
        {
          value: 'dev',
          name: 'dev',
        },
        {
          value: 'prod',
          name: 'prod',
        },
      ],
      default: 0,
    },
    {
      when: response => databaseType !== NO_DATABASE,
      name: 'cloudfoundryDatabaseServiceName',
      message: 'What is the name of your database service?',
      default: 'elephantsql',
    },
    {
      when: response => databaseType !== NO_DATABASE,
      name: 'cloudfoundryDatabaseServicePlan',
      message: 'What is the name of your database plan?',
      default: 'turtle',
    },
  ];

  const props = await this.prompt(prompts);

  this.cloudfoundryDeployedName = _.kebabCase(props.cloudfoundryDeployedName).split('-').join('');
  this.cloudfoundryProfile = props.cloudfoundryProfile;
  this.cloudfoundryDatabaseServiceName = props.cloudfoundryDatabaseServiceName;
  this.cloudfoundryDatabaseServicePlan = props.cloudfoundryDatabaseServicePlan;

  if ((this.devDatabaseType === H2_DISK || this.devDatabaseType === H2_MEMORY) && this.cloudfoundryProfile === 'dev') {
    this.logger.warn(chalk.yellow('\nH2 database will not work with development profile. Setting production profile.'));
    this.cloudfoundryProfile = 'prod';
  }
}
