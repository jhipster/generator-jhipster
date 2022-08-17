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

import { skipPrettierHelpers as helpers } from '../../test/utils/utils.mjs';
import testSupport from '../../test/support/index.cjs';
import Generator from './index.mjs';

const { snakeCase } = lodash;
const { testBlueprintSupport } = testSupport;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.mjs');
const generator = basename(__dirname);

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
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ defaults: true });
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('all option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ allGenerators: true });
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('local-blueprint option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ localBlueprint: true });
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
Object {
  ".yo-rc.json": Object {
    "stateCleared": "modified",
  },
}
`);
      });
    });
    describe('local-blueprint option and app generator', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ localBlueprint: true, subGenerators: ['app'] });
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchInlineSnapshot(`
Object {
  ".blueprint/app/generator.mjs": Object {
    "stateCleared": "modified",
  },
  ".blueprint/app/index.mjs": Object {
    "stateCleared": "modified",
  },
  ".yo-rc.json": Object {
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });
});
