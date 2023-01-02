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
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { basicTests, testBlueprintSupport } from '../../test/support/tests.mjs';
import { GENERATOR_PROJECT_NAME } from '../generator-list.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.mjs');

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_PROJECT_NAME).toBe(generator);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  basicTests({
    requiredConfig: {},
    defaultConfig: {},
    customPrompts: {
      baseName: 'BeautifulProject',
    },
    generatorPath,
  });
});
