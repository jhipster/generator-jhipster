import { jestExpect as expect } from 'mocha-expect-snapshot';

import {
  buildServerMatrix,
  extendMatrix,
  extendFilteredMatrix,
  entitiesServerSamples as entities,
  buildSamplesFromMatrix,
} from '../../test/support/index.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import { mockedGenerators as serverGenerators } from '../server/__test-support/index.mjs';

import { databaseTypes, cacheTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_SERVER, GENERATOR_SQL } from '../generator-list.mjs';

const mockedGenerators = serverGenerators.filter(generator => generator !== `jhipster:${GENERATOR_SQL}`);

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

const testSamples = buildSamplesFromMatrix(sqlSamples, { commonConfig });
const skipPriorities = ['writing', 'postWriting'];

describe(`generator - ${databaseType} - entities`, () => {
  it('samples matrix should match snapshot', () => {
    expect(testSamples).toMatchSnapshot();
  });

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { enableTranslation } = sampleConfig;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers
          .runJHipster(GENERATOR_SERVER)
          .withJHipsterConfig(sampleConfig, entities)
          .withOptions({ skipPriorities })
          .withMockedGenerators(mockedGenerators);
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
