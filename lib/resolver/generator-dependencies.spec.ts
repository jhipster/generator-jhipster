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

import { lookupGeneratorCommands } from './generator-commands.ts';
import { type GeneratorDependency, resolveGeneratorDependencies } from './generator-dependencies.ts';

/** getGeneratorMeta backed by the generators of this repository plus fake blueprint generators. */
const metaLookup = (blueprints: Record<string, JHipsterCommandDefinition> = {}) => {
  const generators = lookupGeneratorCommands();
  return (namespace: string): StoreGeneratorMeta | undefined => {
    const command = blueprints[namespace] ?? generators.find(generator => `jhipster:${generator.namespace}` === namespace)?.command;
    return command ? ({ namespace, requireModule: () => ({ command }) } as unknown as StoreGeneratorMeta) : undefined;
  };
};

const resolve = (generatorNames: string[], blueprints?: Record<string, JHipsterCommandDefinition>, blueprintNamespaces: string[] = []) =>
  resolveGeneratorDependencies(generatorNames, { getGeneratorMeta: metaLookup(blueprints), blueprintNamespaces });

const namespaces = (dependencies: GeneratorDependency[]) => dependencies.map(({ namespace }) => namespace);

describe('resolver - generator dependencies', () => {
  describe('resolveGeneratorDependencies', () => {
    it('should resolve the imports recursively in registration order', () => {
      const dependencies = resolve(['bootstrap', 'spring-boot']);
      expect(namespaces(dependencies).slice(0, 3)).toEqual(['bootstrap', 'spring-boot', 'java']);
      expect(namespaces(dependencies)).toEqual(
        expect.arrayContaining(['liquibase', 'jhipster:spring-boot:cache', 'jhipster:spring-cloud']),
      );
      expect(new Set(namespaces(dependencies)).size).toBe(dependencies.length);
      expect(dependencies.find(({ namespace }) => namespace === 'java')?.command?.configs).toBeTruthy();
    });

    it('should report missing generators', () => {
      const missing: string[] = [];
      resolveGeneratorDependencies(['unknown'], {
        getGeneratorMeta: metaLookup(),
        onMissing: namespace => missing.push(namespace),
      });
      expect(missing).toEqual(['unknown']);
    });

    it('should add blueprint generators and let an override replace the original', () => {
      const blueprint = {
        configs: { fooOption: { cli: { type: Boolean }, scope: 'storage' } },
        import: [],
      } as const satisfies JHipsterCommandDefinition;
      const dependencies = resolve(['git'], { 'jhipster-foo:git': blueprint }, ['jhipster-foo']);
      expect(namespaces(dependencies)).toEqual(['jhipster-foo:git', 'git']);
      expect(dependencies[0].blueprintNamespace).toBe('jhipster-foo');

      const overriding = resolve(['git'], { 'jhipster-foo:git': { ...blueprint, override: true } }, ['jhipster-foo']);
      expect(namespaces(overriding)).toEqual(['jhipster-foo:git']);
    });
  });

  describe('lookupGeneratorCommands', () => {
    it('should list the generators with the usage description', () => {
      const generators = lookupGeneratorCommands();
      expect(generators.map(({ namespace }) => namespace)).toEqual(expect.arrayContaining(['app', 'info', 'spring-boot:cache']));
      expect(generators.find(({ namespace }) => namespace === 'info')?.description).toBe(
        'Display information about your current project and system.',
      );
    });

    it('should prefer the passed descriptions', () => {
      const generators = lookupGeneratorCommands({ descriptions: { info: 'custom' } });
      expect(generators.find(({ namespace }) => namespace === 'info')?.description).toBe('custom');
    });
  });
});
