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

import { parseEnumValuesInput } from './enum.ts';

describe('entity - enum prompt values', () => {
  it('should uppercase ordinary names as before', () => {
    expect(parseEnumValuesInput('one,two')).toBe('ONE,TWO');
  });

  it('should preserve custom values while uppercasing names', () => {
    expect(parseEnumValuesInput('one(two words),two(Ü)')).toBe('ONE (two words),TWO (Ü)');
  });

  it('should accept JSON input for values containing delimiters, quotes, escapes and newlines', () => {
    const entries = [{ name: 'one', value: 'a), Injected(a\n"\\' }, { name: 'two', value: '' }, { name: 'three' }];
    const expected = [{ name: 'ONE', value: entries[0].value }, { name: 'TWO', value: '' }, { name: 'THREE' }];

    expect(parseEnumValuesInput(JSON.stringify(entries))).toEqual(expected);
    expect(parseEnumValuesInput(entries)).toEqual(expected);
  });

  it('should reject malformed input and names', () => {
    for (const input of ['[]', '[', '[null]', '[{"name":"ONE","value":42}]', 'a-b', '1VALUE', 'VALUE,', 'one,ONE']) {
      expect(() => parseEnumValuesInput(input)).toThrow();
    }
  });
});
