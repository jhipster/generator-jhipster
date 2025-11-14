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
import { basename } from 'node:path';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { basicTests, getCommandHelpOutput, testBlueprintSupport } from '../../test/support/tests.ts';

import { defaultConfig, requiredConfig } from './config.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  basicTests({
    generatorNamespace: generator,
    requiredConfig,
    defaultConfig,
    customPrompts: {},
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await getCommandHelpOutput(generator)).toMatchSnapshot();
    });
  });
  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators(['bootstrap'])
          .withSharedApplication({ projectDescription: 'projectDescription', prettierTabWidth: 'prettierTabWidth' })
          .withJHipsterConfig();
      });
      it('should write files and match snapshot', () => {
        expect(result.getStateSnapshot()).toMatchSnapshot();
      });

      it('should compose with generators', () => {
        expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:git",
  "jhipster:javascript-simple-application:eslint",
  "jhipster:javascript-simple-application:husky",
  "jhipster:javascript-simple-application:prettier",
]
`);
      });
    });
  });
});
