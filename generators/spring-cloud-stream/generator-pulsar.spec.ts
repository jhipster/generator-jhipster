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
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { buildSamplesFromMatrix, buildServerMatrix, defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { messageBrokerTypes } from '../../lib/jhipster/index.js';
import Generator from './index.js';

const { PULSAR } = messageBrokerTypes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.ts');

const commonConfig = { messageBroker: PULSAR };

const testSamples = buildSamplesFromMatrix(buildServerMatrix(), { commonConfig });

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  Object.entries(testSamples).forEach(([name, config]) => {
    describe(name, () => {
      before(async () => {
        await helpers.run(generatorFile).withJHipsterConfig(config);
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct messageBroker', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"messageBroker": "${PULSAR}"`));
      });
    });
  });
});
