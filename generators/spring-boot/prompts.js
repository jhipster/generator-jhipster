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

import chalk from 'chalk';
import { includes, intersection } from 'lodash-es';

import {
  applicationOptions,
  applicationTypes,
  authenticationTypes,
  databaseTypes,
  cacheTypes,
  serviceDiscoveryTypes,
  testFrameworkTypes,
} from '../../jdl/jhipster/index.js';
import { MESSAGE_BROKER } from '../server/options/index.js';
import { R2DBC_DB_OPTIONS, SQL_DB_OPTIONS } from '../server/support/database.js';

const { OptionNames } = applicationOptions;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { CASSANDRA, H2_DISK, H2_MEMORY, MONGODB, NEO4J, SQL, COUCHBASE } = databaseTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const {
  AUTHENTICATION_TYPE,
  CACHE_PROVIDER,
  DATABASE_TYPE,
  DEV_DATABASE_TYPE,
  PROD_DATABASE_TYPE,
  REACTIVE,
  SERVER_PORT,
  SERVICE_DISCOVERY_TYPE,
  WEBSOCKET,
  SEARCH_ENGINE,
  ENABLE_SWAGGER_CODEGEN,
} = OptionNames;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_DATABASE = databaseTypes.NO;
const NO_CACHE_PROVIDER = cacheTypes.NO;
const { GATLING, CUCUMBER } = testFrameworkTypes;

/**
 * Get Option From Array
 *
 * @param {Array} array - array
 * @param {any} option - options
 * @returns {boolean} true if option is in array and is set to 'true'
 */
const getOptionFromArray = (array, option) => {
  let optionValue = false;
  array.forEach(value => {
    if (includes(value, option)) {
      optionValue = value.split(':')[1];
    }
  });
  optionValue = optionValue === 'true' ? true : optionValue;
  return optionValue;
};

export async function askForServerSideOpts({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const { applicationType, serverPort: defaultServerPort, reactive } = this.jhipsterConfigWithDefaults;
  const prompts = [
    {
      when: () => [MONOLITH, MICROSERVICE].includes(applicationType),
      type: 'confirm',
      name: REACTIVE,
      message: 'Do you want to make it reactive with Spring WebFlux?',
      default: reactive,
    },
    {
      when: () => applicationType === GATEWAY || applicationType === MICROSERVICE,
      type: 'input',
      name: SERVER_PORT,
      validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
      message:
        'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
      default: defaultServerPort,
    },
    {
      when: () => applicationType === 'gateway' || applicationType === 'microservice',
      type: 'list',
      name: SERVICE_DISCOVERY_TYPE,
      message: 'Which service discovery server do you want to use?',
      choices: [
        {
          value: CONSUL,
          name: 'Consul (recommended)',
        },
        {
          value: EUREKA,
          name: 'JHipster Registry (legacy, uses Eureka, provides Spring Cloud Config support)',
        },
        {
          value: NO_SERVICE_DISCOVERY,
          name: 'No service discovery',
        },
      ],
      default: CONSUL,
    },
    {
      when: answers =>
        (applicationType === MONOLITH && answers.serviceDiscoveryType !== EUREKA) || [GATEWAY, MICROSERVICE].includes(applicationType),
      type: 'list',
      name: AUTHENTICATION_TYPE,
      message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
      choices: answers => {
        const opts = [
          {
            value: JWT,
            name: 'JWT authentication (stateless, with a token)',
          },
        ];
        opts.push({
          value: OAUTH2,
          name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Keycloak and Okta)',
        });
        if (applicationType === MONOLITH && answers.serviceDiscoveryType !== EUREKA) {
          opts.push({
            value: SESSION,
            name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)',
          });
        }
        return opts;
      },
      default: this.jhipsterConfigWithDefaults.authenticationType,
    },
    {
      type: 'list',
      name: DATABASE_TYPE,
      message: `Which ${chalk.yellow('*type*')} of database would you like to use?`,
      choices: answers => {
        const opts = [];
        if (!answers.reactive) {
          opts.push({
            value: SQL,
            name: 'SQL (H2, PostgreSQL, MySQL, MariaDB, Oracle, MSSQL)',
          });
        } else {
          opts.push({
            value: SQL,
            name: 'SQL (H2, PostgreSQL, MySQL, MariaDB, MSSQL)',
          });
        }
        opts.push({
          value: MONGODB,
          name: 'MongoDB',
        });
        if (answers.authenticationType !== OAUTH2) {
          opts.push({
            value: CASSANDRA,
            name: 'Cassandra',
          });
        }
        opts.push({
          value: 'couchbase',
          name: '[BETA] Couchbase',
        });
        opts.push({
          value: NEO4J,
          name: '[BETA] Neo4j',
        });
        opts.push({
          value: NO_DATABASE,
          name: 'No database',
        });
        return opts;
      },
      default: this.jhipsterConfigWithDefaults.databaseType,
    },
    {
      when: response => response.databaseType === SQL,
      type: 'list',
      name: PROD_DATABASE_TYPE,
      message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
      choices: answers => (answers.reactive ? R2DBC_DB_OPTIONS : SQL_DB_OPTIONS),
      default: this.jhipsterConfigWithDefaults.prodDatabaseType,
    },
    {
      when: response => response.databaseType === SQL,
      type: 'list',
      name: DEV_DATABASE_TYPE,
      message: `Which ${chalk.yellow('*development*')} database would you like to use?`,
      choices: response =>
        [SQL_DB_OPTIONS.find(it => it.value === response.prodDatabaseType)].concat([
          {
            value: H2_DISK,
            name: 'H2 with disk-based persistence',
          },
          {
            value: H2_MEMORY,
            name: 'H2 with in-memory persistence',
          },
        ]),
      default: this.jhipsterConfigWithDefaults.devDatabaseType,
    },
    {
      when: answers => !answers.reactive,
      type: 'list',
      name: CACHE_PROVIDER,
      message: 'Which cache do you want to use? (Spring cache abstraction)',
      choices: [
        {
          value: EHCACHE,
          name: 'Ehcache (local cache, for a single node)',
        },
        {
          value: CAFFEINE,
          name: 'Caffeine (local cache, for a single node)',
        },
        {
          value: HAZELCAST,
          name: 'Hazelcast (distributed cache, for multiple nodes, supports rate-limiting for gateway applications)',
        },
        {
          value: INFINISPAN,
          name: 'Infinispan (hybrid cache, for multiple nodes)',
        },
        {
          value: MEMCACHED,
          name: 'Memcached (distributed cache) - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
        },
        {
          value: REDIS,
          name: 'Redis (distributed cache)',
        },
        {
          value: NO_CACHE_PROVIDER,
          name: 'No cache - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
        },
      ],
      default: this.jhipsterConfigWithDefaults.cacheProvider,
    },
    {
      when: answers =>
        ((answers.cacheProvider !== NO_CACHE_PROVIDER && answers.cacheProvider !== MEMCACHED) || applicationType === GATEWAY) &&
        answers.databaseType === SQL &&
        !answers.reactive,
      type: 'confirm',
      name: 'enableHibernateCache',
      message: 'Do you want to use Hibernate 2nd level cache?',
      default: this.jhipsterConfigWithDefaults.enableHibernateCache,
    },
  ];

  await this.prompt(prompts, this.config);
}

