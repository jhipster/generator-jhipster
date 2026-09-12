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
import assert from 'node:assert';

import { getEnumInfo } from './enum.ts';

describe('base-application - support - enum', () => {
  describe('::getEnumInfo', () => {
    it('preserves custom values and their presence in structured entries', () => {
      const values = ['Ü', '"', '\\', ', ', 'a), InjectedEnum(a', '()', '', 'a\nb', "it's a value"];
      const fieldValues = [...values.map((value, index) => ({ name: `VALUE${index}`, value })), { name: 'OTHER' }];
      const info = getEnumInfo({
        fieldType: 'CustomEnum',
        fieldValues,
        fieldValuesJavadocs: { VALUE6: 'Empty custom value' },
      });

      expect(info.withoutCustomValues).toBe(false);
      expect(info.withSomeCustomValues).toBe(true);
      expect(info.withCustomValues).toBe(false);
      expect(info.enumValues.map(({ name, value }) => ({ name, value }))).toEqual([
        ...fieldValues.slice(0, -1),
        { name: 'OTHER', value: 'OTHER' },
      ]);
      expect(info.enumValues[6].comment).toBe('    /**\n     * Empty custom value\n     */');
    });

    it('recognizes an explicitly empty custom value as a custom value', () => {
      const info = getEnumInfo({ fieldType: 'CustomEnum', fieldValues: [{ name: 'EMPTY', value: '' }] });

      expect(info.withCustomValues).toBe(true);
      expect(info.withoutCustomValues).toBe(false);
      expect(info.enumValues).toEqual([{ name: 'EMPTY', value: '', comment: undefined }]);
    });

    it('does not decode legacy custom values', () => {
      expect(getEnumInfo({ fieldType: 'CustomEnum', fieldValues: String.raw`VALUE ("a\nb")` }).enumValues).toEqual([
        { name: 'VALUE', value: String.raw`"a\nb"`, comment: undefined },
      ]);
    });

    it('supports built-in client language constants', () => {
      expect(getEnumInfo({ fieldType: 'Languages', fieldValues: 'en,pt-br', clientConstantsAsValues: true }).enumValues).toEqual([
        { name: 'en', value: 'en', comment: undefined },
        { name: 'pt-br', value: 'pt-br', comment: undefined },
      ]);
    });

    it('rejects malformed entries before rendering templates', () => {
      for (const fieldValues of [[{ name: 'VALUE,INJECTED' }], [{ name: 'VALUE\n' }], 'VALUE (a)b)']) {
        expect(() => getEnumInfo({ fieldType: 'CustomEnum', fieldValues })).toThrow('Invalid enum entry');
      }
    });

    describe('when passing field data', () => {
      let enumInfo: ReturnType<typeof getEnumInfo>;

      before(() => {
        const clientRootFolder = 'root';
        const field = { enumName: 'fieldName', fieldType: 'BigLetters', fieldValues: 'AAA, BBB', fieldTypeDocumentation: 'enum comment' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it("returns the enum's name", () => {
        assert.strictEqual(enumInfo.enumName, 'BigLetters');
      });
      it("returns the enum's instance", () => {
        assert.strictEqual(enumInfo.enumInstance, 'bigLetters');
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enums, ['AAA', 'BBB']);
      });
      it('returns the enums comment', () => {
        assert.deepStrictEqual(enumInfo.enumJavadoc, '/**\n * enum comment\n */');
      });
    });
    describe("when the enums don't have custom values", () => {
      let enumInfo: ReturnType<typeof getEnumInfo>;

      before(() => {
        const clientRootFolder = 'root';
        const field = { fieldType: 'fieldName', fieldValues: 'AAA, BBB' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns whether there are custom enums', () => {
        assert.strictEqual(enumInfo.withoutCustomValues, true);
        assert.strictEqual(enumInfo.withSomeCustomValues, false);
        assert.strictEqual(enumInfo.withCustomValues, false);
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enumValues, [
          { name: 'AAA', value: 'AAA', comment: undefined },
          { name: 'BBB', value: 'BBB', comment: undefined },
        ]);
      });
    });
    describe('when some enums have custom values', () => {
      let enumInfo: ReturnType<typeof getEnumInfo>;

      before(() => {
        const clientRootFolder = 'root';
        const field = { fieldType: 'fieldName', fieldValues: 'AAA(aaa), BBB' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns whether there are custom enums', () => {
        assert.strictEqual(enumInfo.withoutCustomValues, false);
        assert.strictEqual(enumInfo.withSomeCustomValues, true);
        assert.strictEqual(enumInfo.withCustomValues, false);
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enumValues, [
          {
            name: 'AAA',
            value: 'aaa',
            comment: undefined,
          },
          { name: 'BBB', value: 'BBB', comment: undefined },
        ]);
      });
    });
    describe('when all the enums have custom values', () => {
      describe('without spaces inside them', () => {
        let enumInfo: ReturnType<typeof getEnumInfo>;

        before(() => {
          const clientRootFolder = 'root';
          const field = { fieldType: 'fieldName', fieldValues: 'AAA(aaa), BBB(bbb)' };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: undefined,
            },
            { name: 'BBB', value: 'bbb', comment: undefined },
          ]);
        });
      });
      describe('with spaces inside them', () => {
        let enumInfo: ReturnType<typeof getEnumInfo>;

        before(() => {
          const clientRootFolder = 'root';
          const field = { fieldType: 'fieldName', fieldValues: 'AAA(aaa), BBB(bbb and b)' };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: undefined,
            },
            { name: 'BBB', value: 'bbb and b', comment: undefined },
          ]);
        });
      });
      describe('with comments over them', () => {
        let enumInfo: ReturnType<typeof getEnumInfo>;

        before(() => {
          const clientRootFolder = 'root';
          const field = {
            fieldType: 'fieldName',
            fieldValues: 'AAA(aaa), BBB(bbb and b)',
            fieldValuesJavadocs: {
              AAA: 'first comment',
              BBB: 'second comment',
            },
          };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: '    /**\n     * first comment\n     */',
            },
            { name: 'BBB', value: 'bbb and b', comment: '    /**\n     * second comment\n     */' },
          ]);
        });
      });
    });
    describe('when not passing a client root folder', () => {
      let enumInfo: ReturnType<typeof getEnumInfo>;

      before(() => {
        const field = { fieldType: 'fieldName', fieldValues: 'AAA, BBB' };
        enumInfo = getEnumInfo(field);
      });

      it('returns an empty string for the clientRootFolder property', () => {
        assert.strictEqual(enumInfo.clientRootFolder, '');
      });
    });
    describe('when passing a client root folder', () => {
      let enumInfo: ReturnType<typeof getEnumInfo>;

      before(() => {
        const field = { fieldType: 'fieldName', fieldValues: 'AAA, BBB' };
        const clientRootFolder = 'root';
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns the clientRootFolder property suffixed by a dash', () => {
        assert.strictEqual(enumInfo.clientRootFolder, 'root-');
      });
    });
  });
});
