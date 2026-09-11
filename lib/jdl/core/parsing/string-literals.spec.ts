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

import JDLEntity from '../models/jdl-entity.ts';
import JDLField from '../models/jdl-field.ts';
import JDLRelationship from '../models/jdl-relationship.ts';
import ListJDLApplicationConfigurationOption from '../models/list-jdl-application-configuration-option.ts';
import StringJDLApplicationConfigurationOption from '../models/string-jdl-application-configuration-option.ts';
import { parseFromContent } from '../readers/jdl-reader.ts';
import { createRuntime } from '../runtime.ts';
import { parseJDLString } from '../utils/jdl-string.ts';

import { parse } from './api.ts';

describe('jdl - escaped string literals', () => {
  const runtime = createRuntime();

  it('should import the quoted enum values from issue 31082', () => {
    const parsed = parseFromContent(
      String.raw`enum SpecialChars {
  Ue ("Ü")
  ESCAPING_WORKS("\\")
  ESCAPED_QUOTES_FAIL("\"")
  COMMA_SPACE (", ")
}`,
      runtime,
    );

    expect(parsed.enums[0].values).toEqual([
      { key: 'Ue', value: '\u00dc' },
      { key: 'ESCAPING_WORKS', value: '\\' },
      { key: 'ESCAPED_QUOTES_FAIL', value: '"' },
      { key: 'COMMA_SPACE', value: ', ' },
    ]);
  });

  it('should parse the MapstructExpression from issue 24910', () => {
    const parsed = parseFromContent(
      String.raw`entity StreamRights {
  name String
  description TextBlob
  @MapstructExpression("java(s.getId() + \" | \" + s.getName())")
  details String
}`,
      runtime,
    );

    expect(parsed.entities[0].body?.[2].annotations).toEqual([
      { optionName: 'MapstructExpression', optionValue: 'java(s.getId() + " | " + s.getName())', type: 'BINARY' },
    ]);
  });

  it('should preserve every ASCII character through a quoted enum literal', () => {
    for (let code = 0; code < 128; code++) {
      const value = String.fromCharCode(code);
      const parsed = parseFromContent(`enum Example { VALUE (${JSON.stringify(value)}) }`, runtime);
      expect(parsed.enums[0].values).toEqual([{ key: 'VALUE', value }]);
    }
  });

  it('should decode Unicode escapes and preserve unknown legacy escape sequences', () => {
    expect(parseJDLString(String.raw`"\u00dc\uD83D\uDE00"`)).toBe('\u00dc\uD83D\uDE00');
    expect(parseJDLString(String.raw`"\d+\w+\q"`)).toBe(String.raw`\d+\w+\q`);
    expect(parseJDLString(String.raw`"\\n"`)).toBe(String.raw`\n`);
  });

  for (const content of [String.raw`enum Example { VALUE ("unterminated\") }`, 'enum Example { VALUE ("one"two") }']) {
    it(`should reject malformed string literals: ${content}`, () => {
      expect(() => parseFromContent(content, runtime)).toThrow();
    });
  }

  for (const value of ['https://example.org/a#b', 'one\n#not a directive\n//not a comment', 'a"b\\c\n', '/* not a comment */']) {
    it(`should preserve annotation values ${JSON.stringify(value)} on export and import`, () => {
      const entity = new JDLEntity({ name: 'Example', annotations: { label: value } });
      entity.addField(new JDLField({ name: 'details', type: 'String', options: { mapstructExpression: value } }));
      const parsed = parseFromContent(entity.toString(), runtime).entities[0];

      expect(parsed.annotations).toEqual([{ optionName: 'Label', optionValue: value, type: 'BINARY' }]);
      expect(parsed.body?.[0].annotations).toEqual([{ optionName: 'MapstructExpression', optionValue: value, type: 'BINARY' }]);
    });
  }

  it('should preserve relationship annotation values', () => {
    const value = 'a"b\\c';
    const relationship = new JDLRelationship({
      from: 'A',
      to: 'B',
      type: 'OneToOne',
      injectedFieldInFrom: 'b',
      options: { source: { custom: value }, destination: {}, global: {} },
    });
    const original = parseFromContent(`relationship OneToOne { @Custom(${JSON.stringify(value)}) A{b} to B }`, runtime);

    expect(parseFromContent(relationship.toString(), runtime)).toEqual(original);
  });

  it('should ignore comments and directives only outside string literals', () => {
    const parsed = parseFromContent(
      `# a directive
// a comment
enum Example {
  VALUE ("one
# inside the literal
// still inside") // trailing comment
}`,
      runtime,
    );

    expect(parsed.enums[0].values).toEqual([{ key: 'VALUE', value: 'one\n# inside the literal\n// still inside' }]);
  });

  it('should escape and decode quoted application configuration consistently', () => {
    const value = 'a"b\\c\n';
    const stringOption = new StringJDLApplicationConfigurationOption('greeting', value, true);
    const listOption = new ListJDLApplicationConfigurationOption('messages', [value], true);
    const parsed = parseFromContent(`application { config(custom) { ${stringOption} } }`, runtime);

    expect(parsed.applications[0].namespaceConfigs?.custom).toEqual({ greeting: value });
    expect(parse(listOption.toString().slice('messages '.length), runtime, { startRule: 'quotedList' })).toEqual([value]);
  });
});
