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
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const BaseGenerator = require('./generator-base');

/**
 * This is the base class for a generator that can be extended through a blueprint.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.fromBlueprint = this.rootGeneratorName() !== 'generator-jhipster';

        if (this.fromBlueprint) {
            this.blueprintConfig = this.config;
            this.config = this._getStorage('generator-jhipster');
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _end() {
        return {};
    }

    /**
     * Instantiates the blueprint generators, if any.
     * @param {string} subGen - sub generator
     * @param {any} extraOptions - extra options to pass to blueprint generator
     * @return {true} useBlueprints - true if one or more blueprints generators have been constructed; false otherwise
     */
    instantiateBlueprints(subGen, extraOptions) {
        if (this.options.help) {
            // Ignore blueprint registered options.
            return false;
        }
        let useBlueprints = false;

        // Load and verify blueprints, should be executed only once
        if (!this.configOptions.blueprintConfigured) {
            this.configOptions.blueprintConfigured = true;
            let argvBlueprints = this.options.blueprints || '';
            // check for old single blueprint declaration
            const blueprint = this.options.blueprint;
            if (blueprint) {
                this.warning('--blueprint option is deprecated. Please use --blueprints instead');
                if (!argvBlueprints.split(',').includes(blueprint)) {
                    argvBlueprints = `${blueprint},${argvBlueprints}`;
                }
            }
            const blueprints = jhipsterUtils.mergeBlueprints(
                jhipsterUtils.parseBluePrints(argvBlueprints),
                jhipsterUtils.loadBlueprintsFromConfiguration(this.config)
            );
            // Run a lookup to find blueprints.
            const packagePatterns = blueprints
                .filter(blueprint => !this.env.isPackageRegistered(jhipsterUtils.packageNameToNamespace(blueprint.name)))
                .map(blueprint => blueprint.name);
            this.env.lookup({ filterPaths: true, packagePatterns });

            let otherModules = this.jhipsterConfig.otherModules || [];
            if (blueprints && blueprints.length > 0) {
                blueprints.forEach(blueprint => {
                    blueprint.version = this._findBlueprintVersion(blueprint.name) || blueprint.version;
                });

                // Remove potential previous value to avoid duplicates
                otherModules = otherModules.filter(module => this.blueprints.findIndex(blueprint => blueprint.name === module.name) === -1);
                otherModules.push(...blueprints);
            }

            this.jhipsterConfig.blueprints = blueprints;
            this.jhipsterConfig.otherModules = otherModules;

            if (!this.options.skipChecks) {
                const namespaces = blueprints.map(blueprint => jhipsterUtils.packageNameToNamespace(blueprint.name));
                // Verify if the blueprints hava been registered.
                const missing = namespaces.filter(namespace => !this.env.isPackageRegistered(namespace));
                if (missing && missing.length > 0) {
                    this.error(`Some blueprints were not found ${missing}, you should install them manually`);
                }
            }
        }

        const blueprints = this.jhipsterConfig.blueprints;
        if (blueprints && blueprints.length > 0) {
            blueprints.forEach(blueprint => {
                const blueprintGenerator = this._composeBlueprint(blueprint.name, subGen, extraOptions);
                // If the blueprints sets sbsBlueprint property, then don't ignore the normal workflow.
                if (blueprintGenerator && !blueprintGenerator.sbsBlueprint) {
                    useBlueprints = true;
                }
            });
        }
        return useBlueprints;
    }

    /**
     * @private
     * Compose external blueprint module
     * @param {string} blueprint - name of the blueprint
     * @param {string} subGen - sub generator
     * @param {any} options - options to pass to blueprint generator
     * @return {Generator|undefined}
     */
    _composeBlueprint(blueprint, subGen, extraOptions = {}) {
        blueprint = jhipsterUtils.normalizeBlueprintName(blueprint);
        if (!this.configOptions.skipChecks && !this.options.skipChecks) {
            this._checkBlueprint(blueprint);
        }

        const generatorName = jhipsterUtils.packageNameToNamespace(blueprint);
        const generatorNamespace = `${generatorName}:${subGen}`;
        if (!this.env.isPackageRegistered(generatorName)) {
            this.env.lookup({ filterPaths: true, packagePatterns: blueprint });
        }
        if (!this.env.get(generatorNamespace)) {
            this.debug(
                `No blueprint found for blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(
                    subGen
                )} subgenerator: falling back to default generator`
            );
            return undefined;
        }

        const finalOptions = {
            ...this.options,
            configOptions: this.configOptions,
            ...extraOptions,
            jhipsterContext: this,
        };

        const blueprintGenerator = this.composeWith(generatorNamespace, finalOptions, true);
        if (blueprintGenerator instanceof Error) {
            throw blueprintGenerator;
        }
        this.info(`Using blueprint ${chalk.yellow(blueprint)} for ${chalk.yellow(subGen)} subgenerator`);
        return blueprintGenerator;
    }

    /**
     * @private
     * Try to retrieve the package.json of the blueprint used, as an object.
     * @param {string} blueprintPkgName - generator name
     * @return {object} packageJson - retrieved package.json as an object or undefined if not found
     */
    _findBlueprintPackageJson(blueprintPkgName) {
        const blueprintGeneratorName = jhipsterUtils.packageNameToNamespace(blueprintPkgName);
        const blueprintPackagePath = this.env.getPackagePath(blueprintGeneratorName);
        if (!blueprintPackagePath) {
            this.warning(`Could not retrieve packagePath of blueprint '${blueprintPkgName}'`);
            return undefined;
        }
        return JSON.parse(fs.readFileSync(path.join(blueprintPackagePath, 'package.json')));
    }

    /**
     * @private
     * Try to retrieve the version of the blueprint used.
     * @param {string} blueprintPkgName - generator name
     * @return {string} version - retrieved version or empty string if not found
     */
    _findBlueprintVersion(blueprintPkgName) {
        const blueprintPackageJson = this._findBlueprintPackageJson(blueprintPkgName);
        if (!blueprintPackageJson || !blueprintPackageJson.version) {
            this.warning(`Could not retrieve version of blueprint '${blueprintPkgName}'`);
            return undefined;
        }
        return blueprintPackageJson.version;
    }

    /**
     * @private
     * Check if the generator specified as blueprint is installed.
     * @param {string} blueprint - generator name
     */
    _checkBlueprint(blueprint) {
        if (blueprint === 'generator-jhipster') {
            this.error(`You cannot use ${chalk.yellow(blueprint)} as the blueprint.`);
        }
        if (!this._findBlueprintPackageJson(blueprint)) {
            this.error(
                `The ${chalk.yellow(blueprint)} blueprint provided is not installed. Please install it using command ${chalk.yellow(
                    `npm i -g ${blueprint}`
                )}.`
            );
        }
    }

    /**
     * @private
     * Check if the generator specified as blueprint has a version compatible with current JHipster.
     * @param {string} blueprintPkgName - generator name
     */
    _checkJHipsterBlueprintVersion(blueprintPkgName) {
        const blueprintPackageJson = this._findBlueprintPackageJson(blueprintPkgName);
        if (!blueprintPackageJson) {
            this.warning(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
            return;
        }
        const mainGeneratorJhipsterVersion = packagejs.version;
        const blueprintJhipsterVersion = blueprintPackageJson.dependencies && blueprintPackageJson.dependencies['generator-jhipster'];
        if (blueprintJhipsterVersion) {
            if (mainGeneratorJhipsterVersion !== blueprintJhipsterVersion) {
                this.error(
                    `The installed ${chalk.yellow(
                        blueprintPkgName
                    )} blueprint targets JHipster v${blueprintJhipsterVersion} and is not compatible with this JHipster version. Either update the blueprint or JHipster. You can also disable this check using --skip-checks at your own risk`
                );
            }
            return;
        }
        const blueprintPeerJhipsterVersion =
            blueprintPackageJson.peerDependencies && blueprintPackageJson.peerDependencies['generator-jhipster'];
        if (blueprintPeerJhipsterVersion) {
            if (semver.satisfies(mainGeneratorJhipsterVersion, blueprintPeerJhipsterVersion)) {
                return;
            }
            this.error(
                `The installed ${chalk.yellow(
                    blueprintPkgName
                )} blueprint targets JHipster ${blueprintPeerJhipsterVersion} and is not compatible with this JHipster version. Either update the blueprint or JHipster. You can also disable this check using --skip-checks at your own risk`
            );
        }
        this.warning(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
    }
};
