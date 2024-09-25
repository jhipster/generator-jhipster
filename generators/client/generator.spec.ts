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
import { snakeCase } from 'lodash-es';
import { before, describe, expect, it } from 'esmocha';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.js';
import { defaultHelpers as helpers, result, runResult } from '../../lib/testing/index.js';
import { testFrameworkTypes } from '../../lib/jhipster/index.js';
import { GENERATOR_CLIENT } from '../generator-list.js';
import Generator from './index.js';

const { CYPRESS } = testFrameworkTypes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, GENERATOR_CLIENT);

  describe('composing', () => {
    const mockedComposedGenerators = ['jhipster:common', 'jhipster:languages', 'jhipster:cypress'];

    describe('with translation disabled', () => {
      const options = { enableTranslation: false };
      before(async () => {
        await helpers
          .run(generatorFile)
          .withControl({ getWebappTranslation: () => 'translations' })
          .withJHipsterConfig(options)
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with jhipster:languages', () => {
        runResult.assertGeneratorComposedOnce('jhipster:languages');
      });
    });

    describe('with translation enabled', () => {
      const options = { enableTranslation: true };
      before(async () => {
        await helpers
          .run(generatorFile)
          .withControl({ getWebappTranslation: () => 'translations' })
          .withJHipsterConfig(options)
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with jhipster:languages', () => {
        runResult.assertGeneratorComposedOnce('jhipster:languages');
      });
    });

    describe('without cypress', () => {
      const options = { testFrameworks: [] };
      before(async () => {
        await helpers
          .run(generatorFile)
          .withControl({ getWebappTranslation: () => 'translations' })
          .withJHipsterConfig(options)
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with jhipster:languages', () => {
        runResult.assertGeneratorComposedOnce('jhipster:languages');
      });
      it('should not compose with jhipster:cypress', () => {
        runResult.assertGeneratorNotComposed('jhipster:cypress');
      });
    });

    describe('with cypress', () => {
      const options = { testFrameworks: [CYPRESS] };
      before(async () => {
        await helpers
          .run(generatorFile)
          .withControl({ getWebappTranslation: () => 'translations' })
          .withJHipsterConfig(options)
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should compose with jhipster:common', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with jhipster:languages', () => {
        runResult.assertGeneratorComposedOnce('jhipster:languages');
      });
      it('should compose with jhipster:cypress', () => {
        runResult.assertGeneratorComposedOnce('jhipster:cypress');
      });
    });
  });

  describe('with microservices', () => {
    const mockedComposedGenerators = [
      'jhipster:common',
      'jhipster:languages',
      'jhipster:cypress',
      'jhipster:angular',
      'jhipster:react',
      'jhipster:vue',
    ];
    before(async () => {
      await helpers
        .run(generatorFile)
        .withControl({ getWebappTranslation: () => 'translations' })
        .withJHipsterConfig({ applicationType: 'microservice' })
        .withSkipWritingPriorities()
        .withMockedGenerators(mockedComposedGenerators);
    });

    it('should compose with jhipster:common', () => {
      result.assertGeneratorComposedOnce('jhipster:common');
    });
    it('should compose with jhipster:languages', () => {
      result.assertGeneratorNotComposed('jhipster:languages');
    });
    it('should compose with jhipster:cypress', () => {
      result.assertGeneratorNotComposed('jhipster:cypress');
    });
    it('should compose with jhipster:angular', () => {
      result.assertGeneratorNotComposed('jhipster:angular');
    });
    it('should compose with jhipster:react', () => {
      result.assertGeneratorNotComposed('jhipster:react');
    });
    it('should compose with jhipster:vue', () => {
      result.assertGeneratorNotComposed('jhipster:vue');
    });
  });
});
