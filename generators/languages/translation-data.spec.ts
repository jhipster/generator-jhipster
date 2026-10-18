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

import TranslationData from './translation-data.ts';

const createTranslationData = (translations: Record<string, any>) =>
  new TranslationData({ generator: { log: { warn: () => {}, debug: () => {} } } as any, translations });

describe('generator - languages - translation-data', () => {
  describe('getClientTranslation', () => {
    const translationData = createTranslationData({
      global: {
        minlength: 'Minimum length {{ min }}.',
        compact: 'From {{first}} to {{second}}',
        nested: 'Hello {{ user.name }}',
        notPlaceholders: '<% ignored %> {{ a + b }}',
      },
    });

    it('returns the translation as it is without data', () => {
      expect(translationData.getClientTranslation('global.minlength')).toBe('Minimum length {{ min }}.');
    });

    it('replaces each placeholder by its value', () => {
      expect(translationData.getClientTranslation('global.minlength', { min: 4 })).toBe('Minimum length 4.');
      expect(translationData.getClientTranslation('global.compact', { first: 1, second: 2 })).toBe('From 1 to 2');
    });

    it('replaces a placeholder by a nested value', () => {
      expect(translationData.getClientTranslation('global.nested', { user: { name: 'Ana' } })).toBe('Hello Ana');
    });

    it('keeps the rest of the translation as text', () => {
      expect(translationData.getClientTranslation('global.notPlaceholders', { a: 1, b: 2 })).toBe('<% ignored %> {{ a + b }}');
    });

    it('replaces a null value by an empty text', () => {
      expect(translationData.getClientTranslation('global.minlength', { min: null })).toBe('Minimum length .');
    });

    it('fails on a placeholder without value', () => {
      expect(() => translationData.getClientTranslation('global.minlength', {})).toThrow(
        'Missing the value of min for the translation global.minlength',
      );
    });
  });
});
