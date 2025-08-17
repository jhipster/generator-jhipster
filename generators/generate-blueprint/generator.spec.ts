/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const mockedGenerators = ['jhipster:init'];

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    const GENERATOR_LIST: Record<string, string> = await import('../generator-list.ts');
    await expect(GENERATOR_LIST[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig().withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:init');
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('all option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ allGenerators: true }).withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:init');
      });
      it('should match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
    describe('local-blueprint option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ localBlueprint: true }).withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:init');
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
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withOptions({ localBlueprint: true, subGenerators: ['app'], allPriorities: true })
          .withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:init');
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
