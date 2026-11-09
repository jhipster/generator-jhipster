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
import { describe, expect, it } from 'expect-node';
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getJHipsterStore, jhipsterNamespace } from './lookups.ts';

/** A blueprint published under a scope, `@scope/generator-jhipster-foo`, in a folder named `folder`. */
const createScopedPackage = (folder: string) => {
  const root = join(realpathSync(mkdtempSync(join(tmpdir(), 'scoped-package-'))), folder);
  mkdirSync(join(root, 'generators', 'app'), { recursive: true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@scope/generator-jhipster-foo', version: '0.0.1' }));
  writeFileSync(join(root, 'generators', 'app', 'index.js'), 'export default class {}\n');
  return root;
};

describe('resolver - lookups', () => {
  describe('getJHipsterStore', () => {
    it('should name the generators after the package name, not its folder', () => {
      // The folder of this checkout may be a worktree or an aliased install.
      const namespaces = getJHipsterStore().namespaces();
      expect(namespaces.filter(namespace => !namespace.startsWith('jhipster:'))).toEqual([]);
      expect(namespaces).toContain('jhipster:app');
    });
    it('should flatten the nested generators', () => {
      expect(getJHipsterStore().namespaces()).toContain('jhipster:spring-boot:cache');
    });
  });
  describe('a package published under another name', () => {
    it('should name a package installed under an alias after its folder', () => {
      const root = createScopedPackage(join('node_modules', 'generator-jhipster-foo'));
      const store = getJHipsterStore({ empty: true });
      store.lookupSync({ packagePaths: [root] });
      expect(store.namespaces()).toEqual(['jhipster-foo:app']);
    });
    it('should name a checkout after its package.json', () => {
      const root = createScopedPackage('checkout');
      const store = getJHipsterStore({ empty: true });
      store.lookupSync({ packagePaths: [root] });
      expect(store.namespaces()).toEqual(['@scope/jhipster-foo:app']);
    });
  });
  describe('jhipsterNamespace', () => {
    it('should name a generator of a package published under another name jhipster', () => {
      expect(jhipsterNamespace('@scope/jhipster:app')).toBe('jhipster:app');
      expect(jhipsterNamespace('fork:spring-boot:cache')).toBe('jhipster:spring-boot:cache');
    });
  });
});
