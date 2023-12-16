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
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import Generator from './index.js';
import { buildSamplesFromMatrix, extendFilteredMatrix, extendMatrix } from '../../test/support/matrix-utils.js';
import { defaultHelpers as helpers, runResult } from '../../test/support/index.js';
import { matchElasticSearchDocker } from '../spring-data-elasticsearch/__test-support/elastic-search-matcher.js';
import { matchConsul, matchEureka } from './__test-support/service-discovery-matcher.js';

import { databaseTypes, searchEngineTypes, serviceDiscoveryTypes, cacheTypes } from '../../jdl/jhipster/index.js';
import { buildServerMatrix } from '../../test/support/server-samples.js';
import { MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_NO, MESSAGE_BROKER_PULSAR } from '../server/options/message-broker.js';
import { shouldSupportFeatures } from '../../test/support/tests.js';

const { snakeCase } = lodash;

const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = databaseTypes;
const { NO: NO_SEARCH_ENGINE, ELASTICSEARCH } = searchEngineTypes;
const { NO: NO_SERVICE_DISCOVERY, EUREKA, CONSUL } = serviceDiscoveryTypes;
const { NO: NO_CACHE, REDIS, MEMCACHED, HAZELCAST } = cacheTypes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.ts');

const NO_SQL = [CASSANDRA, COUCHBASE, MONGODB, NEO4J];

let matrix = buildServerMatrix();

matrix = extendMatrix(matrix, {
  prodDatabaseType: [POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE, ...NO_SQL],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Object.entries(matrix).forEach(([_name, config]) => {
  if (NO_SQL.includes(config.prodDatabaseType)) {
    config.databaseType = config.prodDatabaseType;
    delete config.prodDatabaseType;
  }
});

matrix = extendMatrix(matrix, {
  searchEngine: [NO_SEARCH_ENGINE, ELASTICSEARCH],
  serviceDiscoveryType: [NO_SERVICE_DISCOVERY, EUREKA, CONSUL],
  enableSwaggerCodegen: [false, true],
  messageBroker: [MESSAGE_BROKER_NO, MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_PULSAR],
});

matrix = extendFilteredMatrix(matrix, ({ reactive }) => !reactive, {
  cacheProvider: [NO_CACHE, REDIS, MEMCACHED, HAZELCAST],
});

const testSamples = buildSamplesFromMatrix(matrix);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { searchEngine, serviceDiscoveryType } = sampleConfig;

    describe(name, () => {
      before(async () => {
        await helpers.run(generatorFile).withJHipsterConfig(sampleConfig);
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('should match app.yml snapshot', () => {
        expect(runResult.getSnapshot('**/app.yml')).toMatchSnapshot();
      });
      describe('searchEngine', () => {
        const elasticsearch = searchEngine === ELASTICSEARCH;
        matchElasticSearchDocker(() => runResult, elasticsearch);
      });
      describe('serviceDiscoveryType', () => {
        matchEureka(() => runResult, serviceDiscoveryType === EUREKA);
        matchConsul(() => runResult, serviceDiscoveryType === CONSUL);
      });
    });

    describe(`custom path for ${name}`, () => {
      before(async () => {
        await helpers
          .run(generatorFile)
          .withSharedApplication({
            dockerServicesDir: 'foo/',
          })
          .withJHipsterConfig(sampleConfig);
      });

      it('should not generate any file inside src/', () => {
        expect(Object.keys(runResult.getStateSnapshot('**/src/**')).length).toBe(0);
      });
    });
  });
});
