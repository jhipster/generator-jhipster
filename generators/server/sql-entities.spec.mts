import { jestExpect as expect } from 'mocha-expect-snapshot';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildServerMatrix, extendMatrix, extendFilteredMatrix, entitiesServerSamples as entities } from '../../test/support/index.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';

import { databaseTypes, cacheTypes } from '../../jdl/jhipster/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorFile = join(__dirname, 'index.mjs');

const { SQL: databaseType, H2_DISK, H2_MEMORY, POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE } = databaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { NO: NO_CACHE_PROVIDER, EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;

let sqlSamples = buildServerMatrix();

sqlSamples = extendMatrix(sqlSamples, {
  prodDatabaseType: [POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE],
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
          ...commonConfig,
          ...sample,
        },
        entities,
      },
      skipPriorities: ['writing', 'postWriting'],
    },
  ]);

const testSamples = samplesBuilder();

describe(`generator - ${databaseType} - entities`, () => {
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
          .withMockedGenerators(['jhipster:languages', 'jhipster:common', 'jhipster:liquibase']);
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        expect(runResult.mockedGenerators['jhipster:common'].callCount).toBe(1);
      });
      it(`should ${enableTranslation ? '' : 'not '}compose with jhipster:languages`, () => {
        expect(runResult.mockedGenerators['jhipster:languages'].callCount).toBe(enableTranslation ? 1 : 0);
      });
      it('should compose with jhipster:liquibase', () => {
        expect(runResult.mockedGenerators['jhipster:liquibase'].callCount).toBe(1);
      });
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
});
