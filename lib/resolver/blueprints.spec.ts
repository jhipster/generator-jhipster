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
import { before, describe, esmocha, expect, it } from 'esmocha';
import { join } from 'node:path';

import { createBlueprintFiles, defaultHelpers as helpers } from '../testing/index.ts';

import { GeneratorsResolver, blueprintNamespaceToPackageName } from './blueprints.ts';
import { getJHipsterStore } from './lookups.ts';

describe('resolver - blueprints', () => {
  describe('blueprintNamespaceToPackageName', () => {
    it('should give the package name of a blueprint namespace', () => {
      expect(blueprintNamespaceToPackageName('jhipster-foo')).toBe('generator-jhipster-foo');
    });
    it('should give the package name of a scoped blueprint namespace', () => {
      expect(blueprintNamespaceToPackageName('@scope/jhipster-foo')).toBe('@scope/generator-jhipster-foo');
    });
  });

  describe('GeneratorsResolver', () => {
    let npmPaths: string[];

    before(async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles(createBlueprintFiles('generator-jhipster-foo', { generator: ['app', 'server'] }))
        .withFiles(
          createBlueprintFiles('generator-jhipster-bar', {
            generator: ['app'],
            files: { 'cli/commands.js': "export default { bar: { desc: 'Bar of the blueprint' } };\n" },
          }),
        )
        .withFiles({
          // A checkout in a folder named after something else than its package.
          'foo-worktree/package.json': { name: 'generator-jhipster-foo', type: 'module' },
          'foo-worktree/generators/client/index.js': 'export default class {}',
        })
        .commitFiles();
      npmPaths = [join(process.cwd(), 'node_modules')];
    });

    it('should resolve the generators of an installed blueprint, the jhipster ones included', () => {
      const resolver = new GeneratorsResolver();
      expect(resolver.lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true })).toEqual([]);
      expect(resolver.getGeneratorMeta('jhipster-foo:app')).toBeDefined();
      expect(resolver.getGeneratorMeta('jhipster-foo:server')).toBeDefined();
      expect(resolver.getGeneratorMeta('jhipster:app')).toBeDefined();
    });

    it('should resolve only the blueprints asked for', () => {
      const resolver = new GeneratorsResolver();
      resolver.lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true });
      expect(resolver.getGeneratorMeta('jhipster-bar:app')).toBeUndefined();
    });

    it('should give the blueprints not found, and keep the ones resolved by priority', () => {
      const resolver = new GeneratorsResolver();
      expect(resolver.lookupBlueprints(['jhipster-bar', 'jhipster-none'], { npmPaths, localOnly: true })).toEqual(['jhipster-none']);
      expect(resolver.lookupBlueprints(['jhipster-foo', 'jhipster-bar'], { npmPaths, localOnly: true })).toEqual([]);
      expect(resolver.blueprints).toEqual(['jhipster-bar', 'jhipster-foo']);
    });

    it('should name a blueprint of a package path after its package name', () => {
      const resolver = new GeneratorsResolver();
      expect(resolver.lookupBlueprints(['jhipster-foo'], { packagePaths: [join(process.cwd(), 'foo-worktree')] })).toEqual([]);
      expect(resolver.getGeneratorMeta('jhipster-foo:client')).toBeDefined();
      expect(resolver.getGeneratorMeta('jhipster-foo:app')).toBeUndefined();
    });

    it('should resolve in the store given', () => {
      const store = getJHipsterStore({ empty: true });
      new GeneratorsResolver({ store }).lookupBlueprints(['jhipster-bar'], { npmPaths, localOnly: true });
      expect(store.namespaces()).toEqual(['jhipster-bar:app']);
    });

    it('should not change the jhipster store', () => {
      new GeneratorsResolver().lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true });
      expect(getJHipsterStore().getMeta('jhipster-foo:app')).toBeUndefined();
    });

    it('should look up a blueprint by its package name', () => {
      const resolver = new GeneratorsResolver();
      expect(
        resolver.lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true, packagePatterns: ['generator-jhipster-foo'] }),
      ).toEqual([]);
      expect(resolver.getGeneratorMeta('jhipster-foo:app')).toBeDefined();
    });

    it('should keep the blueprints the store has already, not looking them up again', () => {
      const store = getJHipsterStore({ empty: true });
      new GeneratorsResolver({ store }).lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true });
      const resolver = new GeneratorsResolver({ store });
      // Nowhere to look up: the blueprint comes from the store.
      expect(resolver.lookupBlueprints(['jhipster-foo'], { npmPaths: [], localOnly: true })).toEqual([]);
      expect(resolver.blueprints).toEqual(['jhipster-foo']);
    });

    it('should load the commands of the blueprints, marked with their namespace', async () => {
      const resolver = new GeneratorsResolver();
      resolver.lookupBlueprints(['jhipster-foo', 'jhipster-bar'], { npmPaths, localOnly: true });
      const log = esmocha.fn<(message: string) => void>();
      expect(await resolver.loadCommands({ log })).toEqual({ bar: { desc: 'Bar of the blueprint', blueprint: 'jhipster-bar' } });
      expect(log.mock.calls.map(([message]) => message)).toEqual([
        expect.stringContaining('No custom commands found within blueprint: jhipster-foo'),
      ]);
    });

    it('should be a generators store for the commands lookup', () => {
      const resolver = new GeneratorsResolver();
      resolver.lookupBlueprints(['jhipster-foo'], { npmPaths, localOnly: true });
      expect(Object.keys(resolver.getGeneratorsMeta())).toContain('jhipster-foo:server');
    });
  });
});
