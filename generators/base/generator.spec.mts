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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import jestMock from 'jest-mock';
import lodash from 'lodash';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

import EnvironmentBuilder from '../../cli/environment-builder.js';
import Generator from './generator.cjs';
import { skipPrettierHelpers as helpers } from '../../test/utils/utils.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`JHipster ${generator} generator`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).default[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true }, { bar: true });
    expect(instance.features.bar).toBe(true);
  });

  describe.skip('EnvironmentBuilder', () => {
    let envBuilder;
    before(() => {
      envBuilder = EnvironmentBuilder.createDefaultBuilder();
    });
    it(`should be registered as jhipster:${generator} at yeoman-environment`, async () => {
      expect(await envBuilder.getEnvironment().get(`jhipster:${generator}`)).toBe(Generator);
    });
  });

  describe('skipPriorities', () => {
    const initializing = jestMock.fn();
    const prompting = jestMock.fn();
    const writing = jestMock.fn();
    const postWriting = jestMock.fn();

    class CustomGenerator extends Generator {
      get [Generator.INITIALIZING]() {
        initializing();
        return {};
      }

      get [Generator.PROMPTING]() {
        prompting();
        return {};
      }

      get [Generator.WRITING]() {
        writing();
        return {};
      }

      get [Generator.POST_WRITING]() {
        postWriting();
        return {};
      }
    }

    before(async () => {
      await helpers.run(CustomGenerator).withOptions({
        skipPriorities: ['prompting', 'writing', 'postWriting'],
      });
    });

    it('should skip priorities', async () => {
      expect(initializing).toBeCalled();
      expect(prompting).not.toBeCalled();
      expect(writing).not.toBeCalled();
      expect(postWriting).not.toBeCalled();
    });
  });
});
