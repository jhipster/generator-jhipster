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

import { parseJDL } from './api.ts';

/** The diagnostics of a jdl, with the source each one points at. */
const diagnose = (content: string) =>
  parseJDL(content, getDefaultRuntime()).diagnostics.map(({ ruleId, severity, message, location }) => ({
    ruleId,
    severity,
    message,
    at: location && content.slice(location.startOffset, location.endOffset + 1),
  }));

describe('jdl - parseJDL', () => {
  it('returns the AST of a valid jdl, and no diagnostic', () => {
    const { ast, diagnostics } = parseJDL('entity A {\n  name String\n}', getDefaultRuntime());
    expect(diagnostics).toEqual([]);
    expect(ast?.entities.map(entity => entity.name)).toEqual(['A']);
  });

  it('reports every lexing error, without an AST', () => {
    const result = parseJDL('entity A {\n  name String ^\n  age Integer ^\n}', getDefaultRuntime());
    expect(result.ast).toBeUndefined();
    expect(result.diagnostics.map(({ ruleId, location }) => [ruleId, location?.startLine, location?.startColumn])).toEqual([
      ['lexing', 2, 15],
      ['lexing', 3, 15],
    ]);
  });

  it('reports a parsing error at its token', () => {
    expect(diagnose('entiti Foo {\n  name String\n}')).toEqual([
      {
        ruleId: 'parsing',
        severity: 'error',
        message:
          "Unknown statement 'entiti', expected an entity, an enum, a relationship, an application, a deployment, a use statement, a constant or an option statement.",
        at: 'entiti',
      },
    ]);
  });

  it('recovers from parsing errors: reports every one, and what could be parsed', () => {
    const content = 'entity A {\n  name String\n  age Integer,,\n}\nentity B {\n  x\n}\nentity C\nrelationship OneToOne { A to D }';
    const { ast } = parseJDL(content, getDefaultRuntime());
    expect(diagnose(content).map(({ ruleId, at }) => [ruleId, at])).toEqual([
      ['parsing', ','],
      ['parsing', '}'],
    ]);
    // The undeclared D is not reported: a jdl with parsing errors is not checked.
    expect(ast?.entities.map(entity => entity.name)).toEqual(['A', 'B', 'C']);
  });

  it('reports a parsing error at the end of the input without a location', () => {
    expect(diagnose('entity A {').map(({ ruleId, at }) => [ruleId, at])).toEqual([['parsing', undefined]]);
  });

  it('reports the syntax errors, the semantic errors and the warnings together, in source order, with the AST', () => {
    const content = 'entity a\nentity B {\n  start Date\n}\nrelationship OneToMany { B to C }\nreadonly B';
    const { ast } = parseJDL(content, getDefaultRuntime());
    expect(ast?.entities.map(entity => entity.name)).toEqual(['a', 'B']);
    expect(diagnose(content).map(({ ruleId, severity, at }) => [ruleId, severity, at])).toEqual([
      ['syntax', 'error', 'a'],
      ['field-type', 'warning', 'start Date'],
      ['undeclared-relationship-entity', 'error', 'B to C'],
      ['syntax', 'error', 'readonly'],
    ]);
  });

  it('reports a deprecated application option as a warning at the option', () => {
    expect(
      diagnose('application {\n  config {\n    baseName a\n    jhipsterVersion "7.0.0"\n  }\n}').map(({ ruleId, severity, at }) => [
        ruleId,
        severity,
        at,
      ]),
    ).toEqual([['deprecated', 'warning', 'jhipsterVersion "7.0.0"']]);
  });

  it('reports a deprecated option as a warning at the option', () => {
    expect(diagnose('entity A\npaginate A with pagination')).toEqual([
      {
        ruleId: 'deprecated',
        severity: 'warning',
        message: 'The paginate option is deprecated, please use pagination instead.',
        at: 'paginate A with pagination',
      },
    ]);
  });
});
