/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import path, { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { QueuedAdapter } from '@yeoman/adapter';
import chalk from 'chalk';
import { cloneDeep, mergeWith } from 'lodash-es';
import Environment from 'yeoman-environment';

import { type Blueprint, mergeBlueprints, parseBlueprintInfo } from '../generators/base/internal/index.ts';
import { getPackageRoot, isDistFolder } from '../lib/index.ts';
import { createJHipsterLogger, packageNameToNamespace } from '../lib/utils/index.ts';
import { readCurrentPathYoRcFile } from '../lib/utils/yo-rc.ts';

import type { CliCommand } from './types.d.ts';
import { CLI_NAME, logger } from './utils.ts';

const jhipsterDevBlueprintPath =
  process.env.JHIPSTER_DEV_BLUEPRINT === 'true' ? path.join(import.meta.dirname, '../.blueprint') : undefined;
const devBlueprintNamespace = '@jhipster/jhipster-dev';
const localBlueprintNamespace = '@jhipster/jhipster-local';
const customizeNeastedNamespace = (ns?: string) => ns?.replaceAll(':generators:', ':');

// Support nested generators.
export const generatorsLookup = ['generators', 'generators/*/generators'];
// Local and dev blueprints generators.
const localBlueprintGeneratorsLookup = ['.', './*/generators'];
// Lookup for source or built generators depending on the files being used.
const jhipsterGeneratorsLookup = isDistFolder() ? generatorsLookup.map(lookup => `dist/${lookup}`) : generatorsLookup;
// Lookup for source and built generators.
const packagedGeneratorsLookup = generatorsLookup.map(lookup => [`dist/${lookup}`, lookup]).flat();

const defaultLookupOptions = Object.freeze({
  lookups: packagedGeneratorsLookup,
  customizeNamespace: customizeNeastedNamespace,
});

type EnvironmentOptions = ConstructorParameters<typeof Environment>[0];

const createEnvironment = (options: EnvironmentOptions = {}) => {
  options.adapter = options.adapter ?? new QueuedAdapter({ log: createJHipsterLogger() });
  return new Environment({
    ...options,
    generatorLookupOptions: { ...defaultLookupOptions, ...options.generatorLookupOptions },
  });
};

export default class EnvironmentBuilder {
  env: Environment;
  devBlueprintPath?: string;
  localBlueprintPath?: string;
  localBlueprintExists?: boolean;
  _blueprintsWithVersion: Record<string, string | undefined> = {};

  /**
   * Creates a new EnvironmentBuilder with a new Environment.
   */
  static create(options: EnvironmentOptions = {}): EnvironmentBuilder {
    const env = createEnvironment(options);
    env.setMaxListeners(0);
    return new EnvironmentBuilder(env);
  }

  /**
   * Creates a new Environment with blueprints.
   *
   * Can be used to create a new test environment (requires yeoman-test >= 2.6.0):
   * @example
   * const promise = require('yeoman-test').create('jhipster:app', {}, {createEnv: EnvironmentBuilder.createEnv}).run();
   */
  static async createEnv(...args: Parameters<typeof EnvironmentBuilder.createDefaultBuilder>): Promise<Environment> {
    const builder = await EnvironmentBuilder.createDefaultBuilder(...args);
    return builder.getEnvironment();
  }

  /**
   * Creates a new EnvironmentBuilder with a new Environment and load jhipster, blueprints and sharedOptions.
   */
  static async createDefaultBuilder(...args: Parameters<typeof EnvironmentBuilder.create>): Promise<EnvironmentBuilder> {
    return EnvironmentBuilder.create(...args).prepare();
  }

  static async run(
    args: Parameters<Environment['run']>[0],
    generatorOptions: Parameters<Environment['run']>[1] & Record<string, unknown> = {},
    envOptions: Parameters<typeof EnvironmentBuilder.create>[0] = {},
  ) {
    const envBuilder = await EnvironmentBuilder.createDefaultBuilder(envOptions);
    const env = envBuilder.getEnvironment();
    await env.run(args, generatorOptions);
  }

  /**
   * Class to manipulate yeoman environment for jhipster needs.
   * - Registers jhipster generators.
   * - Loads blueprints from argv and .yo-rc.json.
   * - Installs blueprints if not found.
   * - Loads sharedOptions.
   */
  constructor(env: Environment) {
    this.env = env;
  }

  async prepare({
    blueprints,
    lookups,
    devBlueprintPath = jhipsterDevBlueprintPath,
  }: {
    blueprints?: Record<string, string | undefined>;
    lookups?: Parameters<Environment['lookup']>[0][];
    devBlueprintPath?: string;
  } = {}) {
    const devBlueprintEnabled = devBlueprintPath && existsSync(devBlueprintPath);
    this.env.sharedOptions.devBlueprintEnabled = devBlueprintEnabled;
    this.devBlueprintPath = devBlueprintEnabled ? devBlueprintPath : undefined;
    this.localBlueprintPath = path.join(process.cwd(), '.blueprint');
    this.localBlueprintExists = this.localBlueprintPath !== this.devBlueprintPath && existsSync(this.localBlueprintPath);

    await this._lookupJHipster();
    await this._lookupLocalBlueprint();
    await this._lookupDevBlueprint();
    this._loadBlueprints(blueprints);
    await this._lookups(lookups);
    await this._lookupBlueprints();
    await this._loadSharedOptions();
    return this;
  }

  getBlueprintsNamespaces() {
    return [
      ...Object.keys(this._blueprintsWithVersion).map(packageName => packageNameToNamespace(packageName)),
      localBlueprintNamespace,
      ...(this.devBlueprintPath ? [devBlueprintNamespace] : []),
    ];
  }

  /**
   * Construct blueprint option value.
   *
   * @return {String}
   */
  getBlueprintsOption() {
    return Object.entries(this._blueprintsWithVersion)
      .map(([packageName, packageVersion]) => (packageVersion ? `${packageName}@${packageVersion}` : packageName))
      .join(',');
  }

  async updateJHipsterGenerators() {
    await this._lookupJHipster();
    await this._lookupDevBlueprint();
  }

  /**
   * @private
   * Lookup current jhipster generators.
   */
  async _lookupJHipster() {
    // Register jhipster generators.
    const generators = await this.env.lookup({
      packagePaths: [getPackageRoot()],
      lookups: jhipsterGeneratorsLookup,
    });
    generators.forEach(generator => {
      // Verify jhipster generators namespace.
      assert(
        generator.namespace.startsWith(`${CLI_NAME}:`),
        `Error on the registered namespace ${generator.namespace}, make sure your folder is called generator-jhipster.`,
      );
    });
    return this;
  }

  async _lookupLocalBlueprint(): Promise<this> {
    if (this.localBlueprintExists) {
      // Register jhipster generators.
      const generators = await this.env.lookup({
        packagePaths: [this.localBlueprintPath!],
        lookups: localBlueprintGeneratorsLookup,
        customizeNamespace: ns => customizeNeastedNamespace(ns)?.replace('.blueprint', '@jhipster/jhipster-local'),
      });
      if (generators.length > 0) {
        this.env.sharedOptions.composeWithLocalBlueprint = true;
      }
    }
    return this;
  }

  async _lookupDevBlueprint(): Promise<this> {
    if (this.devBlueprintPath) {
      // Register jhipster generators.
      await this.env.lookup({
        packagePaths: [this.devBlueprintPath],
        lookups: localBlueprintGeneratorsLookup,
        customizeNamespace: ns => customizeNeastedNamespace(ns)?.replace('.blueprint', '@jhipster/jhipster-dev'),
      });
    }
    return this;
  }

  async _lookups(lookups: Parameters<Environment['lookup']>[0][] = []): Promise<this> {
    for (const lookup of lookups) {
      await this.env.lookup(lookup);
    }
    return this;
  }

  /**
   * @private
   * Load blueprints from argv, .yo-rc.json.
   */
  _loadBlueprints(blueprints: Record<string, string | undefined> | undefined): this {
    this._blueprintsWithVersion = {
      ...this._getAllBlueprintsWithVersion(),
      ...blueprints,
    };
    return this;
  }

  /**
   * @private
   * Lookup current loaded blueprints.
   */
  async _lookupBlueprints(options: Parameters<Environment['lookup']>[0] = {}) {
    const missingBlueprints = Object.keys(this._blueprintsWithVersion).filter(
      blueprint => !this.env.isPackageRegistered(packageNameToNamespace(blueprint)),
    );

    if (missingBlueprints && missingBlueprints.length > 0) {
      // Lookup for blueprints.
      await this.env.lookup({
        ...options,
        filterPaths: true,
        packagePatterns: missingBlueprints,
        lookups: packagedGeneratorsLookup,
      });
    }
    return this;
  }

  /**
   * Lookup for generators.
   */
  async lookupGenerators(generators: string[], options: Parameters<Environment['lookup']>[0] = {}): Promise<this> {
    await this.env.lookup({ filterPaths: true, ...options, packagePatterns: generators });
    return this;
  }

  /**
   * @private
   * Load sharedOptions from jhipster and blueprints.
   */
  async _loadSharedOptions(): Promise<this> {
    const blueprintsPackagePath = await this._getBlueprintPackagePaths();
    if (blueprintsPackagePath) {
      const sharedOptions = (await this._getSharedOptions(blueprintsPackagePath)) ?? {};
      // Env will forward sharedOptions to every generator
      Object.assign(this.env.sharedOptions, sharedOptions);
    }
    return this;
  }

  /**
   * Get blueprints commands.
   */
  async getBlueprintCommands() {
    let blueprintsPackagePath = await this._getBlueprintPackagePaths();
    if (this.devBlueprintPath) {
      blueprintsPackagePath = blueprintsPackagePath ?? [];
      blueprintsPackagePath.push([devBlueprintNamespace, this.devBlueprintPath]);
      if (this.localBlueprintExists) {
        blueprintsPackagePath.push([localBlueprintNamespace, this.localBlueprintPath]);
      }
    }
    return this._getBlueprintCommands(blueprintsPackagePath);
  }

  /**
   * Get the environment.
   */
  getEnvironment() {
    return this.env;
  }

  /**
   * Load blueprints from argv.
   * At this point, commander has not parsed yet because we are building it.
   */
  private _getBlueprintsFromArgv(): Blueprint[] {
    const blueprintNames = [];
    const indexOfBlueprintArgv = process.argv.indexOf('--blueprint');
    if (indexOfBlueprintArgv > -1) {
      blueprintNames.push(process.argv[indexOfBlueprintArgv + 1]);
    }
    const indexOfBlueprintsArgv = process.argv.indexOf('--blueprints');
    if (indexOfBlueprintsArgv > -1) {
      blueprintNames.push(...process.argv[indexOfBlueprintsArgv + 1].split(','));
    }
    if (!blueprintNames.length) {
      return [];
    }
    return blueprintNames.map(v => parseBlueprintInfo(v));
  }

  /**
   * Load blueprints from .yo-rc.json.
   */
  _getBlueprintsFromYoRc(): Blueprint[] {
    return (readCurrentPathYoRcFile()?.['generator-jhipster']?.blueprints as Blueprint[]) ?? [];
  }

  /**
   * @private
   * Creates a 'blueprintName: blueprintVersion' object from argv and .yo-rc.json blueprints.
   */
  _getAllBlueprintsWithVersion(): Record<string, string | undefined> {
    return mergeBlueprints(this._getBlueprintsFromArgv(), this._getBlueprintsFromYoRc()).reduce(
      (acc, blueprint) => {
        acc[blueprint.name] = blueprint.version;
        return acc;
      },
      {} as Record<string, string | undefined>,
    );
  }

  /**
   * @private
   * Get packagePaths from current loaded blueprints.
   */
  async _getBlueprintPackagePaths(): Promise<[string, string | undefined][] | undefined> {
    const blueprints = this._blueprintsWithVersion;
    if (!blueprints || Object.keys(blueprints).length === 0) {
      return undefined;
    }

    await Promise.all(
      Object.keys(blueprints).map(async blueprint => {
        const namespace = packageNameToNamespace(blueprint);
        if (!this.env.getPackagePath(namespace)) {
          await this.env.lookupLocalPackages([blueprint]);
        }
      }),
    );

    const blueprintsToInstall = Object.entries(blueprints)
      .filter(([blueprint, _version]) => {
        const namespace = packageNameToNamespace(blueprint);
        return !this.env.getPackagePath(namespace);
      })
      .reduce(
        (acc, [blueprint, version]) => {
          acc[blueprint] = version;
          return acc;
        },
        {} as Record<string, string | undefined>,
      );

    if (Object.keys(blueprintsToInstall).length > 0) {
      await this.env.installLocalGenerators(blueprintsToInstall);
    }

    return Object.entries(blueprints).map(([blueprint, _version]) => {
      const namespace = packageNameToNamespace(blueprint);
      const packagePath = this.env.getPackagePath(namespace);
      if (!packagePath) {
        logger.fatal(
          `The ${chalk.yellow(blueprint)} blueprint provided is not installed. Please install it using command ${chalk.yellow(
            `npm i -g ${blueprint}`,
          )}`,
        );
      }
      return [blueprint, packagePath];
    });
  }

  /**
   * @private
   * Get blueprints commands.
   */
  async _getBlueprintCommands(
    blueprintPackagePaths: [string, string | undefined][] | undefined,
  ): Promise<Record<string, CliCommand> | undefined> {
    if (!blueprintPackagePaths || blueprintPackagePaths.length === 0) {
      return undefined;
    }
    let result: Record<string, CliCommand> = {};
    for (const [blueprint, packagePath] of blueprintPackagePaths) {
      let blueprintCommand: Record<string, CliCommand>;
      const blueprintCommandFile = `${packagePath}/cli/commands`;
      const blueprintCommandExtension = ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'].find(extension =>
        existsSync(`${blueprintCommandFile}${extension}`),
      );
      if (blueprintCommandExtension) {
        const blueprintCommandsUrl = pathToFileURL(resolve(`${blueprintCommandFile}${blueprintCommandExtension}`));
        try {
          blueprintCommand = (await import(blueprintCommandsUrl.href)).default;
          const blueprintCommands = cloneDeep(blueprintCommand);
          Object.entries(blueprintCommands).forEach(([_command, commandSpec]) => {
            commandSpec.blueprint ??= blueprint;
          });
          result = { ...result, ...blueprintCommands };
        } catch {
          const msg = `Error parsing custom commands found within blueprint: ${blueprint} at ${blueprintCommandsUrl}`;
          /* eslint-disable no-console */
          console.info(`${chalk.green.bold('INFO!')} ${msg}`);
        }
      } else {
        const msg = `No custom commands found within blueprint: ${blueprint} at ${packagePath}`;
        /* eslint-disable no-console */
        console.info(`${chalk.green.bold('INFO!')} ${msg}`);
      }
    }
    return result;
  }

  /**
   * @private
   * Get blueprints sharedOptions.
   */
  async _getSharedOptions(blueprintPackagePaths: [string, string | undefined][] | undefined): Promise<any> {
    function joiner(objValue: any, srcValue: any) {
      if (objValue === undefined) {
        return srcValue;
      }
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
      if (Array.isArray(objValue)) {
        return [...objValue, srcValue];
      }
      if (Array.isArray(srcValue)) {
        return [objValue, ...srcValue];
      }
      return [objValue, srcValue];
    }

    async function loadSharedOptionsFromFile(sharedOptionsBase: string, msg?: string, errorMsg?: string): Promise<any> {
      try {
        const baseExtension = ['.js', '.cjs', '.mjs'].find(extension => existsSync(resolve(`${sharedOptionsBase}${extension}`)));
        if (baseExtension) {
          const { default: opts } = await import(pathToFileURL(resolve(`${sharedOptionsBase}${baseExtension}`)).href);
          /* eslint-disable no-console */
          if (msg) {
            console.info(`${chalk.green.bold('INFO!')} ${msg}`);
          }
          return opts;
        }
      } catch (e) {
        if (errorMsg) {
          console.info(`${chalk.green.bold('INFO!')} ${errorMsg}`, e);
        }
      }
      return {};
    }

    const localPath = './.jhipster/sharedOptions';
    let result = await loadSharedOptionsFromFile(localPath, `SharedOptions found at local config ${localPath}`);

    if (!blueprintPackagePaths) {
      return undefined;
    }

    for (const [blueprint, packagePath] of blueprintPackagePaths) {
      const errorMsg = `No custom sharedOptions found within blueprint: ${blueprint} at ${packagePath}`;
      const opts = await loadSharedOptionsFromFile(`${packagePath}/cli/sharedOptions`, undefined, errorMsg);
      result = mergeWith(result, opts, joiner);
    }
    return result;
  }
}
