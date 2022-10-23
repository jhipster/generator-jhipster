import { jestExpect as expect } from 'mocha-expect-snapshot';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildServerMatrix, extendMatrix, entitiesServerSamples as entities } from '../../test/support/index.mjs';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';
import { matchElasticSearch, matchElasticSearchUser } from './__test-support/elastic-search-matcher.mjs';

import { databaseTypes, searchEngineTypes, authenticationTypes } from '../../jdl/jhipster/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorFile = join(__dirname, 'index.mjs');

const { SQL, CASSANDRA, MONGODB, NEO4J } = databaseTypes;
const commonConfig = { baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { ELASTICSEARCH } = searchEngineTypes;
const { OAUTH2 } = authenticationTypes;

let samples = buildServerMatrix();

samples = extendMatrix(samples, {
  databaseType: [SQL, CASSANDRA, MONGODB, NEO4J],
  searchEngine: [ELASTICSEARCH],
});

const samplesBuilder = (): [string, any][] =>
  Object.entries(samples).map(([name, sample]) => [
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
    },
  ]);

const testSamples = samplesBuilder();

describe('JHipster elasticsearch generator', () => {
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
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      describe('searchEngine', () => {
        const elasticsearch = sampleConfig.searchEngine === ELASTICSEARCH;
        matchElasticSearch(() => runResult, elasticsearch);
        matchElasticSearchUser(
          () => runResult,
          elasticsearch && (sampleConfig.authenticationType === OAUTH2 || !sampleConfig.skipUserManagement)
        );
      });
    });
  });
});
