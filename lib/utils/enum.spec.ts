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

import { describe, expect, it } from 'esmocha';

import { parseEnumValues, serializeEnumValues } from './enum.ts';

describe('enum values storage', () => {
  for (const value of ['Ü', 'two words', ' value ', 'a\\b', String.raw`\n`, String.raw`\u0041`, 'a-b', "it's a value"]) {
    it(`should retain legacy storage for ${JSON.stringify(value)}`, () => {
      const entries = [{ name: 'VALUE', value }, { name: 'OTHER' }];
      const stored = serializeEnumValues(entries);

      expect(stored).toBe(`VALUE (${value}),OTHER`);
      expect(parseEnumValues(stored)).toEqual(entries);
    });
  }

  for (const value of ['"', ', ', 'a), InjectedEnum(a', '(', ')', '()', '', 'a\nb', 'a\rb', 'a\u2028b', 'a\u2029b']) {
    it(`should use structured storage for ${JSON.stringify(value)}`, () => {
      const entries = [{ name: 'VALUE', value }, { name: 'OTHER' }];
      const stored = serializeEnumValues(entries);

      expect(stored).toEqual(entries);
      expect(parseEnumValues(JSON.parse(JSON.stringify(stored)))).toEqual(entries);
    });
  }

  it('should not decode quotes and escapes in old raw values', () => {
    expect(parseEnumValues(String.raw`VALUE ("a\nb"),OTHER (a\"b)`)).toEqual([
      { name: 'VALUE', value: String.raw`"a\nb"` },
      { name: 'OTHER', value: String.raw`a\"b` },
    ]);
  });

  it('should preserve absence versus explicit empty custom values', () => {
    const entries = [{ name: 'ABSENT' }, { name: 'EMPTY', value: '' }];
    expect(parseEnumValues(entries)).toEqual(entries);
    expect(parseEnumValues('ABSENT,EMPTY ()')).toEqual(entries);
  });

  it('should reject ambiguous or malformed legacy strings rather than inventing custom values', () => {
    for (const value of ['VALUE (a,b)', 'VALUE (a)b)', 'VALUE (unclosed', 'VALUE,', 'VALUE } entity Injected {']) {
      expect(() => parseEnumValues(value)).toThrow('Invalid enum entry');
    }
  });

  it('should support language tags only for client constants', () => {
    expect(parseEnumValues('en,pt-br', { clientConstants: true })).toEqual([{ name: 'en' }, { name: 'pt-br' }]);
    expect(() => parseEnumValues('en,pt-br')).toThrow('Invalid enum entry');
    expect(() => parseEnumValues('en);injected', { clientConstants: true })).toThrow('Invalid enum entry');
  });
});
