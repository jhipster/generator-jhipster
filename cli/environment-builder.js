/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const assert = require('assert');
const chalk = require('chalk');
const _ = require('lodash');
const path = require('path');
const { existsSync } = require('fs');
const Environment = require('yeoman-environment');
const { CLI_NAME, logger } = require('./utils');
const { loadYoRc, packageNameToNamespace } = require('../generators/utils');
const { parseBlueprintInfo, loadBlueprintsFromConfiguration, mergeBlueprints } = require('../utils/blueprint');

const createEnvironment = (args, options = {}, adapter) => {
  // Remove after migration to environment 3.
  const configOptions = { sharedEntities: {} };
  const sharedOptions = {
    fromCli: true,
    localConfigOnly: true,
    ...options.sharedOptions,
    configOptions,
  };
  return Environment.createEnv(args, { newErrorHandler: true, ...options, sharedOptions }, adapter);
};

module.exports = class EnvironmentBuilder {
  /**
   * Creates a new EnvironmentBuilder with a new Environment.
   *
   * @param {any} args - Arguments passed to Environment.createEnv().
   * @param {Object} [options] - options passed to Environment.createEnv().
   * @param [adapter] - adapter passed to Environment.createEnv().
   * @return {EnvironmentBuilder} envBuilder
   */
  static create(args, options = {}, adapter) {
    const env = createEnvironment(args, options, adapter);
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
   * @return {EnvironmentBuilder} envBuilder
   */
  static createEnv(...args) {
    return EnvironmentBuilder.createDefaultBuilder(...args).getEnvironment();
  }

  /**
   * Creates a new EnvironmentBuilder with a new Environment and load jhipster, blueprints and sharedOptions.
   *
   * @param {...any} args - Arguments passed to Environment.createEnv().
   * @return {EnvironmentBuilder} envBuilder
   */
  static createDefaultBuilder(...args) {
    return EnvironmentBuilder.create(...args).prepare();
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

  prepare({ blueprints, lookups } = {}) {
    this._lookupJHipster()._lookupLocalBlueprint()._loadBlueprints(blueprints)._lookups(lookups)._lookupBlueprints()._loadSharedOptions();
    return this;
  }

  getBlueprintsNamespaces() {
    return Object.keys(this._blueprintsWithVersion).map(packageName => packageNameToNamespace(packageName));
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
  _lookupJHipster() {
    // Register jhipster generators.
    this.env.lookup({ packagePaths: [path.join(__dirname, '..')], lookups: ['generators'] }).forEach(generator => {
      // Verify jhipster generators namespace.
      assert(
        generator.namespace.startsWith(`${CLI_NAME}:`),
        `Error on the registered namespace ${generator.namespace}, make sure your folder is called generator-jhipster.`
      );
    });
    return this;
  }

  _lookupLocalBlueprint() {
    const localBlueprintPath = path.join(process.cwd(), '.blueprint');
    if (existsSync(localBlueprintPath)) {
      // Register jhipster generators.
      const generators = this.env.lookup({ packagePaths: [localBlueprintPath], lookups: ['.'] });
      if (generators.length > 0) {
        this.env.alias(/^@jhipster\/jhipster-local(:(.*))?$/, '.blueprint$1');
        this.env.sharedOptions.localBlueprint = true;
      }
    }
    return this;
  }

  _lookups(lookups = []) {
    lookups = [].concat(lookups);
    lookups.forEach(lookup => {
      this.env.lookup(lookup);
    });
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
  _lookupBlueprints(options) {
    const allBlueprints = Object.keys(this._blueprintsWithVersion);
    if (allBlueprints && allBlueprints.length > 0) {
      // Lookup for blueprints.
      this.env.lookup({ ...options, filterPaths: true, packagePatterns: allBlueprints });
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
  lookupGenerators(generators, options = {}) {
    this.env.lookup({ filterPaths: true, ...options, packagePatterns: generators });
    return this;
  }

  /**
   * @private
   * Load sharedOptions from jhipster and blueprints.
   *
   * @return {EnvironmentBuilder} this for chaining.
   */
  _loadSharedOptions() {
    const blueprintsPackagePath = this._getBlueprintPackagePaths();
    if (blueprintsPackagePath) {
      const sharedOptions = this._getSharedOptions(blueprintsPackagePath) || {};
      // Env will forward sharedOptions to every generator
      Object.assign(this.env.sharedOptions, sharedOptions);
    }
    return this;
  }

  /**
   * Get blueprints commands.
   *
   * @return {Object[]} blueprint commands.
   */
  getBlueprintCommands() {
    const blueprintsPackagePath = this._getBlueprintPackagePaths();
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
    const yoRc = loadYoRc();
    if (!yoRc || !yoRc['generator-jhipster']) {
      return [];
    }
    return loadBlueprintsFromConfiguration(yoRc['generator-jhipster']);
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
  _getBlueprintPackagePaths() {
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
      this.env.installLocalGenerators(blueprintsToInstall);
    }

    return Object.entries(blueprints).map(([blueprint, _version]) => {
      const namespace = packageNameToNamespace(blueprint);
      const packagePath = this.env.getPackagePath(namespace);
      if (!packagePath) {
        logger.fatal(
          `The ${chalk.yellow(blueprint)} blueprint provided is not installed. Please install it using command ${chalk.yellow(
            `npm i -g ${blueprint}`
          )}`
        );
      }
      return [blueprint, packagePath];
    });
  }

  /**
   * @private
   * Get blueprints commands.
   *
   * @return {Object[]} commands.
   */
  _getBlueprintCommands(blueprintPackagePaths) {
    if (!blueprintPackagePaths) {
      return undefined;
    }
    let result;
    blueprintPackagePaths.forEach(([blueprint, packagePath]) => {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
      try {
        let blueprintCommand;
        try {
          blueprintCommand = require(`${packagePath}/cli/commands`);
        } catch (e) {
          blueprintCommand = require(`${packagePath}/cli/commands.cjs`);
        }
        const blueprintCommands = _.cloneDeep(blueprintCommand);
        Object.entries(blueprintCommands).forEach(([_command, commandSpec]) => {
          commandSpec.blueprint = commandSpec.blueprint || blueprint;
        });
        result = { ...result, ...blueprintCommands };
      } catch (e) {
        const msg = `No custom commands found within blueprint: ${blueprint} at ${packagePath}`;
        /* eslint-disable no-console */
        console.info(`${chalk.green.bold('INFO!')} ${msg}`);
      }
    });
    return result;
  }

  /**
   * @private
   * Get blueprints sharedOptions.
   *
   * @return {Object} sharedOptions.
   */
  _getSharedOptions(blueprintPackagePaths) {
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

    function loadSharedOptionsFromFile(sharedOptionsFile, msg, errorMsg) {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
      try {
        const opts = require(sharedOptionsFile);
        /* eslint-disable no-console */
        if (msg) {
          console.info(`${chalk.green.bold('INFO!')} ${msg}`);
        }
        return opts;
      } catch (e) {
        if (errorMsg) {
          console.info(`${chalk.green.bold('INFO!')} ${errorMsg}`);
        }
      }
      return {};
    }

    const localPath = './.jhipster/sharedOptions';
    let result = loadSharedOptionsFromFile(path.resolve(localPath), `SharedOptions found at local config ${localPath}`);

    if (!blueprintPackagePaths) {
      return undefined;
    }

    blueprintPackagePaths.forEach(([blueprint, packagePath]) => {
      const errorMsg = `No custom sharedOptions found within blueprint: ${blueprint} at ${packagePath}`;
      const opts = loadSharedOptionsFromFile(`${packagePath}/cli/sharedOptions`, undefined, errorMsg);
      result = _.mergeWith(result, opts, joiner);
    });
    return result;
  }
};
