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
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport } from '../../test/support/tests.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import { GENERATOR_JHIPSTER } from '../generator-constants.mjs';
import { GENERATOR_MAVEN } from '../generator-list.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mjs');

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_MAVEN).toBe(generator);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with valid configuration', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorFile).withOptions({
        localConfig: {
          baseName: 'existing',
          packageName: 'tech.jhipster',
        },
      });
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });
  describe('with empty configuration', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorFile).withOptions({ baseName: 'jhipster' });
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });
});
