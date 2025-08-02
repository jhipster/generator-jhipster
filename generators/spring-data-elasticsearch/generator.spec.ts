/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { before, describe, expect, it } from 'esmocha';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { snakeCase } from 'lodash-es';

import { APPLICATION_TYPE_MICROSERVICE } from '../../lib/core/application-types.ts';
import { authenticationTypes, databaseTypes, searchEngineTypes } from '../../lib/jhipster/index.ts';
import {
  buildSamplesFromMatrix,
  buildServerMatrix,
  defaultHelpers as helpers,
  entitiesServerSamples as entities,
  extendMatrix,
  runResult,
} from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { filterBasicServerGenerators, shouldComposeWithSpringCloudStream } from '../server/__test-support/index.ts';

import { matchElasticSearch, matchElasticSearchUser } from './__test-support/elastic-search-matcher.ts';
import Generator from './generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
// compose with server generator, many conditionals at server generator
const serverGeneratorFile = join(__dirname, '../server/index.js');

const { SQL, CASSANDRA, MONGODB, NEO4J } = databaseTypes;
const commonConfig = { baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };
const { ELASTICSEARCH } = searchEngineTypes;
const { OAUTH2 } = authenticationTypes;

let samples = buildServerMatrix();

samples = extendMatrix(samples, {
  databaseType: [SQL, CASSANDRA, MONGODB, NEO4J],
  searchEngine: [ELASTICSEARCH],
});

const testSamples = buildSamplesFromMatrix(samples, { commonConfig });

describe('generator - elasticsearch', () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
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
        await helpers
          .runJHipster('server')
          .withJHipsterConfig(sampleConfig, entities)
          .withMockedSource({ except: ['addTestSpringFactory'] })
          .withMockedJHipsterGenerators({
            except: ['jhipster:spring-data-elasticsearch'],
            filter: filterBasicServerGenerators,
          });
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it(`should ${enableTranslation ? '' : 'not '}compose with jhipster:languages`, () => {
        expect(runResult.getGeneratorComposeCount('jhipster:languages')).toBe(enableTranslation ? 1 : 0);
      });
      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });

      describe('searchEngine', () => {
        const elasticsearch = sampleConfig.searchEngine === ELASTICSEARCH;
        matchElasticSearch(elasticsearch);
        matchElasticSearchUser(
          elasticsearch &&
            (sampleConfig.authenticationType === OAUTH2 ||
              (sampleConfig.applicationType !== APPLICATION_TYPE_MICROSERVICE && !sampleConfig.skipUserManagement)),
        );
      });
      shouldComposeWithSpringCloudStream(sampleConfig, () => runResult);
    });
  });
});
