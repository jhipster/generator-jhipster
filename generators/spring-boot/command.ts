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
import { intersection } from 'lodash-es';

import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import { ALPHANUMERIC_PATTERN } from '../../lib/constants/jdl.ts';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import authenticationTypes from '../../lib/jhipster/authentication-types.ts';
import { cacheTypes, databaseTypes, testFrameworkTypes } from '../../lib/jhipster/index.ts';
import { createBase64Secret, createSecret } from '../../lib/utils/secret.ts';
import serverCommand from '../server/command.ts';
import { R2DBC_DB_OPTIONS, SQL_DB_OPTIONS } from '../server/support/database.ts';

import cacheCommand from './generators/cache/command.ts';

const { OAUTH2, SESSION, JWT } = authenticationTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS, NO: NO_CACHE_PROVIDER } = cacheTypes;
const { CASSANDRA, COUCHBASE, H2_DISK, H2_MEMORY, MONGODB, NEO4J, SQL, NO: NO_DATABASE } = databaseTypes;
const { GATLING, CUCUMBER } = testFrameworkTypes;

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
      internal: {
        alias: 'serviceDiscovery',
        type: String,
      },
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
          gen.jhipsterConfigWithDefaults.applicationType === APPLICATION_TYPE_MONOLITH ?
            config.choices
          : config.choices?.filter(choice => (typeof choice === 'string' ? choice : choice.value !== SESSION)),
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
    serverTestFrameworks: {
      description: 'Server test frameworks',
      cli: {
        type: Array,
        hide: true,
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        type: 'checkbox',
        message: 'Besides JUnit, which testing frameworks would you like to use?',
        default: () => intersection([GATLING, CUCUMBER], config.testFrameworks),
      }),
      choices: [
        { name: 'Gatling', value: GATLING },
        { name: 'Cucumber', value: CUCUMBER },
      ],
      scope: 'storage',
    },
    databaseType: {
      ...serverCommand.configs.databaseType,
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        type: 'select',
        message: `Which ${chalk.yellow('*type*')} of database would you like to use?`,
        choices: answers => {
          const reactive = answers.reactive ?? config.reactive;
          const authenticationType = answers.authenticationType ?? config.authenticationType;
          const choices: { value: string; name: string }[] = [
            {
              value: SQL,
              name: reactive ? 'SQL (H2, PostgreSQL, MySQL, MariaDB, MSSQL)' : 'SQL (H2, PostgreSQL, MySQL, MariaDB, Oracle, MSSQL)',
            },
            { value: MONGODB, name: 'MongoDB' },
          ];
          if (authenticationType !== OAUTH2) {
            choices.push({ value: CASSANDRA, name: 'Cassandra' });
          }
          choices.push(
            { value: COUCHBASE, name: '[BETA] Couchbase' },
            { value: NEO4J, name: '[BETA] Neo4j' },
            { value: NO_DATABASE, name: 'No database' },
          );
          return choices;
        },
      }),
    },
    prodDatabaseType: {
      ...serverCommand.configs.prodDatabaseType,
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => (answers.databaseType ?? config.databaseType) === SQL,
        type: 'select',
        message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
        choices: answers => ((answers.reactive ?? config.reactive) ? R2DBC_DB_OPTIONS : SQL_DB_OPTIONS),
      }),
    },
    devDatabaseType: {
      ...serverCommand.configs.devDatabaseType,
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => (answers.databaseType ?? config.databaseType) === SQL,
        type: 'select',
        message: `Which ${chalk.yellow('*development*')} database would you like to use?`,
        choices: answers => {
          const prodDatabaseType = answers.prodDatabaseType ?? config.prodDatabaseType;
          const currentDatabase = SQL_DB_OPTIONS.find(it => it.value === prodDatabaseType)!;
          return [
            { ...currentDatabase, name: `${currentDatabase.name} (requires Docker or manually configured database)` },
            { value: H2_DISK, name: 'H2 with disk-based persistence' },
            { value: H2_MEMORY, name: 'H2 with in-memory persistence' },
          ];
        },
      }),
    },
    syncUserWithIdp: {
      description: 'Allow relationships with User for oauth2 applications',
      cli: {
        type: Boolean,
      },
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        type: 'confirm',
        message: 'Do you want to allow relationships with User entity?',
        when: ({ authenticationType, databaseType }) =>
          (authenticationType ?? config.authenticationType) === OAUTH2 && (databaseType ?? config.databaseType) !== NO_DATABASE,
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
    cacheProvider: {
      ...cacheCommand.configs.cacheProvider,
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => !(answers.reactive ?? config.reactive),
        type: 'select',
        message: 'Which cache do you want to use? (Spring cache abstraction)',
        choices: [
          { value: EHCACHE, name: 'Ehcache (local cache, for a single node)' },
          { value: CAFFEINE, name: 'Caffeine (local cache, for a single node)' },
          { value: HAZELCAST, name: 'Hazelcast (distributed cache for multiple nodes)' },
          { value: INFINISPAN, name: 'Infinispan (hybrid cache, for multiple nodes)' },
          {
            value: MEMCACHED,
            name: 'Memcached (distributed cache) - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
          },
          { value: REDIS, name: 'Redis (distributed cache)' },
          {
            value: NO_CACHE_PROVIDER,
            name: 'No cache - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
          },
        ],
      }),
    },
    enableHibernateCache: {
      ...cacheCommand.configs.enableHibernateCache,
      prompt: ({ jhipsterConfigWithDefaults: config }) => ({
        when: answers => {
          const reactive = answers.reactive ?? config.reactive;
          const databaseType = answers.databaseType ?? config.databaseType;
          if (reactive || databaseType !== SQL) {
            return false;
          }
          const cacheProvider = answers.cacheProvider ?? config.cacheProvider;
          return cacheProvider !== NO_CACHE_PROVIDER && cacheProvider !== MEMCACHED;
        },
        type: 'confirm',
        message: 'Do you want to use Hibernate 2nd level cache?',
      }),
    },
    serverSideOptions: {
      description: 'Other server side technologies',
      cli: {
        type: Array,
        hide: true,
      },
      prompt: ({ jhipsterConfig, jhipsterConfigWithDefaults: config }) => {
        const selectedChoices = (['websocket', 'searchEngine', 'messageBroker', 'enableSwaggerCodegen'] as const)
          .filter(property => jhipsterConfig[property] !== undefined)
          .map(property => `${property}:${jhipsterConfig[property]}`);
        return {
          type: 'checkbox',
          message: 'Which other technologies would you like to use?',
          choices: answers => {
            const reactive = answers.reactive ?? config.reactive;
            const databaseType = answers.databaseType ?? config.databaseType;
            const choices: { value: string; name: string; checked?: boolean }[] = [];
            if (databaseType === SQL || databaseType === MONGODB || databaseType === NEO4J) {
              choices.push({ value: 'searchEngine:elasticsearch', name: 'Elasticsearch as search engine' });
            }
            if (databaseType === COUCHBASE) {
              choices.push({ value: 'searchEngine:couchbase', name: 'Couchbase FTS as search engine' });
            }
            if (
              !reactive &&
              (config.applicationType === APPLICATION_TYPE_MONOLITH || config.applicationType === APPLICATION_TYPE_GATEWAY)
            ) {
              choices.push({ value: 'websocket:spring-websocket', name: 'WebSockets using Spring Websocket' });
            }
            choices.push(
              { value: 'messageBroker:kafka', name: 'Apache Kafka as asynchronous messages broker' },
              { value: 'messageBroker:pulsar', name: 'Apache Pulsar as asynchronous messages broker' },
              { value: 'enableSwaggerCodegen:true', name: 'API first development using OpenAPI-generator' },
            );
            return choices.map(choice => ({ ...choice, checked: selectedChoices.includes(choice.value) }));
          },
          default: selectedChoices,
        };
      },
      configure: gen => {
        const serverSideOptions = gen.serverSideOptions as string[] | undefined;
        if (serverSideOptions) {
          Object.assign(
            gen.jhipsterConfig,
            Object.fromEntries(
              serverSideOptions
                .map(it => it.split(':'))
                .map(([key, value]) => [key, ['true', 'false'].includes(value) ? value === 'true' : value]),
            ),
          );
        }
      },
      scope: 'generator',
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
      choices: ['liquibase', 'loader', 'no'],
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
  import: ['java', 'liquibase', 'jhipster:spring-boot:data-relational', 'jhipster:spring-boot:cache', 'jhipster:spring-cloud'],
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
