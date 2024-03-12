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

import { defaultHelpers as helpers, basicHelpers, runResult } from '../../testing/index.js';
import { shouldSupportFeatures, testBlueprintSupport, checkEnforcements } from '../../test/support/index.js';
import Generator from './index.js';
import { GENERATOR_COMMON } from '../generator-list.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.js');

const mockedGenerators = ['jhipster:git'];

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({ client: true }, GENERATOR_COMMON);

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.run(generatorFile).withJHipsterConfig().withMockedGenerators(mockedGenerators);
      });

      it('should succeed', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });

      it('should add generator-jhipster to package.json', () => {
        runResult.assertFileContent('package.json', 'generator-jhipster');
      });
    });
    describe('Custom prettier', () => {
      before(async () => {
        await basicHelpers
          .run(generatorFile)
          .withJHipsterConfig({
            prettierTabWidth: 10,
          })
          .withMockedGenerators(mockedGenerators);
      });

      it('writes custom .prettierrc', () => {
        runResult.assertFileContent('.prettierrc', /tabWidth: 10/);
      });

      it('uses custom prettier formatting to js file', () => {
        runResult.assertFileContent('.lintstagedrc.cjs', / {10}'{/);
      });
    });
  });
});
