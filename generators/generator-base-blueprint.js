/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const packagejs = require('../package.json');
const { packageNameToNamespace } = require('./utils');
const BaseGenerator = require('./generator-base');
const { mergeBlueprints, parseBluePrints, loadBlueprintsFromConfiguration, normalizeBlueprintName } = require('../utils/blueprint');

/**
 * This is the base class for a generator that can be extended through a blueprint.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class JHipsterBaseBlueprintGenerator extends BaseGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (this.options.help) {
      return;
    }

    // Add base template folder.
    this.jhipsterTemplatesFolders = [this.templatePath()];

    this.fromBlueprint = this.rootGeneratorName() !== 'generator-jhipster';

    if (this.fromBlueprint) {
      this.blueprintStorage = this._getStorage();
      this.blueprintConfig = this.blueprintStorage.createProxy();

      // jhipsterContext is the original generator
      this.jhipsterContext = opts.jhipsterContext;

      if (this.jhipsterContext) {
        // Fallback to the original generator if the file does not exists in the blueprint.
        this.jhipsterTemplatesFolders.push(this.jhipsterContext.templatePath());
      }
    }
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _initializing() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _prompting() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _configuring() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _composing() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _loading() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _preparing() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _preparingFields() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _preparingRelationships() {
    return {};
  }

  /**
   * @private
   * Execute custom priorities if they are not declared
   * Should be used by jhipster official generators only.
   * @returns {Object} tasks
   */
  _missingPreDefault() {
    let tasks = {};
    if (this.sbsBlueprint) return tasks;
    if (this._isPriorityMissing('composing', 'default')) {
      tasks = { ...tasks, ...this._composing() };
    }
    if (this._isPriorityMissing('loading', 'default')) {
      tasks = { ...tasks, ...this._loading() };
    }
    if (this._isPriorityMissing('preparing', 'default')) {
      tasks = { ...tasks, ...this._preparing() };
    }
    if (this._isPriorityMissing('preparingFields', 'default')) {
      tasks = { ...tasks, ...this._preparingFields() };
    }
    if (this._isPriorityMissing('preparingRelationships', 'default')) {
      tasks = { ...tasks, ...this._preparingRelationships() };
    }
    return tasks;
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _default() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _writing() {
    return {};
  }

  /**
   * @private
   * Execute custom priorities if they are not declared
   * Should be used by jhipster official generators only.
   * @returns {Object} tasks
   */
  _missingPostWriting() {
    let tasks = {};
    if (this.sbsBlueprint) return tasks;
    if (this._isPriorityMissing('postWriting', 'writing')) {
      tasks = { ...tasks, ...this._postWriting() };
    }
    return tasks;
  }

  /**
   * Public API method used by the getter and also by Blueprints
   */
  _postWriting() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _install() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   * @returns {Object} tasks
   */
  _end() {
    return {};
  }

  /**
   * @private
   * Detect if a priority is implemented in the super class but missing in current one.
   * That indicates the blueprint was not updated with the custom priorities.
   * @param {string} priorityName - Priority to be checked.
   * @param {sring} destPriority - Priority that the task is related to for logging purpose.
   * @return {boolean} true if the priority is missing.
   */
  _isPriorityMissing(priorityName, destPriority = 'related') {
    const ownPrototype = Object.getPrototypeOf(this);
    if (
      !Object.getOwnPropertyDescriptor(ownPrototype, priorityName) &&
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(ownPrototype), priorityName)
    ) {
      this.warning(`Priority ${priorityName} is missing for generator ${this.options.namespace}. Merging into ${destPriority} priority.`);
      return true;
    }
    return false;
  }

  /**
   * @private
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

    if (!this.configOptions.blueprintConfigured) {
      this.configOptions.blueprintConfigured = true;
      this._configureBlueprints();
    }

    const blueprints = this.jhipsterConfig.blueprints;
    if (blueprints && blueprints.length > 0) {
      blueprints.forEach(blueprint => {
        const blueprintGenerator = this._composeBlueprint(blueprint.name, subGen, extraOptions);
        if (blueprintGenerator) {
          if (blueprintGenerator.sbsBlueprint) {
            // If sbsBlueprint, add templatePath to the original generator templatesFolder.
            this.jhipsterTemplatesFolders.unshift(blueprintGenerator.templatePath());
          } else {
            // If the blueprints does not sets sbsBlueprint property, ignore normal workflow.
            useBlueprints = true;
          }
        }
      });
    }
    return useBlueprints;
  }

  /**
   * @private
   * Configure blueprints.
   */
  _configureBlueprints() {
    let argvBlueprints = this.options.blueprints || '';
    // check for old single blueprint declaration
    const blueprint = this.options.blueprint;
    if (blueprint) {
      this.warning('--blueprint option is deprecated. Please use --blueprints instead');
      if (!argvBlueprints.split(',').includes(blueprint)) {
        argvBlueprints = `${blueprint},${argvBlueprints}`;
      }
    }
    const blueprints = mergeBlueprints(parseBluePrints(argvBlueprints), loadBlueprintsFromConfiguration(this.config));

    // EnvironmentBuilder already looks for blueprint when running from cli, this is required for tests.
    // Can be removed once the tests uses EnvironmentBuilder.
    const missingBlueprints = blueprints
      .filter(blueprint => !this.env.isPackageRegistered(packageNameToNamespace(blueprint.name)))
      .map(blueprint => blueprint.name);
    if (missingBlueprints.length > 0) {
      this.env.lookup({ filterPaths: true, packagePatterns: missingBlueprints });
    }

    // OtherModules is used to create package.json dependencies.
    let otherModules = this.jhipsterConfig.otherModules || [];
    if (blueprints && blueprints.length > 0) {
      blueprints.forEach(blueprint => {
        blueprint.version = this._findBlueprintVersion(blueprint.name) || blueprint.version;
      });

      // Remove potential previous value to avoid duplicates
      otherModules = otherModules.filter(module => blueprints.findIndex(blueprint => blueprint.name === module.name) === -1);
      otherModules.push(...blueprints);
    }

    this.jhipsterConfig.blueprints = blueprints;
    this.jhipsterConfig.otherModules = otherModules;

    if (!this.options.skipChecks) {
      const namespaces = blueprints.map(blueprint => packageNameToNamespace(blueprint.name));
      // Verify if the blueprints hava been registered.
      const missing = namespaces.filter(namespace => !this.env.isPackageRegistered(namespace));
      if (missing && missing.length > 0) {
        this.error(`Some blueprints were not found ${missing}, you should install them manually`);
      }
    }
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
    blueprint = normalizeBlueprintName(blueprint);
    if (!this.configOptions.skipChecks && !this.options.skipChecks) {
      this._checkBlueprint(blueprint);
    }

    const generatorName = packageNameToNamespace(blueprint);
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
    const blueprintGeneratorName = packageNameToNamespace(blueprintPkgName);
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
