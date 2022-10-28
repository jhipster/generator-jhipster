import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport, buildServerMatrix, extendMatrix, extendFilteredMatrix } from '../../test/support/index.mjs';
import Generator from './index.mjs';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';
import { matchConsul, matchEureka } from './__test-support/service-discovery-matcher.mjs';

import { databaseTypes, cacheTypes, serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mjs');

const { SQL: databaseType, H2_DISK, H2_MEMORY, POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE } = databaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { NO: NO_CACHE_PROVIDER, EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;

let sqlSamples = buildServerMatrix({
  prodDatabaseType: [POSTGRESQL, MARIADB, MYSQL, MSSQL, ORACLE],
});

sqlSamples = extendMatrix(sqlSamples, {
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
        // entities,
      },
    },
  ]);

const testSamples = samplesBuilder();

describe(`JHipster ${databaseType} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
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
    const { authenticationType, enableTranslation } = sampleConfig;

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
      it('should not compose with jhipster:database-changelog', () => {
        expect(runResult.mockedGenerators['jhipster:database-changelog'].callCount).toBe(0);
      });
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct authenticationType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"authenticationType": "${authenticationType}"`));
      });
      it('contains correct databaseType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"databaseType": "${databaseType}"`));
      });

      describe('serviceDiscoveryType', () => {
        matchEureka(() => runResult, sampleConfig.serviceDiscoveryType === EUREKA);
        matchConsul(() => runResult, sampleConfig.serviceDiscoveryType === CONSUL);
      });
    });
  });
});
