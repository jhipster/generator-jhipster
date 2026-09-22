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

/** Lookups supporting nested generators. */
export const generatorsLookup = ['generators', 'generators/*/generators'];
/** Lookup for source or built generators depending on the files being used. */
export const jhipsterGeneratorsLookup = isDistFolder() ? generatorsLookup.map(lookup => `dist/${lookup}`) : generatorsLookup;
/** Namespace of a nested generator: `jhipster:spring-boot:generators:cache` is `jhipster:spring-boot:cache`. */
export const customizeNestedNamespace = (ns?: string) => ns?.replaceAll(':generators:', ':');

export const JHIPSTER_NAMESPACE_PREFIX = 'jhipster:';

/** The part of a generators store the lookups need. */
export type GeneratorsStore = Pick<Store, 'getGeneratorsMeta'>;

/** A generator with a module to import. */
export type ImportableGeneratorMeta = StoreGeneratorMeta & { resolved: string };

let jhipsterStore: Store | undefined;

/**
 * A store with only the jhipster generators, looked up the way the environment builder looks them up.
 */
export const getJHipsterStore = (): Store => {
  if (!jhipsterStore) {
    jhipsterStore = new Store();
    jhipsterStore.lookupSync({
      packagePaths: [getPackageRoot()],
      lookups: jhipsterGeneratorsLookup,
      customizeNamespace: customizeNestedNamespace,
    });
  }
  return jhipsterStore;
};

/**
 * The generators of a store with a module to import, in the order of their file paths. Defaults to the jhipster
 * generators of this installation.
 */
export const lookupGeneratorsMeta = (store: GeneratorsStore = getJHipsterStore()): ImportableGeneratorMeta[] => {
  const packageRoot = getPackageRoot();
  const generatorPath = ({ resolved }: ImportableGeneratorMeta) => relative(packageRoot, resolved).replaceAll('\\', '/');
  return (
    Object.values(store.getGeneratorsMeta())
      // A generator registered as a class, like the aliases, has no module to import a command from.
      .filter((meta): meta is ImportableGeneratorMeta => Boolean(meta.resolved && meta.importModule))
      .sort((a, b) => Number(generatorPath(a) > generatorPath(b)) - Number(generatorPath(a) < generatorPath(b)))
  );
};
