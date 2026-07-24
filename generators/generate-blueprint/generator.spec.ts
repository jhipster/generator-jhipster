/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { basename } from 'node:path';

import { testBlueprintSupport } from '../../test/support/tests.ts';

import type Generator from './index.ts';

import { createTestHelpers, typedResult } from '#testing';

const generator = basename(import.meta.dirname);
const helpers = createTestHelpers<Generator>({
  importMeta: import.meta,
});
const result = typedResult<Generator>();

const mockedGenerators = ['jhipster:init'];

describe(`generator - ${generator}`, () => {
  it('should support features parameter', async () => {
    expect(await helpers.forwardsFeaturesParameter()).toBe(true);
  });
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await helpers.getCommandHelpOutput()).toMatchSnapshot();
    });
  });
  describe('blueprint support', () => testBlueprintSupport(helpers.commandName!));

  describe('defaults option', () => {
    before(async () => {
      await helpers
        .runJHipster()
        .withOptions({ defaults: true, subGenerators: ['app'], additionalSubGenerators: 'custom, app' })
        .withAnswers({ sbs: false, command: true, priorities: ['writing'] })
        .withSkipWritingPriorities()
        .withMockedGenerators(mockedGenerators);
    });

    it('should apply defaults to selected and additional sub-generators without prompting', () => {
      expect(result.generator.getSubGeneratorStorage('app').getAll()).toMatchObject({
        sbs: true,
        command: false,
        priorities: [],
        written: false,
      });
      expect(result.generator.getSubGeneratorStorage('custom').getAll()).toMatchObject({
        sbs: true,
        command: false,
        priorities: [],
        written: false,
      });
    });
  });

  describe('migration', () => {
    describe('javascriptBlueprint option', () => {
      describe('blueprints prior to v9.0.1', () => {
        before(async () => {
          await helpers.runJHipster().withJHipsterConfig({ jhipsterVersion: '9.0.0' }).commitFiles().withMockedGenerators(mockedGenerators);
        });

        it('should set javascriptBlueprint to true', () => {
          result.assertJHipsterConfigContent({
            javascriptBlueprint: true,
          });
        });
      });

      describe('blueprints after v9.0.1', () => {
        before(async () => {
          await helpers.runJHipster().withJHipsterConfig({ jhipsterVersion: '9.0.1' }).commitFiles().withMockedGenerators(mockedGenerators);
        });

        it('should not set', () => {
          result.assertJHipsterConfigContent({
            javascriptBlueprint: undefined,
          });
        });
      });
    });
  });

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster().withJHipsterConfig().withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        result.assertGeneratorComposedOnce('jhipster:init');
      });
      it('should write files and match snapshot', () => {
        expect(result.getStateSnapshot()).toMatchSnapshot();
      });
      it('should match application snapshot', () => {
        const { application } = result;
        expect(application).toMatchSnapshot({
          jhipsterPackageJson: expect.any(Object),
        });
      });
    });
    describe('all option', () => {
      before(async () => {
        await helpers.runJHipster().withOptions({ allGenerators: true }).withMockedGenerators(mockedGenerators);
      });
      it('should compose with init generator', () => {
        result.assertGeneratorComposedOnce('jhipster:init');
      });
      it('should match snapshot', () => {
        expect(result.getStateSnapshot()).toMatchSnapshot();
      });
      it('should match application snapshot', () => {
        const { application } = result;
        expect(application).toMatchSnapshot({
          jhipsterPackageJson: expect.any(Object),
          generators: expect.any(Object),
          subGenerators: expect.any(Array),
        });
      });
    });
    describe('local-blueprint option', () => {
      before(async () => {
        await helpers.runJHipster().withOptions({ localBlueprint: true }).withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        result.assertGeneratorNotComposed('jhipster:init');
      });
      it('should match snapshot', () => {
        expect(result.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "stateCleared": "modified",
  },
}
`);
      });
      it('should match application snapshot', () => {
        const { application } = result;
        expect(application).toMatchSnapshot({
          jhipsterPackageJson: expect.any(Object),
        });
      });
    });
    describe('local-blueprint option and app generator', () => {
      before(async () => {
        await helpers
          .runJHipster()
          .withOptions({ localBlueprint: true, subGenerators: ['app'], allPriorities: true })
          .withMockedGenerators(mockedGenerators);
      });
      it('should not compose with init generator', () => {
        result.assertGeneratorNotComposed('jhipster:init');
      });
      it('should write java files with gradle build tool and match snapshot', () => {
        expect(result.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".blueprint/app/command.ts": {
    "stateCleared": "modified",
  },
  ".blueprint/app/generator.ts": {
    "stateCleared": "modified",
  },
  ".blueprint/app/index.ts": {
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
      it('should match application snapshot', () => {
        const { application } = result;
        expect(application).toMatchSnapshot({
          jhipsterPackageJson: expect.any(Object),
        });
      });
    });
  });
});
