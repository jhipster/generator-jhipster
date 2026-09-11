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

import ejs from 'ejs';
import { describe, expect, it } from 'esmocha';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

import type { EnumValues } from '../../../lib/utils/enum.ts';

import { getEnumInfo } from './enum.ts';

const render = (path: string, fieldValues: EnumValues) =>
  ejs.render(readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'), {
    ...getEnumInfo({ fieldType: 'CustomEnum', fieldValues }),
    entityAbsolutePackage: 'com.example',
    frontendAppName: 'sampleApp',
  });

const javaTemplate = 'java/generators/domain/templates/src/main/java/_package_/_entityPackage_/domain/enumeration/_enumName_.java.ejs';
const tsTemplate = 'client/templates/src/main/webapp/app/entities/enumerations/enum.model.ts.ejs';
const i18nTemplate = 'client/generators/i18n/templates/entity/i18n/enum.json.ejs';

describe('enum template escaping', () => {
  for (const [format, fieldValues] of Object.entries({
    legacy: String.raw`UNICODE (Ü),SPACES (two words),QUOTE ("),BACKSLASH (a\nb),APOSTROPHE (it's a value),OTHER`,
    structured: [
      { name: 'UNICODE', value: 'Ü' },
      { name: 'QUOTE', value: '"' },
      { name: 'BACKSLASH', value: '\\' },
      { name: 'COMMA', value: ', ' },
      { name: 'DELIMITERS', value: 'a), InjectedEnum(a' },
      { name: 'PARENTHESES', value: '()' },
      { name: 'EMPTY', value: '' },
      { name: 'NEWLINES', value: 'a\r\nb' },
      { name: 'SEPARATORS', value: 'a\u2028b\u2029c' },
      { name: 'CONTROLS', value: '\t\b\f\0' },
      { name: 'APOSTROPHE', value: "it's a value" },
      { name: 'UNICODE_ESCAPE', value: String.raw`\u000a` },
      { name: 'OTHER' },
    ],
  } satisfies Record<string, EnumValues>)) {
    const expectedValues = getEnumInfo({ fieldType: 'CustomEnum', fieldValues }).enumValues;

    it(`should escape Java custom values from ${format} storage`, () => {
      const source = render(javaTemplate, fieldValues);

      expect(source).toMatchSnapshot();
      const renderedValues = [...source.matchAll(/^\s+(\w+)\(("(?:[^"\\]|\\.)*")\)/gm)].map(([, name, literal]) => ({
        name,
        value: JSON.parse(literal),
      }));
      expect(renderedValues).toEqual(
        expectedValues.filter(({ name, value }) => name !== value).map(({ name, value }) => ({ name, value })),
      );
    });

    it(`should generate executable TypeScript enums from ${format} storage`, () => {
      const source = render(tsTemplate, fieldValues);

      expect(source).toMatchSnapshot();
      const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS }, reportDiagnostics: true });
      expect(compiled.diagnostics).toEqual([]);
      const exports: { CustomEnum?: Record<string, string> } = {};
      runInNewContext(compiled.outputText, { exports });
      expect(exports.CustomEnum).toEqual(Object.fromEntries(expectedValues.map(({ name, value }) => [name, value])));
    });

    it(`should generate valid i18n JSON from ${format} storage`, () => {
      const source = render(i18nTemplate, fieldValues);

      expect(source).toMatchSnapshot();
      expect(JSON.parse(source).sampleApp.CustomEnum).toEqual({
        null: '',
        ...Object.fromEntries(expectedValues.map(({ name, value }) => [name, value])),
      });
    });
  }
});
