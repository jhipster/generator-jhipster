import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
  testBlueprintSupport,
  buildServerMatrix,
  extendMatrix,
  extendFilteredMatrix,
  entitiesServerSamples as entities,
} from '../../test/support/index.mjs';
import Generator from './index.js';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';
import { matchElasticSearch, matchElasticSearchUser } from './__test-support/elastic-search-matcher.mjs';
import { matchConsul, matchEureka } from './__test-support/service-discovery-matcher.mjs';

import DatabaseTypes from '../../jdl/jhipster/database-types.js';
import SearchEngineTypes from '../../jdl/jhipster/search-engine-types.js';
import CacheTypes from '../../jdl/jhipster/cache-types.js';
import ServiceDiscoveryTypes from '../../jdl/jhipster/service-discovery-types.js';
import AuthenticationTypes from '../../jdl/jhipster/authentication-types.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

const { SQL: databaseType, H2_DISK, H2_MEMORY, POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE } = DatabaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { ELASTICSEARCH, NO: NO_SEARCH_ENGINE } = SearchEngineTypes;
const { NO: NO_CACHE_PROVIDER, EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = CacheTypes;
const { CONSUL, EUREKA } = ServiceDiscoveryTypes;
const { OAUTH2 } = AuthenticationTypes;

let sqlSamples = buildServerMatrix({
  prodDatabaseType: [POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE],
});

sqlSamples = extendMatrix(sqlSamples, {
  searchEngine: [NO_SEARCH_ENGINE, ELASTICSEARCH],
  enableHibernateCache: [false, true],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ prodDatabaseType }) => prodDatabaseType === POSTGRESQL, {
  devDatabaseType: [POSTGRESQL, H2_DISK, H2_MEMORY],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ prodDatabaseType }) => prodDatabaseType === MARIADB, {
  devDatabaseType: [MARIADB, H2_DISK, H2_MEMORY],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ prodDatabaseType }) => prodDatabaseType === MYSQL, {
  devDatabaseType: [MYSQL, H2_DISK, H2_MEMORY],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ prodDatabaseType }) => prodDatabaseType === MSSQL, {
  devDatabaseType: [MSSQL, H2_DISK, H2_MEMORY],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ prodDatabaseType }) => prodDatabaseType === ORACLE, {
  devDatabaseType: [ORACLE, H2_DISK, H2_MEMORY],
});

sqlSamples = extendFilteredMatrix(sqlSamples, ({ reactive }) => !reactive, {
  cacheProvider: [NO_CACHE_PROVIDER, EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS],
});

const samplesBuilder = (): [string, any][] =>
  Object.entries(sqlSamples).map(([name, sample]) => [
    name,
    {
      defaults: true,
      applicationWithEntities: {
        config: {
          ...sample,
          ...commonConfig,
        },
        entities,
      },
    },
  ]);

const testSamples = samplesBuilder();

describe(`JHipster ${databaseType} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.cjs')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  it('samples matrix should match snapshot', () => {
    expect(Object.fromEntries(testSamples)).toMatchSnapshot();
  });

  testSamples.forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;
    const { authenticationType } = sampleConfig;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers.run(generatorFile).withOptions(sample).withMockedGenerators(['jhipster:languages', 'jhipster:common']);
      });

      after(() => runResult.cleanup());

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct authenticationType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"authenticationType": "${authenticationType}"`));
      });
      it('contains correct databaseType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"databaseType": "${databaseType}"`));
      });

      describe('searchEngine', () => {
        const elasticsearch = sampleConfig.searchEngine === ELASTICSEARCH;
        matchElasticSearch(() => runResult, elasticsearch);
        matchElasticSearchUser(
          () => runResult,
          elasticsearch && (sampleConfig.authenticationType === OAUTH2 || !sampleConfig.skipUserManagement)
        );
      });

      describe('serviceDiscoveryType', () => {
        matchEureka(() => runResult, sampleConfig.serviceDiscoveryType === EUREKA);
        matchConsul(() => runResult, sampleConfig.serviceDiscoveryType === CONSUL);
      });
    });
  });
});
