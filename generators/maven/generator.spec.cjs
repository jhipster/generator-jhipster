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
const { skipPrettierHelpers: helpers } = require('../../test/utils/utils');
const { GENERATOR_JHIPSTER } = require('../generator-constants');
const { GENERATOR_MAVEN } = require('../generator-list');

const generatorPath = path.join(__dirname, 'index.cjs');
const generator = path.basename(__dirname);

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_MAVEN).toBe(generator);
  });
  basicTests({
    requiredConfig: {},
    defaultConfig: {},
    customPrompts: {},
    generatorPath,
  });
  describe('blueprint support', () => testBlueprintSupport('maven'));
  describe('with valid configuration', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath).withOptions({
        localConfig: {
          baseName: 'existing',
          packageName: 'tech.jhipster',
        },
      });
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should add contents to pom.xml', () => {
      runResult.assertFileContent('pom.xml', 'existing');
      runResult.assertFileContent('pom.xml', 'tech.jhipster');
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });
  describe('with empty configuration', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath);
    });
    it('should generate only maven files', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
    it('should add contents to pom.xml', () => {
      runResult.assertFileContent('pom.xml', 'jhipster');
      runResult.assertFileContent('pom.xml', 'com.mycompany.myapp');
    });
    it('should set buildTool config', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { buildTool: 'maven' } });
    });
  });
});
