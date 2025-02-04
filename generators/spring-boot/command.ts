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
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { GENERATOR_JAVA, GENERATOR_LIQUIBASE, GENERATOR_SPRING_DATA_RELATIONAL } from '../generator-list.js';
import { createBase64Secret, createSecret } from '../base/support/secret.js';
import { applicationTypes, authenticationTypes } from '../../lib/jhipster/index.js';

const { OAUTH2, SESSION, JWT } = authenticationTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;

const ALPHANUMERIC_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

const command = {
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
    serverPort: {
      prompt: gen => ({
        when: () => ['gateway', 'microservice'].includes(gen.jhipsterConfigWithDefaults.applicationType),
        type: 'input',
        validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
        message:
          'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
        default: () => gen.jhipsterConfigWithDefaults.serverPort,
      }),
      configure: gen => {
        if (gen.jhipsterConfig.serverPort === undefined && gen.jhipsterConfig.applicationIndex !== undefined) {
          gen.jhipsterConfig.serverPort = 8080 + gen.jhipsterConfig.applicationIndex;
        }
      },
      scope: 'storage',
    },
    serviceDiscoveryType: {
      cli: {
        description: 'Service discovery type',
        type: String,
      },
      prompt: gen => ({
        when: () => ['gateway', 'microservice'].includes(gen.jhipsterConfigWithDefaults.applicationType),
        type: 'list',
        message: 'Which service discovery server do you want to use?',
        default: 'consul',
      }),
      choices: [
        { value: 'consul', name: 'Consul (recommended)' },
        { value: 'eureka', name: 'JHipster Registry (legacy, uses Eureka, provides Spring Cloud Config support)' },
        { value: 'no', name: 'No service discovery' },
      ],
      scope: 'storage',
    },
    jwtSecretKey: {
      cli: {
        type: String,
        env: 'JHI_JWT_SECRET_KEY',
        hide: true,
      },
      scope: 'storage',
    },
    rememberMeKey: {
      cli: {
        type: String,
        hide: true,
      },
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
    feignClient: {
      description: 'Generate a feign client',
      cli: {
        type: Boolean,
      },
      prompt: gen => ({
        type: 'confirm',
        message: 'Do you want to generate a feign client?',
        when: ({ reactive }) =>
          [MICROSERVICE].includes(gen.jhipsterConfigWithDefaults.applicationType) &&
          (reactive ?? gen.jhipsterConfigWithDefaults.reactive) === false,
      }),
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      default: false,
      scope: 'storage',
    },
    syncUserWithIdp: {
      description: 'Allow relationships with User for oauth2 applications',
      cli: {
        type: Boolean,
      },
      prompt: gen => ({
        type: 'confirm',
        message: 'Do you want to allow relationships with User entity?',
        when: ({ authenticationType }) => (authenticationType ?? gen.jhipsterConfigWithDefaults.authenticationType) === OAUTH2,
      }),
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      configure: gen => {
        if (gen.jhipsterConfig.syncUserWithIdp === undefined && gen.jhipsterConfigWithDefaults.authenticationType === OAUTH2) {
          if (gen.isJhipsterVersionLessThan('8.1.1')) {
            gen.jhipsterConfig.syncUserWithIdp = true;
          }
        } else if (gen.jhipsterConfig.syncUserWithIdp && gen.jhipsterConfig.authenticationType !== OAUTH2) {
          throw new Error('syncUserWithIdp is only supported with authenticationType oauth2');
        }
      },
      scope: 'storage',
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
      configure: gen => {
        if (process.env.JHI_WAR === '1') {
          gen.jhipsterConfig.defaultPackaging = 'war';
        }
      },
    },
    databaseType: {
      cli: {
        type: String,
        hide: true,
      },
      choices: ['sql', 'mongodb', 'couchbase', 'cassandra', 'neo4j', 'no'],
      scope: 'storage',
    },
    messageBroker: {
      description: 'message broker',
      cli: {
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      choices: ['kafka', 'pulsar', 'no'],
      scope: 'storage',
    },
    databaseMigration: {
      description: 'Database migration',
      cli: {
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      choices: ['liquibase', 'no'],
      scope: 'storage',
    },
    graalvmSupport: {
      description: 'Experimental GraalVM Native support',
      cli: {
        type: Boolean,
      },
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      scope: 'storage',
    },
  },
  import: [GENERATOR_JAVA, GENERATOR_LIQUIBASE, GENERATOR_SPRING_DATA_RELATIONAL, 'jhipster:spring-cloud:gateway'],
} as const satisfies JHipsterCommandDefinition;

export default command;
