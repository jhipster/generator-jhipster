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

import { type JDLDefinitions, createRuntime, parse, parseOrThrow } from './index.ts';

const config = { tokenConfigs: [], validatorConfig: {}, optionsTypes: {}, optionsValues: {}, quotedOptionNames: [] };
const definitions: JDLDefinitions = {
  application: config,
  deployment: config,
  entity: { configs: {} },
  relationship: { configs: {} },
  fieldTypes: { String: { validations: [] } },
};

describe('independent JDL parser public API', () => {
  it('parses raw comments and directives without changing source offsets', () => {
    const runtime = createRuntime(definitions);
    const source = '# jdl directive\r\n// before entity\r\nentity Book { title String } // after entity';
    const { ast, diagnostics } = parse(source, runtime);
    expect(diagnostics).toEqual([]);
    expect(ast?.entities[0].location?.start).toEqual({ offset: source.indexOf('entity Book'), line: 3, column: 1 });
    expect(source.slice(ast?.entities[0].body?.[0].location?.start.offset, ast?.entities[0].body?.[0].location?.end.offset)).toBe(
      'title String',
    );
    expect(parseOrThrow(source, runtime).entities[0].location).toBeUndefined();
  });

  it('returns independent diagnostics when config names are not present in supplied definitions', () => {
    const source = 'application { config { experimental true } } deployment { experimental false }';
    const { diagnostics } = parse(source, createRuntime(definitions));
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['config.unknown', 'config.unknown']);
    expect(diagnostics.map(diagnostic => source.slice(diagnostic.range.start.offset, diagnostic.range.end.offset))).toEqual([
      'experimental true',
      'experimental false',
    ]);
  });

  it('accepts config definitions without lexer token mappings, including legacy validation keys', () => {
    const runtime = createRuntime({
      ...definitions,
      application: {
        validatorConfig: { baseName: { type: 'NAME' }, SERVER_PORT: { type: 'INTEGER' } },
        optionsTypes: { baseName: { type: 'string' }, serverPort: { type: 'integer' } },
        optionsValues: {},
        quotedOptionNames: [],
      },
    });
    const source = 'application { config { baseName foo serverPort 8080 } }';
    expect(parse(source, runtime).diagnostics).toEqual([]);
    expect(parseOrThrow(source, runtime).applications[0].config).toEqual({ baseName: 'foo', serverPort: '8080' });
    expect(() => parseOrThrow('application { config { fooBar true serverPort abc } }', runtime)).toThrow(
      'Unknown application option: fooBar.\n\tat line: 1, column: 24\nAn integer literal is expected, but found: "abc"\n\tat line: 1, column: 47',
    );
  });

  it('keeps keyword names while distinguishing unknown block statements from generic options', () => {
    const runtime = createRuntime(definitions);
    expect(parseOrThrow('entity A { with String }', runtime).entities[0].body[0].name).toBe('with');
    expect(() => parseOrThrow('entiti Foo { name String }', runtime)).toThrow(
      "Unknown statement 'entiti', expected an entity, an enum, a relationship, an application, a deployment, a use statement, a constant or an option statement.\n\tat line: 1, column: 1",
    );
    expect(() => parseOrThrow('application { entitis A {} }', runtime)).toThrow(
      "Unknown statement 'entitis', expected a config block, an entities statement, a use statement or an option statement.\n\tat line: 1, column: 15",
    );
  });

  it('uses custom entity definitions for both top-level and application options', () => {
    const runtime = createRuntime({
      ...definitions,
      entity: {
        configs: {
          audited: { jdl: { type: 'unary' } },
          transfer: { jdl: { type: 'binary', keyword: 'dto', deprecatedKeywords: ['oldDto'] } },
        },
      },
    });
    const source = 'entity A\naudited A\napplication { entities A oldDto A with mapping }';
    expect(parse(source, runtime).diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['option.deprecated']);
    expect(parseOrThrow(source, runtime).applications[0].options).toEqual({
      transfer: { mapping: { list: ['A'], excluded: [] } },
    });
    expect(() => parseOrThrow('entity A\nreadOnly A', runtime)).toThrow('Unknown option: readOnly.\n\tat line: 2, column: 1');
    expect(() => parseOrThrow('entity A\naudited A with mapping', runtime)).toThrow(
      'The audited option takes no value.\n\tat line: 2, column: 1',
    );
    expect(() => parseOrThrow('entity A\napplication { entities A dto A }', runtime)).toThrow(
      'The dto option needs a value: dto <entities> with <value>.\n\tat line: 2, column: 26',
    );
  });

  it('accepts declared relationship keywords and aliases and diagnoses unknown ones consistently', () => {
    const runtime = createRuntime({
      ...definitions,
      relationship: { configs: { cascading: { jdl: { type: 'unary', keyword: 'cascade', deprecatedKeywords: ['oldCascade'] } } } },
    });
    for (const option of ['cascade', 'oldCascade']) {
      const source = `entity A\nentity B\nrelationship OneToMany { A{b} to B with ${option} }`;
      expect(parse(source, runtime).diagnostics).toEqual([]);
      expect(parseOrThrow(source, runtime).relationships[0].options.global).toEqual([{ optionName: option, type: 'UNARY' }]);
    }
    const source = 'entity A\nentity B\nrelationship OneToMany { A{b} to B with unknown }';
    expect(parse(source, runtime).diagnostics).toEqual([
      expect.objectContaining({ ruleId: 'option.unknown', message: 'Unknown relationship option: unknown.' }),
    ]);
    expect(() => parseOrThrow(source, runtime)).toThrow('Unknown relationship option: unknown.\n\tat line: 3, column: 41');
  });
});
