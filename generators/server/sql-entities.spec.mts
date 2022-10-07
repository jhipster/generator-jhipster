import { jestExpect as expect } from 'mocha-expect-snapshot';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildServerMatrix, extendMatrix, extendFilteredMatrix, entitiesServerSamples as entities } from '../../test/support/index.mjs';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';

import DatabaseTypes from '../../jdl/jhipster/database-types.js';
import SearchEngineTypes from '../../jdl/jhipster/search-engine-types.js';
import CacheTypes from '../../jdl/jhipster/cache-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorFile = join(__dirname, 'index.mjs');

const { SQL: databaseType, H2_DISK, H2_MEMORY, POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE } = DatabaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { ELASTICSEARCH, NO: NO_SEARCH_ENGINE } = SearchEngineTypes;
const { NO: NO_CACHE_PROVIDER, EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = CacheTypes;

let sqlSamples = buildServerMatrix();

sqlSamples = extendMatrix(sqlSamples, {
  prodDatabaseType: [POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE],
  enableHibernateCache: [false, true],
  searchEngine: [NO_SEARCH_ENGINE, ELASTICSEARCH],
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
          ...commonConfig,
          ...sample,
        },
        entities,
      },
      skipPriorities: ['writing', 'postWriting'],
    },
  ]);

const testSamples = samplesBuilder();

describe(`JHipster ${databaseType} generator`, () => {
  it('samples matrix should match snapshot', () => {
    expect(Object.fromEntries(testSamples)).toMatchSnapshot();
  });

  testSamples.forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;
    const { enableTranslation } = sampleConfig;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers
          .run(generatorFile)
          .withOptions(sample)
          .withMockedGenerators(['jhipster:languages', 'jhipster:common', 'jhipster:database-changelog']);
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        expect(runResult.mockedGenerators['jhipster:common'].callCount).toBe(1);
      });
      it(`should ${enableTranslation ? '' : 'not '}compose with jhipster:languages`, () => {
        expect(runResult.mockedGenerators['jhipster:languages'].callCount).toBe(enableTranslation ? 1 : 0);
      });
      it('should compose with jhipster:database-changelog', () => {
        expect(runResult.mockedGenerators['jhipster:database-changelog'].callCount).toBe(1);
      });
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
});
