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
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { cloneDeep } from 'lodash-es';
import type { Store, StoreGeneratorMeta } from 'yeoman-environment';

import type { CliCommand } from '../../cli/types.ts';

import { getJHipsterStore, lookupJHipsterGenerators } from './lookups.ts';

export type LookupBlueprintsOptions = {
  /**
   * Folders of the blueprint packages, like a checkout or a linked blueprint, looked up instead of the installed
   * packages. A blueprint is named after the name in its `package.json`, not after its folder.
   */
  packagePaths?: string[];
  /** The `node_modules` folders to look the installed blueprints up in, the npm paths by default. */
  npmPaths?: string[];
  /** Skip the globally installed blueprints. */
  localOnly?: boolean;
  /** The package names of the blueprints, for a package not named after its namespace (`generator-jhipster-foo`). */
  packagePatterns?: string[];
  /** The lookups in the packages, the ones of the store by default. */
  lookups?: string[];
  /** Name the generators after the folder of their package, not its package name, see `customizeNamespace`. */
  usePackageName?: boolean;
  /** Customize the namespace of the generators, like the one of a folder named after something else. */
  customizeNamespace?: (namespace?: string) => string | undefined;
  /** Look up the blueprints the store has already again, for their new generators. */
  force?: boolean;
};

export type LoadCommandsOptions = {
  /** Logs a blueprint without commands, or with commands that cannot be loaded. Silent by default. */
  log?: (message: string) => void;
};

/**
 * The package name of a blueprint namespace: `jhipster-foo` is `generator-jhipster-foo`, `@scope/jhipster-foo` is
 * `@scope/generator-jhipster-foo`.
 */
export const blueprintNamespaceToPackageName = (namespace: string): string =>
  namespace.startsWith('@') ? namespace.replace('/', '/generator-') : `generator-${namespace}`;

/**
 * Resolves the generators of jhipster and of blueprints, given by their namespace (`jhipster-foo`), in a generators
 * store: a clone of the jhipster store by default. It is a generators store for `lookupGeneratorCommands` and
 * `findConfigOwners`.
 */
export class GeneratorsResolver {
  readonly store: Store;
  /** The namespaces of the blueprints resolved, by priority. */
  readonly blueprints: string[] = [];

  /**
   * @param options.store - The store to resolve the generators in, a clone of the jhipster store by default.
   */
  constructor({ store = getJHipsterStore().clone() }: { store?: Store } = {}) {
    this.store = store;
  }

  /**
   * Look up the generators of the blueprints, the ones of a blueprint the store has already are not looked up again.
   * @returns the namespaces of the blueprints that were not found.
   */
  lookupBlueprints(
    namespaces: string[],
    {
      packagePaths,
      npmPaths,
      localOnly,
      packagePatterns,
      lookups,
      usePackageName,
      customizeNamespace,
      force,
    }: LookupBlueprintsOptions = {},
  ): string[] {
    const missing = force ? namespaces : this.findMissing(namespaces);
    if (missing.length > 0) {
      this.store.lookupSync({
        ...(lookups ? { lookups } : {}),
        ...(customizeNamespace ? { customizeNamespace } : {}),
        ...(usePackageName === undefined ? {} : { usePackageName }),
        ...(packagePaths ?
          { packagePaths }
        : {
            packagePatterns: packagePatterns ?? missing.map(blueprintNamespaceToPackageName),
            npmPaths,
            localOnly,
            filterPaths: true,
          }),
        // Only the generators of the blueprints asked for.
        filter: ({ namespace }) => missing.some(blueprint => namespace.startsWith(`${blueprint}:`)),
      });
    }
    const notFound = this.findMissing(namespaces);
    this.blueprints.push(...namespaces.filter(namespace => !notFound.includes(namespace) && !this.blueprints.includes(namespace)));
    return notFound;
  }

  /**
   * Look up the jhipster generators of this installation, its source or its build.
   */
  lookupJHipster() {
    return lookupJHipsterGenerators(this.store);
  }

  /**
   * Look up generators in the store, with its lookup options.
   */
  lookup(options: Parameters<Store['lookupSync']>[0] = {}) {
    return this.store.lookupSync(options);
  }

  /**
   * The commands the blueprints add to the cli: the default export of the `cli/commands` module of each blueprint, each
   * command marked with the namespace of its blueprint. A blueprint overrides the commands of the previous ones.
   */
  async loadCommands({ log }: LoadCommandsOptions = {}): Promise<Record<string, CliCommand>> {
    const packagesPaths = this.store.getPackagesPaths();
    let commands: Record<string, CliCommand> = {};
    for (const blueprint of this.blueprints) {
      const packagePath = packagesPaths[blueprint]?.[0];
      const commandsFile =
        packagePath &&
        ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'].map(extension => join(packagePath, `cli/commands${extension}`)).find(existsSync);
      if (!commandsFile) {
        log?.(`No custom commands found within blueprint: ${blueprint} at ${packagePath}`);
        continue;
      }
      try {
        const blueprintCommands: Record<string, CliCommand> = cloneDeep((await import(pathToFileURL(commandsFile).href)).default);
        for (const command of Object.values(blueprintCommands)) {
          command.blueprint ??= blueprint;
        }
        commands = { ...commands, ...blueprintCommands };
      } catch {
        log?.(`Error parsing custom commands found within blueprint: ${blueprint} at ${commandsFile}`);
      }
    }
    return commands;
  }

  /** The meta of a generator, by its namespace (`jhipster:app`, `jhipster-foo:app`). */
  getGeneratorMeta(namespace: string): StoreGeneratorMeta | undefined {
    return this.store.getMeta(namespace);
  }

  getGeneratorsMeta(): Record<string, StoreGeneratorMeta> {
    return this.store.getGeneratorsMeta();
  }

  private findMissing(namespaces: string[]): string[] {
    const registered = this.store.getPackagesNS();
    return namespaces.filter(namespace => !registered.includes(namespace));
  }
}
