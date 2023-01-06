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

import { testBlueprintSupport } from '../../test/support/tests.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import Generator from './index.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.mjs');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({
          defaults: true,
          baseName: 'jhipster',
          skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'],
        });
      });

      it('should match snapshot', () => {
        expect(runResult.generator.sharedData.getApplication()).toMatchSnapshot({
          user: expect.any(Object),
          jhipsterPackageJson: expect.any(Object),
        });
      });
    });

    describe('gateway', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({
          defaults: true,
          baseName: 'jhipster',
          applicationType: 'gateway',
          skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'],
        });
      });

      it('should match snapshot', () => {
        expect(runResult.generator.sharedData.getApplication()).toMatchSnapshot({
          user: expect.any(Object),
          jhipsterPackageJson: expect.any(Object),
          jwtSecretKey: expect.any(String),
        });
      });
    });

    describe('microservice', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({
          defaults: true,
          baseName: 'jhipster',
          applicationType: 'microservice',
          skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'],
        });
      });

      it('should match snapshot', () => {
        expect(runResult.generator.sharedData.getApplication()).toMatchSnapshot({
          jhipsterPackageJson: expect.any(Object),
          jwtSecretKey: expect.any(String),
        });
      });
    });
  });
});
