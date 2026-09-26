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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';

import { parse } from './api.ts';
import { type JDLApplicationStatement, type JDLStatement, getStatements } from './statements.ts';

const runtime = getDefaultRuntime();

const jdl = `entity A
dto A with mapstruct
MAX = 3
application {
  config { baseName one }
  dto * with mapstruct
  config { baseName two }
  dto * with mapstruct
}
relationship OneToOne { A{b} to B, A{c} to B }
entity B
dto B with mapstruct
`;

/** What a statement is and where it is written. */
const describeStatement = (statement: JDLStatement | JDLApplicationStatement) =>
  `${statement.type} ${jdl.slice(statement.location!.startOffset, statement.location!.endOffset + 1).replaceAll(/\s+/g, ' ')}`;

describe('jdl - statements', () => {
  const ast = parse(jdl, runtime, { onWarning: () => {} });

  it('should keep the statements of a jdl as written, in order', () => {
    expect(getStatements(ast)!.map(describeStatement)).toEqual([
      'entity entity A',
      'option dto A with mapstruct',
      'constant MAX = 3',
      'application application { config { baseName one } dto * with mapstruct config { baseName two } dto * with mapstruct }',
      'relationships relationship OneToOne { A{b} to B, A{c} to B }',
      'entity entity B',
      'option dto B with mapstruct',
    ]);
  });

  it('should keep the statements of an application as written, in order', () => {
    expect(getStatements<JDLApplicationStatement>(ast.applications[0])!.map(describeStatement)).toEqual([
      'config config { baseName one }',
      'option dto * with mapstruct',
      'config config { baseName two }',
      'option dto * with mapstruct',
    ]);
  });

  it('should group the statements into the AST', () => {
    expect(ast.applications[0].config.baseName).toBe('one');
    expect(ast.options).toEqual({ dto: { mapstruct: { list: ['A', 'B'], excluded: [] } } });
    expect(ast.relationships.map(relationship => relationship.from.injectedField)).toEqual(['b', 'c']);
  });

  describe('an application with several statements of a kind', () => {
    const source = `application {
  config { baseName one }
  config(foo) { a 1 }
  entities A
  config { baseName two }
  config(bar) { b 2 }
  config(foo) { c 3 }
  entities B
}
entity A
entity B
`;
    const [application] = parse(source, runtime, { onWarning: () => {} }).applications;

    it('should keep the first config and entities statements, the others being reported', () => {
      expect(application.config).toEqual({ baseName: 'one' });
      expect(application.entitiesOptions).toEqual({ entityList: ['A'], excluded: [] });
    });

    it('should keep the config of every namespace, the first one of each', () => {
      expect(application.namespaceConfigs).toEqual({ foo: { a: '1' }, bar: { b: '2' } });
    });
  });

  it('should leave an option statement as written, its deprecated keyword included', () => {
    const statements = getStatements(parse('entity A\npaginate A with pagination', runtime, { onWarning: () => {} }))!;
    expect(statements[1]).toMatchObject({ type: 'option', option: { optionName: 'paginate', optionValue: 'pagination' } });
  });
});
