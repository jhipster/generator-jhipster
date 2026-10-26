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
import { before, describe, expect, it } from 'expect-node';
import { basename, dirname, resolve } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(dirname(import.meta.dirname), '../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig();
    });

    it('should write no file of its own', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should derive the table prefix of JHipster from the prefix', () => {
      expect(result.application!.jhiTablePrefix).toBe('jhi');
    });
  });

  describe('with a prefix of its own', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withJHipsterConfig({ jhiPrefix: 'myPrefix' });
    });

    it('should derive the table prefix from it, in snake case', () => {
      expect(result.application!.jhiTablePrefix).toBe('my_prefix');
    });
  });
});