export async function askForOptionalItems({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const { applicationType, reactive, databaseType } = this.jhipsterConfigWithDefaults;

  const choices = [];
  const defaultChoice = [];
  if ([SQL, MONGODB, NEO4J].includes(databaseType)) {
    choices.push({
      name: 'Elasticsearch as search engine',
      value: 'searchEngine:elasticsearch',
    });
  }
  if (databaseType === COUCHBASE) {
    choices.push({
      name: 'Couchbase FTS as search engine',
      value: 'searchEngine:couchbase',
    });
  }
  if (!reactive) {
    if (applicationType === MONOLITH || applicationType === GATEWAY) {
      choices.push({
        name: 'WebSockets using Spring Websocket',
        value: 'websocket:spring-websocket',
      });
    }
  }
  choices.push({
    name: 'Apache Kafka as asynchronous messages broker',
    value: 'messageBroker:kafka',
  });
  choices.push({
    name: 'Apache Pulsar as asynchronous messages broker',
    value: 'messageBroker:pulsar',
  });
  choices.push({
    name: 'API first development using OpenAPI-generator',
    value: 'enableSwaggerCodegen:true',
  });

  const PROMPTS = {
    type: 'checkbox',
    name: 'serverSideOptions',
    message: 'Which other technologies would you like to use?',
    choices,
    default: defaultChoice,
  };

  if (choices.length > 0) {
    await this.prompt(PROMPTS).then(answers => {
      this.jhipsterConfig.serverSideOptions = answers.serverSideOptions;
      this.jhipsterConfig.websocket = getOptionFromArray(answers.serverSideOptions, WEBSOCKET);
      this.jhipsterConfig.searchEngine = getOptionFromArray(answers.serverSideOptions, SEARCH_ENGINE);
      this.jhipsterConfig.messageBroker = getOptionFromArray(answers.serverSideOptions, MESSAGE_BROKER);
      this.jhipsterConfig.enableSwaggerCodegen = getOptionFromArray(answers.serverSideOptions, ENABLE_SWAGGER_CODEGEN);
      // Only set this option if it hasn't been set in a previous question, as it's only optional for monoliths
      if (!this.jhipsterConfig.serviceDiscoveryType) {
        this.jhipsterConfig.serviceDiscoveryType = getOptionFromArray(answers.serverSideOptions, SERVICE_DISCOVERY_TYPE);
      }
    });
  }
}

export async function askForServerTestOpts({ control }) {
  if (control.existingProject && this.options.askAnswered !== true) return;

  const answers = await this.prompt([
    {
      type: 'checkbox',
      name: 'serverTestFrameworks',
      message: 'Besides Junit, which testing frameworks would you like to use?',
      choices: [
        { name: 'Gatling', value: GATLING },
        { name: 'Cucumber', value: CUCUMBER },
      ],
      default: intersection([GATLING, CUCUMBER], this.jhipsterConfigWithDefaults.testFrameworks),
    },
  ]);
  this.jhipsterConfig.testFrameworks = [...new Set([...(this.jhipsterConfig.testFrameworks ?? []), ...answers.serverTestFrameworks])];
}
