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
import type { JHipsterCommandDefinition, PromptSpec } from '../../lib/command/index.js';
import { GENERATOR_BASE, GENERATOR_COMMON, GENERATOR_SPRING_BOOT } from '../generator-list.js';
import {
  APPLICATION_TYPE_GATEWAY,
  APPLICATION_TYPE_MICROSERVICE,
  APPLICATION_TYPE_MONOLITH,
  applicationTypes,
  authenticationTypes,
  clientFrameworkTypes,
} from '../../lib/jhipster/index.js';
import { BASE_NAME_DESCRIPTION } from '../project-name/constants.js';
import { createBase64Secret, createSecret } from '../base/support/index.js';

const { ANGULAR, REACT, VUE, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;

const { OAUTH2, SESSION, JWT } = authenticationTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;

const command = {
  options: {
    jhiPrefix: {
      description: 'Add prefix before services, controllers and states name',
      type: String,
      scope: 'storage',
    },
    entitySuffix: {
      description: 'Add suffix after entities name',
      type: String,
      scope: 'storage',
    },
    dtoSuffix: {
      description: 'Add suffix after dtos name',
      type: String,
      scope: 'storage',
    },

    searchEngine: {
      description: 'Provide search engine for the application when skipping server side generation',
      type: String,
      scope: 'storage',
      choices: [
        { value: 'elasticsearch', name: 'Elasticsearch' },
        { value: 'couchbase', name: 'Couchbase' },
        { value: 'no', name: 'No search engine' },
      ],
    },
  },
  configs: {
    baseName: {
      description: BASE_NAME_DESCRIPTION,
      cli: {
        type: String,
      },
      prompt: gen => ({
        type: 'input',
        validate: input => gen.validateBaseName(input),
        message: 'What is the base name of your application?',
        default: () => gen.defaultBaseName(),
      }),
      scope: 'storage',
    },
    packageName: {
      cli: {
        type: String,
      },
      prompt: (gen): PromptSpec => ({
        type: 'input',
        message: 'What is your default Java package name?',
        default: gen.jhipsterConfigWithDefaults.packageName,
        validate: input =>
          /^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)
            ? true
            : 'The package name you have provided is not a valid Java package name.',
      }),
      scope: 'storage',
      description: 'The package name for the generated application',
    },
    applicationType: {
      description: 'Application type to generate',
      cli: {
        type: String,
      },
      prompt: {
        type: 'list',
        message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
      },
      choices: [
        {
          value: APPLICATION_TYPE_MONOLITH,
          name: 'Monolithic application (recommended for simple projects)',
        },
        {
          value: APPLICATION_TYPE_GATEWAY,
          name: 'Gateway application',
        },
        {
          value: APPLICATION_TYPE_MICROSERVICE,
          name: 'Microservice application',
        },
      ],
      scope: 'storage',
    },
    authenticationType: {
      cli: {
        name: 'auth',
        description: 'Provide authentication type for the application when skipping server side generation',
        type: String,
      },
      prompt: (gen, config) => ({
        type: 'list',
        message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
        choices: () =>
          gen.jhipsterConfigWithDefaults.applicationType !== MONOLITH
            ? (config.choices as any).filter(({ value }) => value !== SESSION)
            : config.choices,
        default: () => gen.jhipsterConfigWithDefaults.authenticationType,
      }),
      choices: [
        { value: 'jwt', name: 'JWT authentication (stateless, with a token)' },
        { value: 'oauth2', name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Keycloak and Okta)' },
        { value: 'session', name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)' },
      ],
      configure: gen => {
        const { jwtSecretKey, rememberMeKey, authenticationType, applicationType } = gen.jhipsterConfigWithDefaults;
        if (authenticationType === SESSION && !rememberMeKey) {
          gen.jhipsterConfig.rememberMeKey = createSecret();
        } else if (authenticationType === OAUTH2 && gen.jhipsterConfig.skipUserManagement === undefined) {
          gen.jhipsterConfig.skipUserManagement = true;
        } else if (
          jwtSecretKey === undefined &&
          (authenticationType === JWT || applicationType === MICROSERVICE || applicationType === GATEWAY)
        ) {
          gen.jhipsterConfig.jwtSecretKey = createBase64Secret(64, gen.options.reproducibleTests);
        }
      },
      scope: 'storage',
    },
    reactive: {
      cli: {
        description: 'Generate a reactive backend',
        type: Boolean,
      },
      prompt: gen => ({
        when: () => ['monolith', 'microservice'].includes(gen.jhipsterConfigWithDefaults.applicationType),
        type: 'confirm',
        message: 'Do you want to make it reactive with Spring WebFlux?',
      }),
      scope: 'storage',
    },
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
    databaseType: {
      cli: {
        type: String,
        hide: true,
      },
      choices: ['sql', 'mongodb', 'couchbase', 'cassandra', 'neo4j', 'no'],
      scope: 'storage',
    },
    prodDatabaseType: {
      cli: {
        type: String,
        hide: true,
      },
      choices: ['postgresql', 'mysql', 'mariadb', 'oracle', 'mssql'],
      scope: 'storage',
    },
  },

  import: [GENERATOR_BASE, GENERATOR_COMMON, GENERATOR_SPRING_BOOT],
} as const satisfies JHipsterCommandDefinition;

export default command;
