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

import { buildJDLAstBuilderVisitor } from './jdl-ast-builder-visitor.ts';
import JDLParser from './jdl-parser.ts';
import type { SourceRange } from './locations.ts';

const build = (input: string, locations = true) => {
  const base = getDefaultRuntime();
  const parser = new JDLParser(base.tokens, { recoveryEnabled: true });
  parser.parse();
  const runtime = { ...base, parser };
  const lexed = runtime.lexer.tokenize(input);
  runtime.parser.input = lexed.tokens;
  const cst = runtime.parser.prog();
  const diagnostics: unknown[] = [];
  const ast = buildJDLAstBuilderVisitor(runtime, { locations, onDiagnostic: diagnostic => diagnostics.push(diagnostic) }).visit(cst);
  return { ast, diagnostics, errors: [...lexed.errors, ...runtime.parser.errors] };
};
const textAt = (text: string, range: SourceRange) => text.slice(range.start.offset, range.end.offset);

describe('JDL AST source locations', () => {
  it('locates entity, field, annotation, and validation tokens using half-open ranges', () => {
    const source = '@service(serviceClass) entity Person {\n  @Id name String required maxlength(20)\n}';
    const { ast, errors } = build(source);
    expect(errors).toHaveLength(0);
    const entity = ast.entities[0];
    expect(textAt(source, ast.location)).toBe(source);
    expect(textAt(source, entity.location)).toBe(source);
    expect(textAt(source, entity.annotations[0].location)).toBe('@service(serviceClass)');
    const field = entity.body[0];
    expect(textAt(source, field.location)).toBe('@Id name String required maxlength(20)');
    expect(field.location.start).toEqual({ offset: source.indexOf('@Id'), line: 2, column: 3 });
    expect(textAt(source, field.annotations[0].location)).toBe('@Id');
    expect(textAt(source, field.validations[0].location)).toBe('required');
    expect(textAt(source, field.validations[1].location)).toBe('maxlength(20)');
  });

  it('retains declaration occurrences, including duplicate constants and config keys', () => {
    const source = 'LIMIT = 3\nLIMIT = 7\napplication { config { baseName first baseName second } }\nentity A\nservice A with serviceClass';
    const { ast, errors } = build(source);
    expect(errors).toHaveLength(0);
    expect(ast.constantDeclarations.map((item: { location: SourceRange }) => textAt(source, item.location))).toEqual([
      'LIMIT = 3',
      'LIMIT = 7',
    ]);
    const application = ast.applications[0];
    expect(
      application.configDeclarations.map((item: { key: string; value: unknown; valueType: string }) => [
        item.key,
        item.value,
        item.valueType,
      ]),
    ).toEqual([
      ['baseName', 'first', 'qualifiedName'],
      ['baseName', 'second', 'qualifiedName'],
    ]);
    expect(textAt(source, application.config.location)).toBe('config { baseName first baseName second }');
    expect(textAt(source, ast.optionDeclarations[0].location)).toBe('service A with serviceClass');
    expect(ast.options.service.serviceClass.location).toEqual(ast.optionDeclarations[0].location);
  });

  it('locates enum values and both relationship sides independently', () => {
    const source =
      'entity A\nentity B\nenum Kind { FIRST, SECOND("second") }\nrelationship ManyToOne { A{b required} to B with builtInEntity }';
    const { ast, errors } = build(source);
    expect(errors).toHaveLength(0);
    expect(textAt(source, ast.enums[0].values[1].location)).toBe('SECOND("second")');
    const relationship = ast.relationships[0];
    expect(textAt(source, relationship.from.location)).toBe('A{b required}');
    expect(textAt(source, relationship.to.location)).toBe('B');
    expect(textAt(source, relationship.options.global[0].location)).toBe('builtInEntity');
    expect(relationship.options.global[0].statement).toBe(true);
    expect(build(source, false).ast.relationships[0].options.global[0]).not.toHaveProperty('statement');
  });

  it('distinguishes quoted enum values for semantic checks without changing the legacy AST', () => {
    const source = 'enum Kind { FIRST(plain), SECOND("two words") }';
    const { ast, errors } = build(source);
    expect(errors).toHaveLength(0);
    expect(ast.enums[0].values[0]).not.toHaveProperty('quoted');
    expect(ast.enums[0].values[1]).toEqual(expect.objectContaining({ value: 'two words', quoted: true }));
    expect(build(source, false).ast.enums[0].values).toEqual([
      { key: 'FIRST', value: 'plain' },
      { key: 'SECOND', value: 'two words' },
    ]);
  });

  it('preserves UTF-16 offsets and CRLF line positions', () => {
    const source = '/** 🌍 */\r\nentity A {\r\n  name String\r\n}';
    const { ast, errors } = build(source);
    expect(errors).toHaveLength(0);
    expect(ast.entities[0].body[0].location.start).toEqual({ offset: source.indexOf('name'), line: 3, column: 3 });
    expect(ast.location.end.offset).toBe(source.length);
    expect(ast.location.end).toEqual({ offset: source.length, line: 4, column: 2 });
  });

  it('omits location and occurrence metadata for the legacy visitor', () => {
    const { ast } = build('entity A { name String }', false);
    expect(ast.entities[0]).toEqual({
      name: 'A',
      tableName: undefined,
      annotations: [],
      body: [{ name: 'name', type: 'String', validations: [], documentation: null, annotations: [] }],
      documentation: null,
    });
    expect(ast).not.toHaveProperty('location');
    expect(ast).not.toHaveProperty('constantDeclarations');
  });

  it('never invents identifiers from tokens inserted by parser recovery', () => {
    for (const source of [
      'entity { field String }',
      'entity A { field }',
      'enum { A }',
      'relationship ManyToOne { A to }',
      'application { config { baseName } }',
    ]) {
      const { ast, errors } = build(source);
      expect(errors.length).toBeGreaterThan(0);
      expect(ast).toBeDefined();
      expect(JSON.stringify(ast)).not.toContain('"name":""');
      for (const entity of ast.entities) {
        expect(entity.name).not.toBe('');
        for (const field of entity.body) expect(field.type).not.toBe('');
      }
    }
  });

  it('reports deprecations through the callback rather than logging', () => {
    const { diagnostics } = build('entity A\npaginate A with pagination');
    expect(diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ ruleId: 'deprecated-option', severity: 'warning' })]));
  });
});
