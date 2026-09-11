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

import { JDLEnum } from './index.ts';

describe('jdl - JDLEnum', () => {
  describe('new', () => {
    describe('when not passing any argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JDLEnum();
        }).toThrow("The enum's name must be passed to create an enum.");
      });
    });
    describe('when not passing a name', () => {
      it('should fail', () => {
        expect(() => {
          new JDLEnum({ values: [{ key: 'ABC' }], comment: 'My enumeration.' });
        }).toThrow("The enum's name must be passed to create an enum.");
      });
    });
    describe('when passing arguments', () => {
      it('should use them', () => {
        new JDLEnum({ name: 'MyEnum', values: [{ key: 'ABC' }] });
      });
    });
  });
  describe('getValuesAsString', () => {
    let result: string;

    before(() => {
      const jdlEnum = new JDLEnum({ name: 'Toto', values: [{ key: 'A', value: 'aaaa' }, { key: 'B' }] });
      result = jdlEnum.getValuesAsString();
    });

    it('should return the values separated by a comma', () => {
      expect(result).toBe('A (aaaa),B');
    });

    it('should preserve raw custom values in entity JSON', () => {
      const jdlEnum = new JDLEnum({
        name: 'Language',
        values: [
          { key: 'SPECIAL', value: '\u00dc' },
          { key: 'SPACE', value: 'two words' },
        ],
      });

      expect(jdlEnum.getValuesAsString()).toBe('SPECIAL (\u00dc),SPACE (two words)');
    });

    for (const value of ['', ',', ', ', 'a), InjectedEnum(a', 'a)b', 'a\nb', 'a\rb', 'a\u2028b', 'a\u2029b']) {
      it(`should direct legacy-only callers to structured storage for ${JSON.stringify(value)}`, () => {
        const jdlEnum = new JDLEnum({ name: 'Example', values: [{ key: 'VALUE', value }] });

        expect(() => jdlEnum.getValuesAsString()).toThrow(
          'The enum Example requires structured entity JSON values. Use getValues() instead.',
        );
      });
    }

    it('should reject malformed enum names in entity JSON', () => {
      const jdlEnum = new JDLEnum({ name: 'Example', values: [{ key: 'VALUE, INJECTED' }] });

      expect(() => jdlEnum.getValuesAsString()).toThrow('Invalid enum entry in entity JSON');
    });
  });
  describe('getValues', () => {
    for (const value of ['', '"', ', ', 'a), InjectedEnum(a', '(', ')', 'a\nb', 'a\rb', 'a\u2028b', 'a\u2029b']) {
      it(`should preserve complex custom values in structured entity JSON: ${JSON.stringify(value)}`, () => {
        const jdlEnum = new JDLEnum({ name: 'Example', values: [{ key: 'VALUE', value }, { key: 'OTHER' }] });

        expect(jdlEnum.getValues()).toEqual([{ name: 'VALUE', value }, { name: 'OTHER' }]);
      });
    }
  });
  describe('getValueJavadocs', () => {
    let result: Record<string, string>;

    before(() => {
      const jdlEnum = new JDLEnum({
        name: 'Toto',
        values: [
          { key: 'A', value: 'aaaa', comment: 'first comment' },
          { key: 'B', comment: 'second comment' },
        ],
      });
      result = jdlEnum.getValueJavadocs();
    });

    it('returns the comments by enum value', () => {
      expect(result).toMatchInlineSnapshot(`
{
  "A": "first comment",
  "B": "second comment",
}
`);
    });
  });
  describe('toString', () => {
    it('should preserve the top-level declaration payload from PR 34901 as one value', () => {
      const value = 'x)\n}\nentity Injected {\n  secret String\n}\nenum Dummy {\n  A(a';
      const exported = new JDLEnum({ name: 'Colors', values: [{ key: 'RED', value }] }).toString();
      const parsed = parseFromContent(exported, createRuntime());

      expect(parsed.entities).toEqual([]);
      expect(parsed.enums.map(enumDefinition => enumDefinition.name)).toEqual(['Colors']);
      expect(parsed.enums[0].values).toEqual([{ key: 'RED', value }]);
    });

    it('should round-trip special characters and injection payloads', () => {
      const runtime = createRuntime();
      const original = parseFromContent('enum SpecialChars { Ue ("\u00dc"), Injected ("a), InjectedEnum(a") }', runtime);
      const exported = new JDLEnum(original.enums[0]).toString();

      expect(parseFromContent(exported, runtime)).toEqual(original);
      expect(parseFromContent(exported, runtime).enums[0].values).toEqual([
        { key: 'Ue', value: '\u00dc' },
        { key: 'Injected', value: 'a), InjectedEnum(a' },
      ]);
    });

    describe('with simple enum values', () => {
      let values: any[] = [];
      let jdlEnum: JDLEnum;

      before(() => {
        values = [{ key: 'FRENCH' }, { key: 'ENGLISH' }, { key: 'ICELANDIC' }];
        jdlEnum = new JDLEnum({
          name: 'Language',
          values,
          comment: 'The language enumeration.',
        });
      });

      it('should stringify the enum', () => {
        expect(jdlEnum.toString()).toBe(
          `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  ${values.map(value => value.key).join(',\n  ')}
}`,
        );
      });
    });
    describe('with explicit enum values', () => {
      let values: any[] = [];
      let jdlEnum: JDLEnum;

      before(() => {
        values = [{ key: 'FRENCH', value: 'french' }, { key: 'ENGLISH', value: 'english' }, { key: 'ICELANDIC' }];
        jdlEnum = new JDLEnum({
          name: 'Language',
          values,
          comment: 'The language enumeration.',
        });
      });

      it('should stringify the enum', () => {
        expect(jdlEnum.toString()).toBe(
          `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  FRENCH (french),
  ENGLISH (english),
  ICELANDIC
}`,
        );
      });
    });
  });
});
