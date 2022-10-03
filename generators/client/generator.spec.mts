/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import assert from 'yeoman-assert';

import testSupport from '../../test/support/index.cjs';
import Generator from './index.js';
import { defaultHelpers as helpers } from '../../test/utils/utils.mjs';
import constants from '../generator-defaults.js';
import TestFrameworkTypes from '../../jdl/jhipster/test-framework-types.js';

const { snakeCase } = lodash;
const { testBlueprintSupport } = testSupport;
const { appDefaultConfig } = constants;
const { CYPRESS } = TestFrameworkTypes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('composing', () => {
    const mockedComposedGenerators = ['jhipster:common', 'jhipster:client', 'jhipster:languages', 'jhipster:cypress'];

    describe('with translation disabled', () => {
      let runResult;
      const options = { enableTranslation: false };
      before(() => {
        return helpers
          .create(generatorFile)
          .withOptions({
            fromCli: true,
            skipInstall: true,
            defaultLocalConfig: { ...appDefaultConfig, ...options },
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
      });
      it('should not compose with jhipster:languages', () => {
        assert.equal(runResult.mockedGenerators['jhipster:languages'].callCount, 0);
      });
    });

    describe('with translation enabled', () => {
      let runResult;
      const options = { enableTranslation: true };
      before(() => {
        return helpers
          .create(generatorFile)
          .withOptions({
            fromCli: true,
            skipInstall: true,
            defaultLocalConfig: { ...appDefaultConfig, ...options },
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
      });
      it('should compose with jhipster:languages', () => {
        assert.equal(runResult.mockedGenerators['jhipster:languages'].callCount, 1);
      });
    });

    describe('without cypress', () => {
      let runResult;
      const options = { testFrameworks: [] };
      before(() => {
        return helpers
          .create(generatorFile)
          .withOptions({
            fromCli: true,
            skipInstall: true,
            defaultLocalConfig: { ...appDefaultConfig, ...options },
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
      });
      it('should compose with jhipster:languages', () => {
        assert(runResult.mockedGenerators['jhipster:languages'].calledOnce);
      });
      it('should not compose with jhipster:cypress', () => {
        assert.equal(runResult.mockedGenerators['jhipster:cypress'].callCount, 0);
      });
    });

    describe('with cypress', () => {
      let runResult;
      const options = { testFrameworks: [CYPRESS] };
      before(() => {
        return helpers
          .create(generatorFile)
          .withOptions({
            fromCli: true,
            skipInstall: true,
            defaultLocalConfig: { ...appDefaultConfig, ...options },
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with jhipster:common', () => {
        assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
      });
      it('should compose with jhipster:languages', () => {
        assert(runResult.mockedGenerators['jhipster:languages'].calledOnce);
      });
      it('should compose with jhipster:cypress', () => {
        assert(runResult.mockedGenerators['jhipster:cypress'].calledOnce);
      });
    });
  });
});
