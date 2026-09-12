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
import { fileURLToPath } from 'node:url';

import type { EnumValues } from '../../utils/enum.ts';
import { parseFromContent } from '../core/readers/jdl-reader.ts';
import { createRuntime } from '../core/runtime.ts';
import type { JSONEntity } from '../core/types/json-config.ts';

import { convert as convertFields } from './jdl-to-json/jdl-to-json-field-converter.ts';
import { convertSingleContentToJDL, convertToJDL } from './json-to-jdl-converter.ts';
import { convertEntitiesToJDL } from './json-to-jdl-entity-converter.ts';

describe('jdl - JSONToJDLEntityConverter enum export', () => {
  const runtime = createRuntime();
  const convertEnum = (fieldValues: EnumValues) =>
    convertEntitiesToJDL(
      new Map<string, JSONEntity>([
        ['Example', { name: 'Example', fields: [{ fieldName: 'value', fieldType: 'CustomEnum', fieldValues }], relationships: [] }],
      ]),
    );
  const exportEnum = (fieldValues: EnumValues) => convertEnum(fieldValues).toString();

  describe('PR 34901 declaration payload in entity JSON', () => {
    const value = 'x)\n}\nentity Injected {\n  secret String\n}\nenum Dummy {\n  A(a';
    const entity: JSONEntity = JSON.parse(
      JSON.stringify({
        name: 'Palette',
        fields: [{ fieldName: 'color', fieldType: 'Colors', fieldValues: [{ name: 'RED', value }, { name: 'BLUE' }] }],
        relationships: [],
      }),
    );
    const entities = new Map([['Palette', entity]]);
    const assertOriginalDeclarations = (exported: string) => {
      const parsed = parseFromContent(exported, runtime);

      expect(parsed.entities.map(({ name }) => name)).toEqual(['Palette']);
      expect(parsed.enums.map(({ name }) => name)).toEqual(['Colors']);
      expect(parsed.enums[0].values).toEqual([{ key: 'RED', value }, { key: 'BLUE' }]);
    };

    it('should keep the payload as one value when exporting structured entity JSON', () => {
      assertOriginalDeclarations(convertEntitiesToJDL(entities).toString());
    });

    it('should preserve the payload when exporting application config with entity JSON', () => {
      const exported = convertSingleContentToJDL({ 'generator-jhipster': { baseName: 'enumRoundtrip' } }, runtime, entities);

      assertOriginalDeclarations(exported);
      expect(parseFromContent(exported, runtime).applications).toHaveLength(1);
    });

    it('should preserve the payload through the actual .yo-rc.json and .jhipster file export path', () => {
      const directory = fileURLToPath(new URL('../core/__test-support__/files/json_to_jdl_converter/enum_values/', import.meta.url));
      const exported = convertToJDL(runtime, directory, false);

      expect(exported).toBeDefined();
      assertOriginalDeclarations(exported!.toString());
    });

    it('should reject the ambiguous legacy encoding instead of recovering guessed declarations or values', () => {
      expect(() => exportEnum(`RED (${value}),BLUE`)).toThrow('Invalid enum entry in entity JSON');
    });

    it('should reject declaration payloads used as structured enum names', () => {
      expect(() => exportEnum([{ name: value }])).toThrow('Invalid enum entry in entity JSON');
    });
  });

  for (const value of [
    '\u00dc',
    'two words',
    ' value ',
    '_value',
    'a-b',
    'a.b',
    'a\\b',
    String.raw`\n`,
    String.raw`\u0041`,
    'a(b',
    '"',
    '',
  ]) {
    it(`should preserve the custom value ${JSON.stringify(value)} through JSON export`, () => {
      const exported = exportEnum(`VALUE (${value}), OTHER`);

      expect(parseFromContent(exported, runtime).enums[0].values).toEqual([{ key: 'VALUE', value }, { key: 'OTHER' }]);
    });
  }

  it('should support custom values without whitespace before the parentheses', () => {
    expect(parseFromContent(exportEnum('VALUE(custom)'), runtime).enums[0].values).toEqual([{ key: 'VALUE', value: 'custom' }]);
  });

  for (const value of ['\u00dc', '"', '\\', ', ', 'a), InjectedEnum(a', '()', '', 'a\nb', 'a\rb', 'a\u2028b', 'a\u2029b', '\t\b\f\0']) {
    it(`should roundtrip structured custom values ${JSON.stringify(value)}`, () => {
      const fieldValues = [{ name: 'VALUE', value }, { name: 'OTHER' }];
      const jdlObject = convertEnum(fieldValues);
      const parsed = parseFromContent(jdlObject.toString(), runtime);

      expect(parsed.enums).toHaveLength(1);
      expect(parsed.enums[0].values).toEqual([{ key: 'VALUE', value }, { key: 'OTHER' }]);
      const storedValues = convertFields(jdlObject).get('Example')?.[0].fieldValues;
      expect(parseFromContent(exportEnum(storedValues!), runtime).enums[0].values).toEqual(parsed.enums[0].values);
    });
  }

  for (const fieldValues of [
    'VALUE (a) }\nentity Unexpected\n enum Tail { Value(a)',
    'VALUE (a,b)',
    'VALUE (a)b)',
    'VALUE (a\nb)',
    'VALUE (a\rb)',
    'VALUE (a\u2028b)',
    'VALUE (a\u2029b)',
    'VALUE (unclosed',
    'VALUE } entity Unexpected {',
  ]) {
    it(`should reject malformed entity JSON enum entries: ${JSON.stringify(fieldValues)}`, () => {
      expect(() => exportEnum(fieldValues)).toThrow('Invalid enum entry in entity JSON');
    });
  }

  const malformedValues: unknown[] = [
    null,
    42,
    {},
    [],
    ['VALUE'],
    [null],
    [{}],
    [{ name: '' }],
    [{ name: 'lowercase' }],
    [{ name: '1VALUE' }],
    [{ name: 'VALUE,INJECTED' }],
    [{ name: 'VALUE\n' }],
    [{ name: 42 }],
    [{ name: 'VALUE', value: null }],
    [{ name: 'VALUE', value: undefined }],
    [{ name: 'VALUE', value: 42 }],
    [{ name: 'VALUE', value: [] }],
    [{ name: 'VALUE', values: 'typo' }],
  ];
  for (const fieldValues of malformedValues) {
    it(`should reject malformed structured enum entries: ${JSON.stringify(fieldValues)}`, () => {
      expect(() => exportEnum(fieldValues as EnumValues)).toThrow('Invalid enum entry in entity JSON');
    });
  }

  it('should reject duplicate enum names in either representation', () => {
    expect(() => exportEnum('VALUE,VALUE(custom)')).toThrow('Duplicate enum value name');
    expect(() => exportEnum([{ name: 'VALUE' }, { name: 'VALUE', value: 'custom' }])).toThrow('Duplicate enum value name');
  });
});
