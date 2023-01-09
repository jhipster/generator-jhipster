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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport } from '../../test/support/tests.mjs';
import { buildServerMatrix } from '../../test/support/index.mjs';
import Generator from './index.mjs';
import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';

import { messageBrokerTypes } from '../../jdl/jhipster/index.mjs';

const { KAFKA } = messageBrokerTypes;

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorFile = join(__dirname, 'index.mts');

const commonConfig = { messageBroker: KAFKA };

const samples = buildServerMatrix();

const samplesBuilder = (): [string, any][] =>
  Object.entries(samples).map(([name, sample]) => [
    name,
    {
      defaults: true,
      applicationWithEntities: {
        config: {
          ...commonConfig,
          ...sample,
        },
      },
    },
  ]);

const testSamples = samplesBuilder();

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  testSamples.forEach(([name, sample]) => {
    describe(name, () => {
      let runResult;

      before(async () => {
        runResult = await helpers.run(generatorFile).withOptions(sample);
      });

      after(() => runResult.cleanup());

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct messageBroker', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"messageBroker": "${KAFKA}"`));
      });
    });
  });
});
