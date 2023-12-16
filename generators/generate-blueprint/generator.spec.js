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
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import { defaultHelpers as helpers } from '../../test/support/index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from './index.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.js');
const generator = basename(__dirname);

const mockedGenerators = ['jhipster:init'];

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    const generatorList = await import('../generator-list.js');
    await expect(generatorList[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withJHipsterConfig().withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        expect(runResult.mockedGenerators['jhipster:init'].calledOnce).toBe(true);
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('all option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ allGenerators: true }).withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        expect(runResult.mockedGenerators['jhipster:init'].calledOnce).toBe(true);
      });
      it('should match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('local-blueprint option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ localBlueprint: true }).withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        expect(runResult.mockedGenerators['jhipster:init'].calledOnce).toBe(false);
      });
      it('should match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "stateCleared": "modified",
  },
}
`);
      });
    });
    describe('local-blueprint option and app generator', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(generatorPath)
          .withOptions({ localBlueprint: true, subGenerators: ['app'], allPriorities: true })
          .withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        expect(runResult.mockedGenerators['jhipster:init'].calledOnce).toBe(false);
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".blueprint/app/command.mjs": {
    "stateCleared": "modified",
  },
  ".blueprint/app/generator.mjs": {
    "stateCleared": "modified",
  },
  ".blueprint/app/index.mjs": {
    "stateCleared": "modified",
  },
  ".blueprint/app/templates/template-file-app.ejs": {
    "stateCleared": "modified",
  },
  ".yo-rc.json": {
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });
});
