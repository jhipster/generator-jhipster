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
import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { union } from 'lodash-es';
import semver from 'semver';
import type { PackageJson } from 'type-fest';

import { packageJson } from '../../../lib/index.ts';
import { packageNameToNamespace } from '../../../lib/utils/index.ts';
import type CoreGenerator from '../../base-core/index.ts';
import { CONTEXT_DATA_BLUEPRINTS_TO_COMPOSE } from '../support/constants.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../types.ts';

import { mergeBlueprints, parseBlueprints } from './blueprint.ts';

const CONTEXT_DATA_BLUEPRINTS_RESOLVER = 'jhipster:blueprintsResolver';

type Generator = CoreGenerator<BaseConfig, BaseOptions>;

/**
 * Resolves the blueprints of a destination for every generator composed there: the `--blueprints` option merged with
 * the ones of the config, looked up, written to the config with their versions and checked against this JHipster.
 * Resolved again when another generator changes the blueprints of the config, like the jdl generator writing the config
 * of a jdl: the option is merged with the new ones, and the generators composed next compose them.
 */
export class BlueprintsResolver {
  readonly #generator: Generator;
  readonly #env: Generator['env'];
  readonly #log: Generator['log'];
  #blueprints: Promise<string[]>;
  #resolvedNames: string[] = [];
  #resolving = false;

  constructor(generator: Generator) {
    this.#generator = generator;
    this.#env = generator.env;
    this.#log = generator.log;
    this.#blueprints = this.#resolveBlueprints();
    this.#listenToConfigChanges();
  }

  /** The names of the blueprints to compose with. */
  getBlueprints(): Promise<string[]> {
    return this.#blueprints;
  }

  #listenToConfigChanges() {
    const configFile = this.#generator.destinationPath('.yo-rc.json');
    this.#env.sharedFs.on('change', (filePath: string) => {
      if (this.#resolving || filePath !== configFile) return;
      const storedNames = (this.#generator.config.get('blueprints') ?? []).map(({ name }) => name);
      if (storedNames.join() !== this.#resolvedNames.join()) {
        this.#blueprints = this.#resolveBlueprints();
      }
    });
  }

  async #resolveBlueprints(): Promise<string[]> {
    this.#resolving = true;
    try {
      this.#resolvedNames = await this.#mergeBlueprints();
      return this.#resolvedNames;
    } finally {
      this.#resolving = false;
    }
  }

  async #mergeBlueprints(): Promise<string[]> {
    let argvBlueprints = this.#generator.options.blueprints ?? '';
    // check for old single blueprint declaration
    let { blueprint } = this.#generator.options;
    if (blueprint) {
      if (typeof blueprint === 'string') {
        blueprint = [blueprint];
      }
      this.#log.warn('--blueprint option is deprecated. Please use --blueprints instead');
      argvBlueprints = union(blueprint, argvBlueprints.split(',')).join(',');
    }
    const blueprints = mergeBlueprints(parseBlueprints(argvBlueprints), this.#generator.config.get('blueprints') ?? []);

    // EnvironmentBuilder already looks for blueprint when running from cli, this is required for tests.
    // Can be removed once the tests uses EnvironmentBuilder.
    const missingBlueprints = blueprints
      .filter(blueprint => !this.#env.isPackageRegistered(packageNameToNamespace(blueprint.name)))
      .map(blueprint => blueprint.name);
    if (missingBlueprints.length > 0) {
      await this.#env.lookup({ filterPaths: true, packagePatterns: missingBlueprints });
    }

    if (blueprints?.length) {
      blueprints.forEach(blueprint => {
        blueprint.version = this.#findBlueprintVersion(blueprint.name) ?? blueprint.version;
      });
      this.#generator.config.set('blueprints', blueprints);
    }

    if (!this.#generator.skipChecks) {
      const namespaces = blueprints.map(blueprint => packageNameToNamespace(blueprint.name));
      // Verify if the blueprints have been registered.
      const missing = namespaces.filter(namespace => !this.#env.isPackageRegistered(namespace));
      if (missing?.length) {
        throw new Error(`Some blueprints were not found ${missing}, you should install them manually`);
      }
      blueprints.forEach(blueprint => {
        this.#checkJHipsterBlueprintVersion(blueprint.name);
      });
    }
    const blueprintNames = blueprints.map(blueprint => blueprint.name);
    // Kept for the blueprints reading it.
    this.#generator.getContextData(CONTEXT_DATA_BLUEPRINTS_TO_COMPOSE, { replacement: blueprintNames });
    return blueprintNames;
  }

  /**
   * Try to retrieve the package.json of the blueprint used, as an object.
   */
  #findBlueprintPackageJson(blueprintPkgName: string): PackageJson | undefined {
    const blueprintGeneratorName = packageNameToNamespace(blueprintPkgName);
    const blueprintPackagePath = this.#env.getPackagePath(blueprintGeneratorName);
    if (!blueprintPackagePath) {
      this.#log.warn(`Could not retrieve packagePath of blueprint '${blueprintPkgName}'`);
      return undefined;
    }
    const packageJsonFile = path.join(blueprintPackagePath, 'package.json');
    if (!fs.existsSync(packageJsonFile)) {
      return undefined;
    }
    return JSON.parse(fs.readFileSync(packageJsonFile).toString());
  }

  /**
   * Try to retrieve the version of the blueprint used.
   */
  #findBlueprintVersion(blueprintPkgName: string): string | undefined {
    const blueprintPackageJson = this.#findBlueprintPackageJson(blueprintPkgName);
    if (!blueprintPackageJson?.version) {
      this.#log.warn(`Could not retrieve version of blueprint '${blueprintPkgName}'`);
      return undefined;
    }
    return blueprintPackageJson.version;
  }

  #checkJHipsterBlueprintVersion(blueprintPkgName: string) {
    const blueprintPackageJson = this.#findBlueprintPackageJson(blueprintPkgName);
    if (!blueprintPackageJson) {
      this.#log.warn(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
      return;
    }
    const mainGeneratorJhipsterVersion = packageJson.version;
    const compatibleJhipsterRange =
      blueprintPackageJson.engines?.['generator-jhipster'] ??
      blueprintPackageJson.dependencies?.['generator-jhipster'] ??
      blueprintPackageJson.peerDependencies?.['generator-jhipster'];
    if (compatibleJhipsterRange) {
      if (!semver.valid(compatibleJhipsterRange) && !semver.validRange(compatibleJhipsterRange)) {
        this.#log.verboseInfo(`Blueprint ${blueprintPkgName} contains generator-jhipster dependency with non comparable version`);
        return;
      }
      if (semver.satisfies(mainGeneratorJhipsterVersion, compatibleJhipsterRange, { includePrerelease: true })) {
        return;
      }
      throw new Error(
        `The installed ${chalk.yellow(
          blueprintPkgName,
        )} blueprint targets JHipster v${compatibleJhipsterRange} and is not compatible with this JHipster version. Either update the blueprint or JHipster. You can also disable this check using --skip-checks at your own risk`,
      );
    }
    this.#log.warn(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
  }
}

/** The blueprints resolver of the destination of a generator, created by the first generator composing blueprints there. */
export const getBlueprintsResolver = (generator: Generator): BlueprintsResolver =>
  generator.getContextData(CONTEXT_DATA_BLUEPRINTS_RESOLVER, { factory: () => new BlueprintsResolver(generator) });
