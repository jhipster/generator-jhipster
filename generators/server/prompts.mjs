/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import generatorDefaults from '../generator-defaults.mjs';

import {
  applicationOptions,
  applicationTypes,
  authenticationTypes,
  buildToolTypes,
  databaseTypes,
  cacheTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';
import { R2DBC_DB_OPTIONS, SQL_DB_OPTIONS } from './support/database.mjs';

const { OptionNames } = applicationOptions;
const { serverDefaultConfig } = generatorDefaults;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { CASSANDRA, H2_DISK, H2_MEMORY, MONGODB, NEO4J, SQL, COUCHBASE } = databaseTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const {
  AUTHENTICATION_TYPE,
  BUILD_TOOL,
  CACHE_PROVIDER,
  DATABASE_TYPE,
  PACKAGE_NAME,
  DEV_DATABASE_TYPE,
  PROD_DATABASE_TYPE,
  REACTIVE,
  SERVER_PORT,
  SERVICE_DISCOVERY_TYPE,
} = OptionNames;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_DATABASE = databaseTypes.NO;
const NO_CACHE_PROVIDER = cacheTypes.NO;

export async function askForServerSideOpts({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const applicationType = this.jhipsterConfig.applicationType;
  const defaultPort = applicationType === GATEWAY ? '8080' : '8081';
  const prompts = [
    {
      when: () => [MONOLITH, MICROSERVICE].includes(applicationType),
      type: 'confirm',
      name: REACTIVE,
      message: 'Do you want to make it reactive with Spring WebFlux?',
      default: serverDefaultConfig.reactive,
    },
    {
      when: () => applicationType === GATEWAY || applicationType === MICROSERVICE,
      type: 'input',
      name: SERVER_PORT,
      validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
      message:
        'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
      default: defaultPort,
    },
    {
      type: 'input',
      name: PACKAGE_NAME,
      validate: input =>
        /^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)
          ? true
          : 'The package name you have provided is not a valid Java package name.',
      message: 'What is your default Java package name?',
      default: serverDefaultConfig.packageName,
      store: true,
    },
    {
      when: () => applicationType === 'gateway' || applicationType === 'microservice',
      type: 'list',
      name: SERVICE_DISCOVERY_TYPE,
      message: 'Which service discovery server do you want to use?',
      choices: [
        {
          value: EUREKA,
          name: 'JHipster Registry (uses Eureka, provides Spring Cloud Config support and monitoring dashboards)',
        },
        {
          value: CONSUL,
          name: 'Consul',
        },
        {
          value: NO_SERVICE_DISCOVERY,
          name: 'No service discovery',
        },
      ],
      default: EUREKA,
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
      default: serverDefaultConfig.authenticationType,
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
      default: serverDefaultConfig.databaseType,
    },
    {
      when: response => response.databaseType === SQL,
      type: 'list',
      name: PROD_DATABASE_TYPE,
      message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
      choices: answers => (answers.reactive ? R2DBC_DB_OPTIONS : SQL_DB_OPTIONS),
      default: serverDefaultConfig.prodDatabaseType,
    },
    {
      when: response => response.databaseType === SQL,
      type: 'list',
      name: DEV_DATABASE_TYPE,
      message: `Which ${chalk.yellow('*development*')} database would you like to use?`,
      choices: response =>
        [
          {
            value: H2_DISK,
            name: 'H2 with disk-based persistence',
          },
          {
            value: H2_MEMORY,
            name: 'H2 with in-memory persistence',
          },
        ].concat(SQL_DB_OPTIONS.find(it => it.value === response.prodDatabaseType)),
      default: serverDefaultConfig.devDatabaseType,
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
      default: applicationType === MICROSERVICE ? 2 : serverDefaultConfig.cacheProvider,
    },
    {
      when: answers =>
        ((answers.cacheProvider !== NO_CACHE_PROVIDER && answers.cacheProvider !== MEMCACHED) || applicationType === GATEWAY) &&
        answers.databaseType === SQL &&
        !answers.reactive,
      type: 'confirm',
      name: 'enableHibernateCache',
      message: 'Do you want to use Hibernate 2nd level cache?',
      default: serverDefaultConfig.enableHibernateCache,
    },
    {
      type: 'list',
      name: BUILD_TOOL,
      message: 'Would you like to use Maven or Gradle for building the backend?',
      choices: [
        {
          value: MAVEN,
          name: 'Maven',
        },
        {
          value: GRADLE,
          name: 'Gradle',
        },
      ],
      default: serverDefaultConfig.buildTool,
    },
    {
      when: answers => answers.buildTool === GRADLE && this.options.experimental,
      type: 'confirm',
      name: 'enableGradleEnterprise',
      message: 'Do you want to enable Gradle Enterprise integration?',
      default: serverDefaultConfig.enableGradleEnterprise,
    },
    {
      when: answers => answers.enableGradleEnterprise,
      type: 'input',
      name: 'gradleEnterpriseHost',
      message: 'Enter your Gradle Enterprise host',
      validate: input => (input.length === 0 ? 'Please enter your Gradle Enterprise host' : true),
    },
    {
      when: applicationType === MONOLITH,
      type: 'list',
      name: SERVICE_DISCOVERY_TYPE,
      message: 'Do you want to use the JHipster Registry to configure, monitor and scale your application?',
      choices: [
        {
          value: NO_SERVICE_DISCOVERY,
          name: 'No',
        },
        {
          value: EUREKA,
          name: 'Yes',
        },
      ],
      default: serverDefaultConfig.serviceDiscoveryType,
    },
  ];

  await this.prompt(prompts, this.config);
}

export async function askForOptionalItems({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const applicationType = this.jhipsterConfig.applicationType;
  const reactive = this.jhipsterConfig.reactive;
  const databaseType = this.jhipsterConfig.databaseType;

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
      this.jhipsterConfig.websocket = this.getOptionFromArray(answers.serverSideOptions, 'websocket');
      this.jhipsterConfig.searchEngine = this.getOptionFromArray(answers.serverSideOptions, 'searchEngine');
      this.jhipsterConfig.messageBroker = this.getOptionFromArray(answers.serverSideOptions, 'messageBroker');
      this.jhipsterConfig.enableSwaggerCodegen = this.getOptionFromArray(answers.serverSideOptions, 'enableSwaggerCodegen');
      // Only set this option if it hasn't been set in a previous question, as it's only optional for monoliths
      if (!this.jhipsterConfig.serviceDiscoveryType) {
        this.jhipsterConfig.serviceDiscoveryType = this.getOptionFromArray(answers.serverSideOptions, 'serviceDiscoveryType');
      }
    });
  }
}
