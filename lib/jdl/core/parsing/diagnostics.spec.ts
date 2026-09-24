/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 * Licensed under the Apache License, Version 2.0.
 */
import { describe, expect, it } from 'esmocha';

import { createRuntime } from '../runtime.ts';
import type { JDLDefinitions } from '../types/parsing.ts';

import { parse, parseOrThrow } from './api.ts';

const definitions: JDLDefinitions = {
  namespaceConfigOption: 'plugins',
  application: {
    tokenConfigs: [],
    validatorConfig: { baseName: { type: 'NAME' }, enabled: { type: 'BOOLEAN' }, mode: { type: 'NAME' }, plugins: { type: 'list' } },
    optionsTypes: {
      baseName: { type: 'string' },
      enabled: { type: 'boolean' },
      mode: { type: 'string', deprecated: 'Use enabled.' },
      plugins: { type: 'list' },
    },
    optionsValues: { mode: { old: 'old' } },
    quotedOptionNames: [],
  },
  deployment: {
    required: ['target'],
    tokenConfigs: [],
    validatorConfig: { target: { type: 'NAME' } },
    optionsTypes: { target: { type: 'string' } },
    optionsValues: {},
    quotedOptionNames: [],
  },
  entity: {
    configs: {
      service: { choices: ['serviceClass'], jdl: { type: 'binary', deprecatedKeywords: ['oldService'] } },
      skipClient: { jdl: { type: 'unary' } },
    },
  },
  relationship: { configs: { builtInEntity: { jdl: { type: 'unary' } } } },
  fieldTypes: { String: { validations: ['required', 'minlength'] }, Integer: { validations: ['min'] } },
  enumValidations: ['required'],
  validations: { required: { type: 'flag' }, min: { type: 'number' }, minlength: { type: 'number', integer: true } },
  names: { entity: /^[A-Z][A-Za-z0-9]*$/, field: /^[a-z][A-Za-z0-9]*$/ },
};
const runtime = createRuntime(definitions);

