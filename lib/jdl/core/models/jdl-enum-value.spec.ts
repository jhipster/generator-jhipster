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

import { parseFromContent } from '../readers/jdl-reader.ts';
import { createRuntime } from '../runtime.ts';

import JDLEnumValue from './jdl-enum-value.ts';

const runtime = createRuntime();

describe('jdl - JDLEnumValue', () => {
  describe('new', () => {
    describe('when not passing an enum value name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => new JDLEnumValue()).toThrow(/^The enum value name has to be passed to create an enum\.$/);
      });
    });
  });
  describe('toString', () => {
    describe('without a specified enum value', () => {
      let enumValue: JDLEnumValue;

      before(() => {
        enumValue = new JDLEnumValue('FRENCH');
      });

      it('should omit it', () => {
        expect(enumValue.toString()).toBe('FRENCH');
      });
    });
    describe('with a specified enum value', () => {
      let enumValue: JDLEnumValue;

      before(() => {
        enumValue = new JDLEnumValue('FRENCH', 'frenchy');
      });

      it('should include it', () => {
        expect(enumValue.toString()).toBe('FRENCH (frenchy)');
      });
    });
    for (const [value, literal] of [
      ['frenchy', 'frenchy'],
      ['value_123', 'value_123'],
      ['entity', 'entity'],
      ['\u00dc', '"\u00dc"'],
      ['two words', '"two words"'],
      ['a), InjectedEnum(a', '"a), InjectedEnum(a"'],
      ['a) }\nentity Unexpected\n enum Tail { Value(a', '"a) }\\nentity Unexpected\\n enum Tail { Value(a"'],
      ['123', '"123"'],
      ['_value', '"_value"'],
      ['a-b', '"a-b"'],
      ['a.b', '"a.b"'],
      ['value\n', '"value\\n"'],
      [' value ', '" value "'],
      ['a\\b', '"a\\\\b"'],
      ['"', '"\\""'],
      ['a"b', '"a\\"b"'],
      ['a\\"b', '"a\\\\\\"b"'],
      ['a"), InjectedEnum("a', '"a\\"), InjectedEnum(\\"a"'],
      ['', '""'],
    ]) {
      describe(`with value ${JSON.stringify(value)}`, () => {
        it('should emit a valid enum value literal', () => {
          expect(new JDLEnumValue('VALUE', value).toString()).toBe(`VALUE (${literal})`);
        });

        it('should round-trip without introducing JDL declarations', () => {
          const original = parseFromContent(`enum Example { VALUE (${JSON.stringify(value)}) }`, runtime);
          const exported = `enum Example { ${new JDLEnumValue('VALUE', value)} }`;

          expect(parseFromContent(exported, runtime)).toEqual(original);
        });
      });
    }
    for (const name of ['VALUE (a), INJECTED (b)', 'VALUE\n', 'VALUE } entity Unexpected {']) {
      it(`should reject an invalid enum value name ${JSON.stringify(name)}`, () => {
        expect(() => new JDLEnumValue(name).toString()).toThrow('Invalid enum value name');
      });
    }
  });
});
