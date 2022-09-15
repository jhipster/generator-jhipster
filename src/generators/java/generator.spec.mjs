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
import { expect } from 'expect';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import testSupport from '../../../test/support/index.cjs';
import testUtils from '../../../test/utils/utils.js';
import Generator from './index.cjs';
import generatorConfig from './config.cjs';

const { skipPrettierHelpers: helpers } = testUtils;

const { defaultConfig, requiredConfig } = generatorConfig;

const { snakeCase } = lodash;
const { basicTests, testBlueprintSupport } = testSupport;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.cjs');

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should be exported at package.json', async () => {
    await expect((await import(`generator-jhipster/esm/generators/${generator}`)).default).toBe(Generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  basicTests({
    requiredConfig,
    defaultConfig,
    customPrompts: {
      packageName: 'my.custom.package.name',
      prettierJavaIndent: 2,
      buildTool: 'any',
    },
    generatorPath,
  });
  describe('blueprint support', () => testBlueprintSupport(generator, { entity: true }));
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
