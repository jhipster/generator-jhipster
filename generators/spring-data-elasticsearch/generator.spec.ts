/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import {
  buildServerMatrix,
  extendMatrix,
  entitiesServerSamples as entities,
  buildSamplesFromMatrix,
  defaultHelpers as helpers,
  runResult,
} from '../../testing/index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from './generator.js';
import { matchElasticSearch, matchElasticSearchUser } from './__test-support/elastic-search-matcher.js';

import { databaseTypes, searchEngineTypes, authenticationTypes, applicationTypes } from '../../jdl/jhipster/index.js';
import { mockedGenerators, shouldComposeWithSpringCloudStream } from '../server/__test-support/index.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
// compose with server generator, many conditionals at server generator
const serverGeneratorFile = join(__dirname, '../server/index.js');

const { SQL, CASSANDRA, MONGODB, NEO4J } = databaseTypes;
const commonConfig = { baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { ELASTICSEARCH } = searchEngineTypes;
const { OAUTH2 } = authenticationTypes;
const { MICROSERVICE } = applicationTypes;

let samples = buildServerMatrix();

samples = extendMatrix(samples, {
  databaseType: [SQL, CASSANDRA, MONGODB, NEO4J],
  searchEngine: [ELASTICSEARCH],
});

const testSamples = buildSamplesFromMatrix(samples, { commonConfig });

describe('generator - elasticsearch', () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

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
          await expect(helpers.runJHipster(serverGeneratorFile).withJHipsterConfig(sampleConfig)).rejects.toThrow();
        });

        return;
      }

      before(async () => {
        await helpers.run(serverGeneratorFile).withJHipsterConfig(sampleConfig, entities).withMockedGenerators(mockedGenerators);
      });

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
          elasticsearch &&
            (sampleConfig.authenticationType === OAUTH2 ||
              (sampleConfig.applicationType !== MICROSERVICE && !sampleConfig.skipUserManagement)),
        );
      });
      shouldComposeWithSpringCloudStream(sampleConfig, () => runResult);
    });
  });
});
