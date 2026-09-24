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
import { readFileSync } from 'node:fs';

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { getTestFile, parseFromContent } from '../../core/__test-support__/index.ts';
import { parse, parseOrThrow } from '../../core/parsing/api.ts';

import { convertDeployments } from './deployment-converter.ts';

describe('jdl - semantic checks before conversion', () => {
  const runtime = getDefaultRuntime();

  it('reports an option entity outside the application even when globally declared', () => {
    const text = `entity A
entity C
application {
  config { baseName mono }
  entities A
  dto C with mapstruct
}`;
    const { ast, diagnostics } = parse(text, runtime);
    expect(ast?.applications).toHaveLength(1);
    const errors = diagnostics.filter(diagnostic => diagnostic.severity === 'error');
    expect(errors).toHaveLength(1);
    expect(errors[0].ruleId).toBe('reference.application-entity');
    expect(errors[0].message).toContain('C');
    expect(errors[0].range.start.line).toBe(6);
    expect(text.slice(errors[0].range.start.offset, errors[0].range.end.offset)).toBe('dto C with mapstruct');
    expect(() => parseOrThrow(text, runtime)).toThrow();
  });

  it('reports forbidden deployment choices before a model is constructed', () => {
    const text = `deployment {
  deploymentType kubernetes
  appsFolders [tata]
  serviceDiscoveryType zookeeper
}`;
    const { ast, diagnostics } = parse(text, runtime);
    expect(ast?.deployments).toHaveLength(1);
    const errors = diagnostics.filter(diagnostic => diagnostic.severity === 'error');
    expect(errors).toHaveLength(1);
    expect(errors[0].ruleId).toBe('config.value');
    expect(errors[0].message).toContain('zookeeper');
    expect(errors[0].range.start.line).toBe(4);
    expect(text.slice(errors[0].range.start.offset, errors[0].range.end.offset)).toBe('serviceDiscoveryType zookeeper');
    expect(() => parseOrThrow(text, runtime)).toThrow();
  });

  it('reports unknown field types before conversion', () => {
    const text = readFileSync(getTestFile('invalid_field_type.jdl'), 'utf8');
    const { diagnostics } = parse(text, runtime);
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['field.type']);
    expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe('wrongField NullPointerException');
  });

  it('reports invalid option values before conversion', () => {
    const text = readFileSync(getTestFile('invalid_option.jdl'), 'utf8');
    const { diagnostics } = parse(text, runtime);
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['option.value']);
    expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe('dto A with wrong');
  });

  it('reports unsupported historical Date and TextBlob byte validations', () => {
    const text = 'entity A { created Date content TextBlob minbytes(1) maxbytes(2) }';
    const { diagnostics } = parse(text, runtime);
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['field.type', 'validation.type', 'validation.type']);
    expect(diagnostics.map(diagnostic => text.slice(diagnostic.range.start.offset, diagnostic.range.end.offset))).toEqual([
      'created Date',
      'minbytes(1)',
      'maxbytes(2)',
    ]);
  });

  it('resolves all and exclusions before checking application option membership', () => {
    const text = 'entity A entity B application { config { baseName app } entities all except B dto * with mapstruct }';
    expect(parse(text, runtime).diagnostics).toEqual([]);
    expect(parseFromContent(text).applications[0].entities).toEqual(['A']);
    const invalidText = text.replace('dto *', 'dto B');
    const invalid = parse(invalidText, runtime).diagnostics;
    expect(invalid.map(diagnostic => diagnostic.ruleId)).toEqual(['reference.application-entity']);
    expect(invalidText.slice(invalid[0].range.start.offset, invalid[0].range.end.offset)).toBe('dto B with mapstruct');
  });

  it('reports unknown application entities during parsing', () => {
    const text = 'application { config { baseName app } entities Missing }';
    const { diagnostics } = parse(text, runtime);
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['reference.entity']);
    expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe(text);
  });

  it('does not copy positioned AST metadata into the deployment configuration', () => {
    const { ast, diagnostics } = parse('deployment { deploymentType kubernetes appsFolders [tata] }', runtime);
    expect(diagnostics).toEqual([]);
    const [deployment] = convertDeployments(ast!.deployments, runtime);
    expect(Object.hasOwn(deployment, 'location')).toBe(false);
    expect(Object.hasOwn(deployment, 'configDeclarations')).toBe(false);
    expect(deployment.deploymentType).toBe('kubernetes');
  });
});
