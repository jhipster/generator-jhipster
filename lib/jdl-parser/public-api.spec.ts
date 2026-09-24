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
});
