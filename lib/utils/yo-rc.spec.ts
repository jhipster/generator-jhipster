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

import { describe, expect, it } from 'expect-node';

import { mergeConfigContent, mergeYoRcContent } from './yo-rc.ts';

describe('lib > utils > yo-rc', () => {
  describe('mergeConfigContent', () => {
    it('merges the objects deeply and keeps what the new content does not state', () => {
      expect(mergeConfigContent({ a: 1, nested: { b: 2, c: 3 } }, { nested: { c: 4 }, d: 5 })).toEqual({
        a: 1,
        nested: { b: 2, c: 4 },
        d: 5,
      });
    });

    it('replaces an array by the new one', () => {
      expect(
        mergeConfigContent(
          { languages: ['en', 'fr'], fields: [{ fieldName: 'a' }, { fieldName: 'b' }] },
          { languages: ['pt'], fields: [] },
        ),
      ).toEqual({ languages: ['pt'], fields: [] });
    });

    it('keeps the old value of a property the new content leaves undefined', () => {
      expect(mergeConfigContent({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
    });

    it('does not change the old content', () => {
      const oldContent = { nested: { b: 2 } };
      mergeConfigContent(oldContent, { nested: { b: 3 } });
      expect(oldContent).toEqual({ nested: { b: 2 } });
    });
  });

  describe('mergeYoRcContent', () => {
    it('merges each namespace and keeps the creation timestamp written before', () => {
      expect(
        mergeYoRcContent(
          { 'generator-jhipster': { creationTimestamp: 1, nested: { a: 1 } }, other: { b: 1 } },
          { 'generator-jhipster': { creationTimestamp: 2, nested: { c: 2 } } },
        ),
      ).toEqual({ 'generator-jhipster': { creationTimestamp: 1, nested: { a: 1, c: 2 } }, other: { b: 1 } });
    });
  });
});
