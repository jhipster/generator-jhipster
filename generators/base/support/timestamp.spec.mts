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

import { parseChangelog } from './timestamp.mjs';

describe('generator - base - support - timestamp', () => {
  describe('::parseChangelog', () => {
    describe('when not passing parameters', () => {
      it('throws', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => parseChangelog(undefined as any)).toThrow(/^changelogDate is required\.$/);
      });
    });
    describe('when passing a number', () => {
      it('throws', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => parseChangelog(123)).toThrow(/^changelogDate 123 must be a string\.$/);
      });
    });
    describe('when passing an invalid changelogDate', () => {
      it('throws', () => {
        expect(() => parseChangelog('1234')).toThrow(/^changelogDate 1234 is not a valid changelogDate\.$/);
      });
    });
    describe('when passing a valid changelogDate', () => {
      it('returns a date object', () => {
        expect(parseChangelog('20160208210114') instanceof Date).toBeTruthy();
      });
      it('returns the date', () => {
        expect(parseChangelog('20160208210114').toISOString()).toBe('2016-02-08T21:01:14.000Z');
      });
    });
  });
});
