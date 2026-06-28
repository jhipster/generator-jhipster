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

import { beforeEach, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers } from '../lib/testing/index.ts';

import { createProgram } from './program.ts';

describe('cli - program', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('adding a negative option', () => {
    it('when executing should not set insight', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster']);
      expect(command.opts().insight).toBeUndefined();
    });
    it('when executing with --insight should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--insight']);
      expect(command.opts().insight).toBe(true);
    });
    it('when executing with --no-insight should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--no-insight']);
      expect(command.opts().insight).toBe(false);
    });
  });

  describe('adding a option with default value', () => {
    it('when executing should not set insight', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster']);
      expect(command.opts().skipYoResolve).toBe(false);
    });
    it('when executing with --skip-yo-resolve should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--skip-yo-resolve']);
      expect(command.opts().skipYoResolve).toBe(true);
    });
    it('when executing with --no-skip-yo-resolve should set insight to false', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--no-skip-yo-resolve']);
      expect(command.opts().skipYoResolve).toBe(false);
    });
  });
});
