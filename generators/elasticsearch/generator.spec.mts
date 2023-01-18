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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { buildServerMatrix, extendMatrix, entitiesServerSamples as entities } from '../../test/support/index.mjs';
import { testBlueprintSupport } from '../../test/support/tests.mjs';
import Generator from './generator.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import { matchElasticSearch, matchElasticSearchUser } from './__test-support/elastic-search-matcher.mjs';

import { databaseTypes, searchEngineTypes, authenticationTypes } from '../../jdl/jhipster/index.mjs';
import { mockedGenerators, shouldComposeWithKafka, shouldComposeWithLiquibase } from '../server/__test-support/index.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
// compose with server generator, many conditionals at server generator
const serverGeneratorFile = join(__dirname, '../server/index.mjs');

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

describe('generator - elasticsearch', () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  it('samples matrix should match snapshot', () => {
    expect(Object.fromEntries(testSamples)).toMatchSnapshot();
  });

  testSamples.forEach(([name, sample]) => {
    const sampleConfig = sample.applicationWithEntities.config;
    const { enableTranslation } = sampleConfig;

    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers.run(serverGeneratorFile).withOptions(sample).withMockedGenerators(mockedGenerators);
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
      shouldComposeWithKafka(sample, () => runResult);
      shouldComposeWithLiquibase(sample, () => runResult);
    });
  });
});
