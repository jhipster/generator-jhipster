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
import { JHipsterCommandDefinition } from '../base/api.js';
import { GENERATOR_JAVA, GENERATOR_LIQUIBASE, GENERATOR_SPRING_DATA_RELATIONAL } from '../generator-list.js';
import { APPLICATION_TYPE_MICROSERVICE } from '../../jdl/index.js';

const command: JHipsterCommandDefinition = {
  options: {
    fakeKeytool: {
      description: 'Add a fake certificate store file for test purposes',
      type: Boolean,
      env: 'FAKE_KEYTOOL',
      scope: 'generator',
      hide: true,
    },
  },
  configs: {
    feignClient: {
      description: 'Generate a feign client',
      cli: {
        type: Boolean,
      },
      prompt: {
        type: 'confirm',
        message: 'Do you want to generate a feign client?',
        when: currentAnswer =>
          currentAnswer.applicationType === APPLICATION_TYPE_MICROSERVICE &&
          currentAnswer.reactive !== undefined &&
          !currentAnswer.reactive,
      },
      default: false,
    },
    syncUserWithIdp: {
      description: 'Allow relationships with User for oauth2 applications',
      cli: {
        type: Boolean,
      },
      prompt: gen => ({
        type: 'confirm',
        message: 'Do you want to allow relationships with User entity?',
        when: ({ authenticationType }) => (authenticationType ?? gen.jhipsterConfigWithDefaults.authenticationType) === 'oauth2',
      }),
      default: false,
    },
    defaultPackaging: {
      description: 'Default packaging for the application',
      cli: {
        type: String,
        hide: true,
      },
      choices: ['jar', 'war'],
      default: 'jar',
      scope: 'storage',
    },
  },
  import: [GENERATOR_JAVA, GENERATOR_LIQUIBASE, GENERATOR_SPRING_DATA_RELATIONAL],
};

export default command;
