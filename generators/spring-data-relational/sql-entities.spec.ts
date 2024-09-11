import { before, describe, expect, it } from 'esmocha';
import {
  buildSamplesFromMatrix,
  buildServerMatrix,
  entitiesServerSamples as entities,
  extendFilteredMatrix,
  extendMatrix,
  defaultHelpers as helpers,
  runResult,
} from '../../lib/testing/index.js';
import { filterBasicServerGenerators } from '../server/__test-support/index.js';

import { cacheTypes, databaseTypes } from '../../lib/jhipster/index.js';
import { GENERATOR_SERVER } from '../generator-list.js';

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
      if (
        sampleConfig.websocket &&
        (sampleConfig.reactive || sampleConfig.applicationType === 'microservice' || sampleConfig.applicationType === 'gateway')
      ) {
        it('should throw an error', async () => {
          await expect(helpers.runJHipster(GENERATOR_SERVER).withJHipsterConfig(sampleConfig)).rejects.toThrow();
        });

        return;
      }

      before(async () => {
        await helpers
          .runJHipster(GENERATOR_SERVER)
          .withJHipsterConfig(sampleConfig, entities)
          .withOptions({ skipPriorities })
          .withMockedJHipsterGenerators({ except: ['jhipster:spring-data-relational'], filter: filterBasicServerGenerators });
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it(`should ${enableTranslation ? '' : 'not '}compose with jhipster:languages`, () => {
        expect(runResult.getGeneratorComposeCount('jhipster:languages')).toBe(enableTranslation ? 1 : 0);
      });
      it('should compose with jhipster:liquibase', () => {
        runResult.assertGeneratorComposedOnce('jhipster:liquibase');
      });
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
});
