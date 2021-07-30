/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const expect = require('expect');
const path = require('path');

const { basicTests, testBlueprintSupport } = require('../../test/support/index.cjs');
const { requiredConfig, defaultConfig, reproducibleConfigForTests } = require('./config.cjs');
const { GENERATOR_PROJECT_NAME } = require('../generator-list');

const generatorPath = path.join(__dirname, 'index.cjs');
const generator = path.basename(__dirname);

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_PROJECT_NAME).toBe(generator);
  });
  basicTests({
    requiredConfig: { ...requiredConfig, ...reproducibleConfigForTests },
    defaultConfig: { ...defaultConfig, ...reproducibleConfigForTests },
    customPrompts: {
      projectName: 'Beautiful Project',
      baseName: 'BeautifulProject',
    },
    generatorPath,
  });
  describe('blueprint support', () => testBlueprintSupport('project-name'));
});
