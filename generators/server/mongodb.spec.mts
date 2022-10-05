import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport, buildServerMatrix, entitiesSimple as entities } from '../../test/support/index.mjs';
import Generator from './index.js';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';

import DatabaseTypes from '../../jdl/jhipster/database-types.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

const { MONGODB: databaseType } = DatabaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };

const samplesBuilder = (): [string, any][] =>
  Object.entries(buildServerMatrix()).map(([name, sample]) => [
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
    });
  });
});
