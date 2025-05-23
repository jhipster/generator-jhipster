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
import assert from 'assert';
import { existsSync } from 'fs';
import path, { dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import chalk from 'chalk';
import { cloneDeep, mergeWith } from 'lodash-es';
import Environment from 'yeoman-environment';
import { QueuedAdapter } from '@yeoman/adapter';

import { createJHipsterLogger, packageNameToNamespace } from '../generators/base/support/index.js';
import { mergeBlueprints, parseBlueprintInfo } from '../generators/base/internal/index.js';
import { readCurrentPathYoRcFile } from '../lib/utils/yo-rc.js';
import { CLI_NAME, logger } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jhipsterDevBlueprintPath = process.env.JHIPSTER_DEV_BLUEPRINT === 'true' ? path.join(__dirname, '../.blueprint') : undefined;
const devBlueprintNamespace = '@jhipster/jhipster-dev';
const localBlueprintNamespace = '@jhipster/jhipster-local';
const defaultLookupOptions = {
  lookups: ['generators', 'generators/*/generators'],
  customizeNamespace: ns => ns?.replaceAll(':generators:', ':'),
};

const createEnvironment = (options = {}) => {
  options.adapter = options.adapter ?? new QueuedAdapter({ log: createJHipsterLogger() });
  return new Environment({ newErrorHandler: true, ...options });
};

export default class EnvironmentBuilder {
  /** @type {Environment} */
  env;
  devBlueprintPath;
  localBlueprintPath;
  localBlueprintExists;

  /**
   * Creates a new EnvironmentBuilder with a new Environment.
   *
   * @param {any} [args] - Arguments passed to Environment.createEnv().
   * @param {Object} [options] - options passed to Environment.createEnv().
   * @param [adapter] - adapter passed to Environment.createEnv().
   * @return {EnvironmentBuilder} envBuilder
   */
  static create(options = {}) {
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
   *
   * @param {...any} args - Arguments passed to Environment.createEnv().
   * @return {Promise<Environment>} envBuilder
   */
  static async createEnv(...args) {
    const builder = await EnvironmentBuilder.createDefaultBuilder(...args);
    return builder.getEnvironment();
  }

  /**
   * Creates a new EnvironmentBuilder with a new Environment and load jhipster, blueprints and sharedOptions.
   *
   * @param {...any} args - Arguments passed to Environment.createEnv().
   * @return {EnvironmentBuilder} envBuilder
   */
  static async createDefaultBuilder(...args) {
    return EnvironmentBuilder.create(...args).prepare();
  }

  static async run(args, generatorOptions = {}, envOptions = {}) {
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
  constructor(env) {
    this.env = env;
  }

  async prepare({ blueprints, lookups, devBlueprintPath = jhipsterDevBlueprintPath } = {}) {
    const devBlueprintEnabled = existsSync(devBlueprintPath);
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

  /**
   * @private
   * Lookup current jhipster generators.
   *
   * @return {EnvironmentBuilder} this for chaining.
   */
  async _lookupJHipster() {
    // Register jhipster generators.
    const sourceRoot = path.basename(path.join(__dirname, '..'));
    let packagePath;
    let lookup;
    if (sourceRoot === 'generator-jhipster') {
      packagePath = path.join(__dirname, '..');
      lookup = 'generators';
    } else {
      packagePath = path.join(__dirname, '../..');
      lookup = `${sourceRoot}/generators`;
    }
    const generators = await this.env.lookup({
      ...defaultLookupOptions,
      packagePaths: [packagePath],
      lookups: [lookup, `${lookup}/*/generators`],
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

  async _lookupLocalBlueprint() {
    if (this.localBlueprintExists) {
      // Register jhipster generators.
      const generators = await this.env.lookup({
        packagePaths: [this.localBlueprintPath],
        lookups: ['.', './*/generators'],
        customizeNamespace: ns => ns?.replaceAll(':generators:', ':').replace('.blueprint', '@jhipster/jhipster-local'),
      });
      if (generators.length > 0) {
        this.env.sharedOptions.composeWithLocalBlueprint = true;
      }
    }
    return this;
  }

  async _lookupDevBlueprint() {
    // Register jhipster generators.
    await this.env.lookup({
      packagePaths: [this.devBlueprintPath],
      lookups: ['.'],
      customizeNamespace: ns => ns?.replace('.blueprint', '@jhipster/jhipster-dev'),
    });
    return this;
  }

  async _lookups(lookups = []) {
    lookups = [].concat(lookups);
    for (const lookup of lookups) {
      await this.env.lookup({ ...defaultLookupOptions, ...lookup });
    }
    return this;
  }

  /**
   * @private
   * Load blueprints from argv, .yo-rc.json.
   *
   * @return {EnvironmentBuilder} this for chaining.
   */
  _loadBlueprints(blueprints) {
    this._blueprintsWithVersion = {
      ...this._getAllBlueprintsWithVersion(),
      ...blueprints,
    };
    return this;
  }

  /**
   * @private
   * Lookup current loaded blueprints.
   *
   * @param {Object} [options] - forwarded to Environment lookup.
   * @return {EnvironmentBuilder} this for chaining.
   */
  async _lookupBlueprints(options) {
    const missingBlueprints = Object.keys(this._blueprintsWithVersion).filter(
      blueprint => !this.env.isPackageRegistered(packageNameToNamespace(blueprint)),
    );

    if (missingBlueprints && missingBlueprints.length > 0) {
      // Lookup for blueprints.
      await this.env.lookup({
        ...defaultLookupOptions,
        ...options,
        filterPaths: true,
        packagePatterns: missingBlueprints,
      });
    }
    return this;
  }

  /**
   * Lookup for generators.
   *
   * @param {string[]} [generators] - generators to lookup.
   * @param {Object} [options] - forwarded to Environment lookup.
   * @return {EnvironmentBuilder} this for chaining.
   */
  async lookupGenerators(generators, options = {}) {
    await this.env.lookup({ filterPaths: true, ...options, packagePatterns: generators });
    return this;
  }

  /**
   * @private
   * Load sharedOptions from jhipster and blueprints.
   *
   * @return {Promise<EnvironmentBuilder>} this for chaining.
   */
  async _loadSharedOptions() {
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
   *
   * @return {Record<string, import('./types.js').CliCommand>} blueprint commands.
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
   *
   * @return {Environment} the yeoman environment.
   */
  getEnvironment() {
    return this.env;
  }

  /**
   * @private
   * Load blueprints from argv.
   * At this point, commander has not parsed yet because we are building it.
   * @returns {Blueprint[]}
   */
  _getBlueprintsFromArgv() {
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
   * @private
   * Load blueprints from .yo-rc.json.
   * @returns {Blueprint[]}
   */
  _getBlueprintsFromYoRc() {
    return readCurrentPathYoRcFile()?.['generator-jhipster']?.blueprints ?? [];
  }

  /**
   * @private
   * Creates a 'blueprintName: blueprintVersion' object from argv and .yo-rc.json blueprints.
   */
  _getAllBlueprintsWithVersion() {
    return mergeBlueprints(this._getBlueprintsFromArgv(), this._getBlueprintsFromYoRc()).reduce((acc, blueprint) => {
      acc[blueprint.name] = blueprint.version;
      return acc;
    }, {});
  }

  /**
   * @private
   * Get packagePaths from current loaded blueprints.
   */
  async _getBlueprintPackagePaths() {
    const blueprints = this._blueprintsWithVersion;
    if (!blueprints || Object.keys(blueprints).length === 0) {
      return undefined;
    }

    const blueprintsToInstall = Object.entries(blueprints)
      .filter(([blueprint, _version]) => {
        const namespace = packageNameToNamespace(blueprint);
        if (!this.env.getPackagePath(namespace)) {
          this.env.lookupLocalPackages(blueprint);
        }
        return !this.env.getPackagePath(namespace);
      })
      .reduce((acc, [blueprint, version]) => {
        acc[blueprint] = version;
        return acc;
      }, {});

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
   *
   * @return {Record<string, import('./types.js').CliCommand>} commands.
   */
  async _getBlueprintCommands(blueprintPackagePaths) {
    if (!blueprintPackagePaths) {
      return undefined;
    }
    let result;
    for (const [blueprint, packagePath] of blueprintPackagePaths) {
      let blueprintCommand;
      const blueprintCommandFile = `${packagePath}/cli/commands`;
      const blueprintCommandExtension = ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'].find(extension =>
        existsSync(`${blueprintCommandFile}${extension}`),
      );
      if (blueprintCommandExtension) {
        const blueprintCommandsUrl = pathToFileURL(resolve(`${blueprintCommandFile}${blueprintCommandExtension}`));
        try {
          blueprintCommand = (await import(blueprintCommandsUrl)).default;
          const blueprintCommands = cloneDeep(blueprintCommand);
          Object.entries(blueprintCommands).forEach(([_command, commandSpec]) => {
            commandSpec.blueprint = commandSpec.blueprint || blueprint;
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
   *
   * @return {Object} sharedOptions.
   */
  async _getSharedOptions(blueprintPackagePaths) {
    function joiner(objValue, srcValue) {
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

    async function loadSharedOptionsFromFile(sharedOptionsBase, msg, errorMsg) {
      try {
        const baseExtension = ['.js', '.cjs', '.mjs'].find(extension => existsSync(resolve(`${sharedOptionsBase}${extension}`)));
        if (baseExtension) {
          const { default: opts } = await import(pathToFileURL(resolve(`${sharedOptionsBase}${baseExtension}`)));
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
