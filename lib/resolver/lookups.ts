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
import { relative } from 'node:path';

import { Store, type StoreGeneratorMeta } from 'yeoman-environment';

import { getPackageRoot, isDistFolder } from '../index.ts';

/** Lookups of the generators, the nested ones being looked up by `nestedGenerators`. */
const generatorsLookup = ['generators'];
/** Lookup for source or built generators depending on the files being used. */
const jhipsterGeneratorsLookup = isDistFolder() ? generatorsLookup.map(lookup => `dist/${lookup}`) : generatorsLookup;
/** Lookup for the built and the source generators of a package, like a blueprint. */
const packagedGeneratorsLookup = generatorsLookup.flatMap(lookup => [`dist/${lookup}`, lookup]);

/**
 * The lookup options of the stores, shared by their lookups: the generators of a package like a blueprint, with the
 * nested ones (`spring-boot/generators/cache` is `spring-boot:cache`), and the namespace of a package is its name, not
 * its folder, which differs in an aliased install (`generator-jhipster-9@npm:generator-jhipster@9`) or in a git worktree.
 */
const storeLookupOptions = Object.freeze({
  lookups: packagedGeneratorsLookup,
  usePackageName: true,
  nestedGenerators: true,
});

/** A generator with a module to import. */
type ImportableGeneratorMeta = StoreGeneratorMeta & { resolved: string };

let jhipsterStore: Store | undefined;

/**
 * Look up the jhipster generators of this installation, its source or its build, in a store.
 */
export const lookupJHipsterGenerators = (store: Store) =>
  store.lookupSync({ packagePaths: [getPackageRoot()], lookups: jhipsterGeneratorsLookup });

/**
 * A store with only the jhipster generators, looked up the way the environment builder looks them up, or with `empty`
 * a new store without generators, with the same lookup options.
 */
export const getJHipsterStore = ({ empty = false }: { empty?: boolean } = {}): Store => {
  if (empty) {
    return new Store(undefined, storeLookupOptions);
  }
  if (!jhipsterStore) {
    jhipsterStore = new Store(undefined, storeLookupOptions);
    lookupJHipsterGenerators(jhipsterStore);
  }
  return jhipsterStore;
};

/**
 * The generators of a store with a module to import, in the order of their file paths. Defaults to the jhipster
 * generators of this installation.
 */
export const lookupGeneratorsMeta = (store: Pick<Store, 'getGeneratorsMeta'> = getJHipsterStore()): ImportableGeneratorMeta[] => {
  const packageRoot = getPackageRoot();
  const generatorPath = ({ resolved }: ImportableGeneratorMeta) => relative(packageRoot, resolved).replaceAll('\\', '/');
  return (
    Object.values(store.getGeneratorsMeta())
      // A generator registered as a class, like the aliases, has no module to import a command from.
      .filter((meta): meta is ImportableGeneratorMeta => Boolean(meta.resolved && meta.requireModule))
      .sort((a, b) => Number(generatorPath(a) > generatorPath(b)) - Number(generatorPath(a) < generatorPath(b)))
  );
};
