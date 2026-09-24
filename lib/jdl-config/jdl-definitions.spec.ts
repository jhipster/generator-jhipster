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

import type { StoreGeneratorMeta } from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';
import { parse } from '../jdl-parser/index.ts';
import { getJHipsterStore } from '../resolver/lookups.ts';

import { createJDLRuntime, getDefaultJDLDefinitions } from './jdl-runtime.ts';

describe('exported JDL definitions', () => {
  it('includes field validation and naming definitions outside the pure parser', () => {
    const definitions = getDefaultJDLDefinitions();
    expect(definitions.validations?.pattern).toEqual({ type: 'pattern' });
    expect(definitions.fieldTypes?.String.validations).toContain('minlength');
    expect(definitions.fieldTypes?.Integer.validations).not.toContain('minlength');
    expect(definitions.names?.entity?.test('Person')).toBe(true);
    expect(definitions.namePattern?.test('dto')).toBe(true);
  });

  it('accepts multi-digit creation timestamps through semantic parsing', () => {
    const result = parse('application { config { creationTimestamp 1577836800000 } }', createJDLRuntime());
    expect(result.diagnostics).toEqual([]);
    expect(result.ast?.applications[0].config.creationTimestamp).toBe('1577836800000');
  });

  it('composes selected blueprint commands without changing the default definitions', () => {
    const command = {
      configs: { customFlavor: { scope: 'storage', choices: ['vanilla', 'chocolate'], jdl: { type: 'string', tokenType: 'NAME' } } },
    } satisfies JHipsterCommandDefinition;
    const store = getJHipsterStore();
    const getGeneratorMeta = (namespace: string) =>
      namespace === 'custom:app' ?
        ({ namespace, requireModule: () => ({ command }) } as unknown as StoreGeneratorMeta)
      : store.getMeta(namespace);
    const custom = getDefaultJDLDefinitions({ getGeneratorMeta, blueprintNamespaces: ['custom'] });
    expect(custom.application.optionsTypes.customFlavor).toEqual({ type: 'string' });
    expect(custom.application.optionsValues.customFlavor).toEqual({ vanilla: 'vanilla', chocolate: 'chocolate' });
    expect(getDefaultJDLDefinitions().application.optionsTypes.customFlavor).toBeUndefined();
    expect(custom.deployment.optionsTypes.customFlavor).toBeUndefined();
  });
});
