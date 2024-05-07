/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, it, describe, expect } from 'esmocha';

import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.js';
import { defaultHelpers as helpers, result } from '../../../../testing/index.js';
import Generator from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = `${basename(resolve(__dirname, '../../'))}:${basename(__dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.composedMockedGenerators).toMatchInlineSnapshot('[]');
    });
  });
});
