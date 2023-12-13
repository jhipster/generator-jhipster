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
import * as _ from 'lodash-es';
import { JDLApplicationConfig, JHipsterOptionDefinition } from '../../../jdl/types/types.js';
import databaseMigrationOption from '../options/database-migration.js';
import messageBrokerOption from '../options/message-broker.js';
import { feignClientDefinition } from '../options/index.js';

const { upperCase, snakeCase } = _;

const jdlOptions: JHipsterOptionDefinition[] = [databaseMigrationOption, messageBrokerOption, feignClientDefinition];

const applicationConfig: JDLApplicationConfig = {
  tokenConfigs: jdlOptions.map(option => ({
    name: upperCase(snakeCase(option.name)),
    pattern: option.name,
  })),
  validatorConfig: Object.fromEntries(
    jdlOptions.map(option => [
      upperCase(snakeCase(option.name)),
      {
        type: option.tokenType,
        pattern: option.tokenValuePattern,
        msg: `${option.name} property`,
      },
    ]),
  ),
  optionsValues: Object.fromEntries(
    jdlOptions
      .filter(option => option.knownChoices)
      .map(option => [option.name, Object.fromEntries(option.knownChoices!.map(choice => [choice, choice]))]),
  ),
  optionsTypes: Object.fromEntries(
    jdlOptions.map(option => [
      option.name,
      {
        type: messageBrokerOption.type,
      },
    ]),
  ),
};

export default applicationConfig;
