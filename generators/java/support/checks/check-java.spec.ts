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

import { after, afterEach, before, describe, esmocha, expect, it, resetAllMocks } from 'esmocha';

import type checkJava from './check-java.ts';

const { execaCommandSync } = await esmocha.mock('execa', import('execa'));

const baseResult = {
  cwd: '',
  command: 'java',
  escapedCommand: 'java',
  exitCode: 0,
  stdout: '',
  stderr: '',
  failed: false,
  timedOut: false,
} as any;

describe('generator - server - checkJava', () => {
  after(() => {
    esmocha.reset();
  });
  afterEach(() => {
    resetAllMocks();
  });

  describe('with valid java --version output', () => {
    const stderr = 'openjdk 17.0.1 2021-10-19';
    let result: ReturnType<typeof checkJava>;

    before(async () => {
      execaCommandSync.mockReturnValue({ ...baseResult, stderr });
      const { default: checkJava } = await import('./check-java.ts');
      result = checkJava([]);
    });

    it('should return info and javaVersion', async () => {
      expect(result).toMatchObject({
        debug: 'Detected java version 17.0.1',
        javaVersion: '17.0.1',
      });
    });
  });

  describe('with invalid java --version output', () => {
    const stderr = 'foo';
    const exitCode = 1;
    let result: ReturnType<typeof checkJava>;

    before(async () => {
      execaCommandSync.mockReturnValue({ ...baseResult, exitCode, stderr });
      const { default: checkJava } = await import('./check-java.ts');
      result = checkJava([]);
    });

    it('should return error', async () => {
      expect(result.error).toBe('Error parsing Java version. Output: foo');
    });
  });

  describe('on exception', () => {
    let result: ReturnType<typeof checkJava>;

    before(async () => {
      execaCommandSync.mockImplementation(() => {
        throw new Error('foo');
      });
      const { default: checkJava } = await import('./check-java.ts');
      result = checkJava([]);
    });

    it('should return error', async () => {
      expect(result.error).toBe('Java was not found on your computer (foo).');
    });
  });
});
