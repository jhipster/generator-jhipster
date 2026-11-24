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
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import type { Store, StoreGeneratorMeta } from 'yeoman-environment';

import { getJHipsterStore } from './lookups.ts';

/** The package a generator registered as an alias belongs to. */
export type GeneratorAlias = {
  /** The name of the package taken, like `generator-jhipster-nodejs`. */
  aliasOf: string;
  /** The version of the package taken, the `getPackageVersion` of the meta of its generator. */
  getPackageVersion?: () => string | undefined;
};

type AliasGeneratorMeta = StoreGeneratorMeta & { alias?: GeneratorAlias };

/**
 * The package a generator is an alias of, when it was registered from a package a blueprint takes (`"jhipster": {
 * "aliases": [...] }` of its `package.json`), else undefined.
 */
export const getGeneratorAlias = (meta: object | undefined): GeneratorAlias | undefined => (meta as AliasGeneratorMeta | undefined)?.alias;

/** The folder of a package, resolved as the package at `from` requires it. */
const resolvePackagePath = (packageName: string, from: string): string | undefined =>
  // The `package.json` of a package may not be exported, the folders a require looks the package up in are tried instead.
  createRequire(join(from, 'package.json'))
    .resolve.paths(packageName)
    ?.map(nodeModules => join(nodeModules, packageName))
    .find(packagePath => existsSync(join(packagePath, 'package.json')));

const readPackageJson = (packagePath: string): Record<string, any> => JSON.parse(readFileSync(join(packagePath, 'package.json'), 'utf8'));

/** The blueprints whose aliases a store has, by their folder. */
const registeredAliases = new WeakMap<Store, Set<string>>();

/**
 * Register in the store the generators of the packages the blueprint takes, the ones of its `package.json` `"jhipster": {
 * "aliases": [...] }`, under the namespace of the blueprint, the nested ones too: only the generators the blueprint does
 * not have. A copy has no package path, the one of the blueprint stays its own, and keeps the package it is of and its
 * version (`getGeneratorAlias`). A package taken is resolved as the blueprint requires it.
 */
export const registerBlueprintAliases = (store: Store, blueprintNamespace: string): void => {
  const blueprintPath = store.getPackagesPaths()[blueprintNamespace]?.[0];
  if (!blueprintPath) return;
  // Once by store and blueprint: a generator the blueprint registers later replaces its copy.
  const registered = registeredAliases.get(store) ?? new Set<string>();
  registeredAliases.set(store, registered);
  if (registered.has(blueprintPath)) return;
  registered.add(blueprintPath);
  // A local or a dev blueprint, a `.blueprint` folder, may have no `package.json`.
  if (!existsSync(join(blueprintPath, 'package.json'))) return;
  const aliases: unknown = readPackageJson(blueprintPath).jhipster?.aliases;
  if (!Array.isArray(aliases)) return;
  for (const aliasOf of aliases as string[]) {
    const packagePath = resolvePackagePath(aliasOf, blueprintPath);
    if (!packagePath) {
      throw new Error(`The package ${aliasOf} the blueprint ${blueprintNamespace} takes is not installed`);
    }
    const taken = getJHipsterStore({ empty: true });
    taken.lookupSync({ packagePaths: [packagePath] });
    for (const meta of Object.values(taken.getGeneratorsMeta())) {
      const { packageNamespace, resolved } = meta;
      if (!packageNamespace || !resolved) continue;
      const namespace = `${blueprintNamespace}${meta.namespace.slice(packageNamespace.length)}`;
      if (store.getMeta(namespace)) continue;
      const alias: GeneratorAlias = { aliasOf, getPackageVersion: meta.getPackageVersion };
      store.add({ namespace, resolved, alias } as AliasGeneratorMeta);
    }
  }
};
