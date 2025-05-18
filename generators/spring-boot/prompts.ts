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
import { intersection } from 'lodash-es';

import {
  applicationOptions,
  applicationTypes,
  authenticationTypes,
  cacheTypes,
  databaseTypes,
  testFrameworkTypes,
} from '../../lib/jhipster/index.js';
import { R2DBC_DB_OPTIONS, SQL_DB_OPTIONS } from '../server/support/database.js';
import { asPromptingTask } from '../base-application/support/task-type-inference.js';

const { OptionNames } = applicationOptions;
const { GATEWAY, MONOLITH } = applicationTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { OAUTH2 } = authenticationTypes;
const { CASSANDRA, H2_DISK, H2_MEMORY, MONGODB, NEO4J, SQL, COUCHBASE } = databaseTypes;
const { WEBSOCKET, SEARCH_ENGINE, ENABLE_SWAGGER_CODEGEN } = OptionNames;
const NO_DATABASE = databaseTypes.NO;
const NO_CACHE_PROVIDER = cacheTypes.NO;
const { GATLING, CUCUMBER } = testFrameworkTypes;

export const askForServerSideOpts = asPromptingTask(async function ({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const { applicationType, authenticationType, reactive } = this.jhipsterConfigWithDefaults;

  await this.prompt(
    [
      {
        type: 'list',
        name: 'databaseType',
        message: `Which ${chalk.yellow('*type*')} of database would you like to use?`,
        choices: () => {
          const opts: any[] = [];
          if (!reactive) {
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
          if (authenticationType !== OAUTH2) {
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
        name: 'prodDatabaseType',
        message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
        choices: reactive ? R2DBC_DB_OPTIONS : SQL_DB_OPTIONS,
        default: this.jhipsterConfigWithDefaults.prodDatabaseType,
      },
      {
        when: response => response.databaseType === SQL,
        type: 'list',
        name: 'devDatabaseType',
        message: `Which ${chalk.yellow('*development*')} database would you like to use?`,
        choices: response => {
          const currentDatabase = SQL_DB_OPTIONS.find(it => it.value === response.prodDatabaseType)!;
          return [
            {
              ...currentDatabase,
              name: `${currentDatabase.name} (requires Docker or manually configured database)`,
            },
          ].concat([
            { value: H2_DISK, name: `H2 with disk-based persistence` },
            { value: H2_MEMORY, name: `H2 with in-memory persistence` },
          ]);
        },
        default: this.jhipsterConfigWithDefaults.devDatabaseType,
      },
      {
        when: !reactive,
        type: 'list',
        name: 'cacheProvider',
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
            name: 'Hazelcast (distributed cache for multiple nodes)',
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
          !reactive,
        type: 'confirm',
        name: 'enableHibernateCache',
        message: 'Do you want to use Hibernate 2nd level cache?',
        default: this.jhipsterConfigWithDefaults.enableHibernateCache,
      },
    ],
    this.config,
  );
});

export const askForOptionalItems = asPromptingTask(async function askForOptionalItems({ control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const { applicationType, reactive, databaseType } = this.jhipsterConfigWithDefaults;

  const choices: any[] = [];
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
  choices.push(
    {
      name: 'Apache Kafka as asynchronous messages broker',
      value: 'messageBroker:kafka',
    },
    {
      name: 'Apache Pulsar as asynchronous messages broker',
      value: 'messageBroker:pulsar',
    },
    {
      name: 'API first development using OpenAPI-generator',
      value: 'enableSwaggerCodegen:true',
    },
  );

  if (choices.length > 0) {
    const selectedChoices: string[] = [WEBSOCKET, SEARCH_ENGINE, 'messageBroker', ENABLE_SWAGGER_CODEGEN]
      .map(property => [property, this.jhipsterConfig[property]])
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}:${value}`)
      .filter(Boolean) as string[];

    choices.forEach(choice => {
      choice.checked = selectedChoices.includes(choice.value);
    });

    const answers = await this.prompt({
      type: 'checkbox',
      name: 'serverSideOptions',
      message: 'Which other technologies would you like to use?',
      choices,
      default: selectedChoices,
    });

    Object.assign(
      this.jhipsterConfig,
      Object.fromEntries(
        answers.serverSideOptions
          .map(it => it.split(':'))
          .map(([key, value]) => [key, ['true', 'false'].includes(value) ? value === 'true' : value]),
      ),
    );
  }
});

export const askForServerTestOpts = asPromptingTask(async function ({ control }) {
  if (control.existingProject && this.options.askAnswered !== true) return;

  const testFrameworks = this.jhipsterConfigWithDefaults.testFrameworks ?? [];
  const answers = await this.prompt([
    {
      type: 'checkbox',
      name: 'serverTestFrameworks',
      message: 'Besides JUnit, which testing frameworks would you like to use?',
      choices: [
        { name: 'Gatling', value: GATLING, checked: testFrameworks.includes(GATLING) },
        { name: 'Cucumber', value: CUCUMBER, checked: testFrameworks.includes(CUCUMBER) },
      ],
      default: intersection([GATLING, CUCUMBER], this.jhipsterConfigWithDefaults.testFrameworks),
    },
  ]);
  this.jhipsterConfig.testFrameworks = [...new Set([...(this.jhipsterConfig.testFrameworks ?? []), ...answers.serverTestFrameworks])];
});
