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

const { skipPrettierHelpers: helpers } = require('../../test/utils/utils');

const { basicTests, testBlueprintSupport } = require('../../test/support/index.cjs');
const { defaultConfig, requiredConfig } = require('./config.cjs');
const { GENERATOR_JAVA } = require('../generator-list');

const generatorPath = path.join(__dirname, 'index.cjs');
const generator = path.basename(__dirname);

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_JAVA).toBe(generator);
  });
  basicTests({
    requiredConfig,
    defaultConfig,
    customPrompts: {
      packageName: 'my.custom.package.name',
      buildTool: 'any',
      prettierJavaIndent: 2,
    },
    generatorPath,
  });
  describe('blueprint support', () => testBlueprintSupport('java'));
  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
      });
      it('should write java files with maven build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('gradle option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ buildTool: 'gradle' });
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('custom blueprinted build-tool', () => {
      const buildTool = 'blueprint:build-tool';
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withMockedGenerators([buildTool]).withOptions({ buildTool });
      });
      it('should compose with custom build-tool generator', () => {
        expect(runResult.mockedGenerators[buildTool].calledOnce).toBe(true);
      });
    });
  });
  describe('with add option and', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ add: true });
      });
      it('should write only java files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
});
