/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import { ALPHANUMERIC_PATTERN } from '../../lib/constants/jdl.ts';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import authenticationTypes from '../../lib/jhipster/authentication-types.ts';
import { createBase64Secret, createSecret } from '../../lib/utils/secret.ts';

const { OAUTH2, SESSION, JWT } = authenticationTypes;

const command = {
  configs: {
    fakeKeytool: {
      description: 'Add a fake certificate store file for test purposes',
      cli: {
        type: Boolean,
        env: 'FAKE_KEYTOOL',
        hide: true,
      },
      scope: 'generator',
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
    serverPort: {
      prompt: gen => ({
        when: () => ['gateway', 'microservice'].includes(gen.jhipsterConfigWithDefaults.applicationType),
        type: 'input',
        validate: (input: string) => (/^(\d*)$/.test(input) ? true : 'This is not a valid port number.'),
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
        type: 'select',
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
        type: 'select',
        message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
        choices: () =>
          gen.jhipsterConfigWithDefaults.applicationType !== APPLICATION_TYPE_MONOLITH
            ? config.choices?.filter(choice => (typeof choice === 'string' ? choice : choice.value !== SESSION))
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
        } else if (
          jwtSecretKey === undefined &&
          (authenticationType === JWT || applicationType === APPLICATION_TYPE_MICROSERVICE || applicationType === APPLICATION_TYPE_GATEWAY)
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
          [APPLICATION_TYPE_MICROSERVICE].includes(gen.jhipsterConfigWithDefaults.applicationType) &&
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
        if (gen.jhipsterConfig.syncUserWithIdp && gen.jhipsterConfig.authenticationType !== OAUTH2) {
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
  },
  import: ['java', 'liquibase', 'jhipster:spring-data:relational', 'spring-cache', 'jhipster:spring-cloud'],
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
