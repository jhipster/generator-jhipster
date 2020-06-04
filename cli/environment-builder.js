/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
const Environment = require('yeoman-environment');
const { CLI_NAME, logger } = require('./utils');
const { normalizeBlueprintName, packageNameToNamespace, loadYoRc, loadBlueprintsFromConfiguration } = require('../generators/utils');

module.exports = class EnvironmentBuilder {
    /**
     * Creates a new EnvironmentBuilder with a new Environment.
     *
     * @param {...any} args - Arguments passed to Environment.createEnv().
     * @return {EnvironmentBuilder} envBuilder
     */
    static create(...args) {
        const env = Environment.createEnv(...args);
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
        return EnvironmentBuilder.create(...args)
            ._lookupJHipster()
            ._loadBlueprints()
            ._lookupBlueprints()
            ._loadSharedOptions();
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

    /**
     * @private
     * Lookup current jhipster generators.
     *
     * @return {EnvironmentBuilder} this for chaining.
     */
    _lookupJHipster() {
        // Register jhipster generators.
        this.env.lookup({ packagePaths: [path.join(__dirname, '..')] }).forEach(generator => {
            // Verify jhipster generators namespace.
            assert(
                generator.namespace.startsWith(`${CLI_NAME}:`),
                `Error on the registered namespace ${generator.namespace}, make sure your folder is called generator-jhipster.`
            );
        });
        return this;
    }

    /**
     * @private
     * Load blueprints from argv, .yo-rc.json.
     *
     * @return {EnvironmentBuilder} this for chaining.
     */
    _loadBlueprints() {
        this._blueprintsWithVersion = this._getAllBlueprintsWithVersion();
        return this;
    }

    /**
     * @private
     * Lookup current loaded blueprints.
     *
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
     * @private
     * Load sharedOptions from jhipster and blueprints.
     *
     * @return {EnvironmentBuilder} this for chaining.
     */
    _loadSharedOptions() {
        const blueprintsPackagePath = this._getBlueprintPackagePaths();
        const sharedOptions = this._getSharedOptions(blueprintsPackagePath) || {};
        // Env will forward sharedOptions to every generator
        Object.assign(this.env.sharedOptions, sharedOptions);
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
        return blueprintNames.filter((v, i, a) => a.indexOf(v) === i).map(v => normalizeBlueprintName(v));
    }

    /**
     * @private
     * Load blueprints from .yo-rc.json.
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
        const blueprintsWithVersion = this._getBlueprintsFromArgv().reduce((acc, blueprint) => {
            acc[blueprint] = undefined;
            return acc;
        }, {});

        this._getBlueprintsFromYoRc().reduce((acc, blueprint) => {
            acc[blueprint.name] = blueprint.version;
            return acc;
        }, blueprintsWithVersion);
        return blueprintsWithVersion;
    }

    /**
     * @private
     * Get packagePaths from current loaded blueprints.
     */
    _getBlueprintPackagePaths() {
        const blueprints = this._blueprintsWithVersion;
        if (!blueprints) {
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
                const blueprintCommands = require(`${packagePath}/cli/commands`);
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
