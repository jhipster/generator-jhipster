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

import { detectCrLf } from './auto-crlf-transform.ts';

import { defaultHelpers as helpers } from '#testing';

describe('generator - bootstrap - utils', () => {
  describe('::detectCrLf', () => {
    before(async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles({
          'crlf.txt': 'a\r\ncrlf file',
          'lf.txt': 'a\nlf file',
          'lf-single.txt': 'a single line file',
        })
        .commitFiles();
    });

    describe('passing a crlf file', () => {
      it('should return true', async () => {
        expect(await detectCrLf('crlf.txt')).toBe(true);
      });
    });
    describe('passing a lf file', () => {
      it('should return false', async () => {
        expect(await detectCrLf('lf.txt')).toBe(false);
      });
    });
    describe('passing a single line file', () => {
      it('should return undefined', async () => {
        expect(await detectCrLf('lf-single.txt')).toBe(undefined);
      });
    });
  });
});