describe('jdl - positioned diagnostics', () => {
  it('returns a located AST and no errors for valid input', () => {
    const source = 'entity Book { title String required }';
    const { ast, diagnostics } = parse(source, runtime);
    expect(diagnostics).toEqual([]);
    expect(ast?.entities[0].location).toEqual({
      start: { offset: 0, line: 1, column: 1 },
      end: { offset: source.length, line: 1, column: source.length + 1 },
    });
  });

  it('reports multiple independent errors in source order and does not cascade an unknown field type', () => {
    const source = 'entity Book { value Missing min(2) }\nentity Book { title String min(3) }\nservice Absent';
    const { diagnostics } = parse(source, runtime);
    expect(diagnostics.map(item => item.ruleId)).toEqual([
      'field.type',
      'duplicate.entity',
      'validation.type',
      'option.kind',
      'reference.entity',
    ]);
    expect(diagnostics.every(item => item.range.end.offset <= source.length && Number.isFinite(item.range.start.offset))).toBe(true);
  });

  it('reports unknown config keys, wrong types and duplicate declarations instead of failing grammar', () => {
    const { diagnostics } = parse('application { config { mystery true enabled "yes" baseName app baseName other } }', runtime);
    expect(diagnostics.map(item => item.ruleId)).toEqual(['config.unknown', 'config.type', 'duplicate.application-config']);
  });

  it('reports deprecation warnings without logging and preserves normalized legacy option names', () => {
    const result = parse('entity Book\noldService Book with serviceClass', runtime);
    expect(result.diagnostics.map(item => [item.ruleId, item.severity])).toEqual([['option.deprecated', 'warning']]);
    expect(result.ast?.options.service).toBeDefined();
    expect(result.ast?.optionDeclarations?.[0].optionName).toBe('oldService');
  });

  it('reports undefined constants and repeated field and enum names', () => {
    const source = 'entity Book { title String minlength(UNKNOWN), title String }\nenum State { NEW, NEW }';
    const result = parse(source, runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual([
      'reference.constant',
      'duplicate.field',
      'enum.unused',
      'duplicate.enum-value',
    ]);
  });

  it('checks referenced entity lists and relationship sides and accepts declared built-in destinations', () => {
    const result = parse('entity Book\nrelationship OneToOne { Book to Missing }', runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['reference.entity']);
    expect(parse('entity Book\nrelationship ManyToOne { Book{owner} to User with builtInEntity }', runtime).diagnostics).toEqual([]);
  });

  it('retains valid declarations after recoverable syntax errors', () => {
    const result = parse('entity Broken { value }\nentity Good { title String }', runtime);
    expect(result.diagnostics.some(item => item.ruleId.startsWith('syntax.'))).toBe(true);
    expect(result.ast?.entities.some(entity => entity.name === 'Good')).toBe(true);
  });

  it('anchors missing-token EOF diagnostics to the end of the document', () => {
    const source = 'entity Book {\n';
    const result = parse(source, runtime);
    const syntax = result.diagnostics.find(item => item.ruleId.startsWith('syntax.'))!;
    expect(syntax.range).toEqual({
      start: { offset: source.length, line: 2, column: 1 },
      end: { offset: source.length, line: 2, column: 1 },
    });
  });

  it('collects lexical errors and recovers valid declarations', () => {
    const result = parse('±\nentity Book', runtime);
    expect(result.diagnostics[0].ruleId).toBe('syntax.lexical');
    expect(result.diagnostics[0].range.start.offset).toBe(0);
    expect(result.ast?.entities[0].name).toBe('Book');
  });

  it('keeps the throwing wrapper and its legacy unlocated AST', () => {
    expect(() => parseOrThrow('entity Book {', runtime)).toThrow('MismatchedTokenException');
    expect(() => parseOrThrow('entity Book { title Missing }', runtime)).toThrow("The type 'Missing'");
    const ast = parseOrThrow('entity Book { title String }', runtime);
    expect(ast.entities[0].location).toBeUndefined();
    expect(ast.constantDeclarations).toBeUndefined();
  });

  it('does not retain state across successive calls to a shared runtime', () => {
    parse('entity Book {', runtime);
    expect(parse('entity Book', runtime).diagnostics).toEqual([]);
  });

  it('checks option entities against the enclosing application', () => {
    const result = parse('entity A entity B application { config { baseName app } entities A service B with serviceClass }', runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['reference.application-entity']);
  });

  it('preserves implicit relationship fields and rejects missing OneToOne ownership', () => {
    expect(parse('entity A entity B relationship OneToOne { A to B }', runtime).diagnostics).toEqual([]);
    expect(parse('entity A entity B relationship OneToOne { A to B{a} }', runtime).diagnostics.map(item => item.ruleId)).toEqual([
      'relationship.owner',
    ]);
  });

  it('returns diagnostics for incomplete prefixes and deletions instead of throwing', () => {
    const source =
      'entity A { title String minlength(3) } entity B relationship ManyToOne { A{b required} to B } application { config { baseName demo } entities * }';
    for (let index = 0; index < source.length; index++) {
      expect(() => parse(source.slice(0, index), runtime)).not.toThrow();
      expect(() => parse(source.slice(0, index) + source.slice(index + 1), runtime)).not.toThrow();
    }
  });

  it('reports unused enums as positioned warnings and permits forward enum uses', () => {
    const source = 'enum State { NEW }';
    expect(parse(source, runtime).diagnostics).toEqual([
      {
        ruleId: 'enum.unused',
        severity: 'warning',
        message: "The enum 'State' is not used by any field.",
        range: { start: { offset: 0, line: 1, column: 1 }, end: { offset: source.length, line: 1, column: source.length + 1 } },
      },
    ]);
    expect(parse('entity A { state State } enum State { NEW }', runtime).diagnostics).toEqual([]);
    expect(() => parseOrThrow(source, runtime)).not.toThrow();
  });

  it('reports relationships across application boundaries after wildcard exclusions', () => {
    const source =
      'entity A entity B application {config {baseName first} entities * except B} application {config {baseName second} entities B} relationship ManyToOne { A{b} to B }';
    const result = parse(source, runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['relationship.application']);
    expect(result.diagnostics[0].range.start.offset).toBe(source.indexOf('A{b}'));
    expect(
      parse('entity A entity B application {config {baseName first} entities *} relationship ManyToOne { A{b} to B }', runtime).diagnostics,
    ).toEqual([]);
  });

  it('checks declared namespace membership using the host-selected list option', () => {
    const source = 'application {config {baseName app} config(custom) {enabled true}}';
    const result = parse(source, runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['reference.namespace']);
    expect(result.diagnostics[0].range.start.offset).toBe(source.indexOf('config(custom)'));
    expect(parse('application {config {baseName app plugins [custom]} config(custom) {enabled true}}', runtime).diagnostics).toEqual([]);
  });

  it('checks known entity annotations without rejecting extension annotations', () => {
    const source = '@service(wrong) entity A';
    const result = parse(source, runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['option.value']);
    expect(result.diagnostics[0].range).toEqual({ start: { offset: 0, line: 1, column: 1 }, end: { offset: 15, line: 1, column: 16 } });
    expect(parse('@service(serviceClass) @CustomExtension("enabled") entity A', runtime).diagnostics).toEqual([]);
    expect(parse('@skipClient(false) entity A', runtime).diagnostics).toEqual([]);
  });

  it('keeps integer-only validation syntax, including values supplied by constants', () => {
    for (const source of ['entity A { title String minlength(1.0) }', 'MIN = 1.0 entity A { title String minlength(MIN) }']) {
      const result = parse(source, runtime);
      expect(result.diagnostics.map(item => item.ruleId)).toEqual(['validation.value']);
      expect(result.diagnostics[0].range.start.offset).toBe(source.indexOf('minlength'));
    }
    expect(parse('MIN = 1 entity A { title String minlength(MIN) }', runtime).diagnostics).toEqual([]);
  });

  it('reports missing required config keys from definitions before model conversion', () => {
    const source = 'deployment {}';
    const result = parse(source, runtime);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['config.required']);
    expect(result.diagnostics[0].range).toEqual({
      start: { offset: 0, line: 1, column: 1 },
      end: { offset: source.length, line: 1, column: source.length + 1 },
    });
    expect(parse('deployment {target local}', runtime).diagnostics).toEqual([]);
    expect(() => parseOrThrow(source, runtime)).toThrow("The deployment config property 'target' is required.");
  });

  it('uses supplied method and path patterns in the semantic API', () => {
    const customRuntime = createRuntime({
      ...definitions,
      names: { ...definitions.names, method: /^[a-z]+$/, path: /^"[^/][^"]*"$/ },
      entity: { configs: { custom: { jdl: { type: 'binary' } } } },
    });
    expect(parse('entity A custom A with wrong-value', customRuntime).diagnostics.map(item => item.ruleId)).toEqual(['name.method']);
    expect(parse('entity A custom A with "/absolute"', customRuntime).diagnostics.map(item => item.ruleId)).toEqual(['name.path']);
    expect(parse('entity A custom A with "relative/path"', customRuntime).diagnostics).toEqual([]);
    expect(() => parseOrThrow('entity A custom A with "/absolute"', customRuntime)).toThrow('methodPath');
  });
});
