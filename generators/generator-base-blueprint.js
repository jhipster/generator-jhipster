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
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const packagejs = require('../package.json');
const { packageNameToNamespace } = require('./utils');
const BaseGenerator = require('./generator-base');
const { mergeBlueprints, parseBluePrints, loadBlueprintsFromConfiguration, normalizeBlueprintName } = require('../utils/blueprint');

/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @template ApplicationType
 * @extends {BaseGenerator}
 * @property {import('yeoman-generator/lib/util/storage')} blueprintStorage - Storage for blueprint config (Blueprints only).
 * @property {object} blueprintConfig - Proxy object for blueprintStorage (Blueprints only).
 * @property {import('yeoman-generator')} jhipsterContext - JHipster parent generator (Blueprints only).
 */
module.exports = class JHipsterBaseBlueprintGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    // Add base template folder.
    this.jhipsterTemplatesFolders = [this.templatePath()];

    this.fromBlueprint = this.rootGeneratorName() !== 'generator-jhipster';

    if (this.fromBlueprint) {
      this.blueprintStorage = this._getStorage({ sorted: true });
      this.blueprintConfig = this.blueprintStorage.createProxy();

      // jhipsterContext is the original generator
      this.jhipsterContext = this.options.jhipsterContext;

      try {
        // Fallback to the original generator if the file does not exists in the blueprint.
        this.jhipsterTemplatesFolders.push(this.jhipsterTemplatePath());
      } catch (error) {
        this.warning('Error adding current blueprint templates as alternative for JHipster templates.');
        this.log(error);
      }
    }
  }

  /**
   * Priority API stub for blueprints.
   *
   * Initializing priority is used to show logo and tasks related to preparing for prompts, like loading constants.
   */
  get initializing() {
    return this.asInitialingTaskGroup(this._initializing());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _initializing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asInitialingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Prompting priority is used to prompt users for configuration values.
   *
   * @returns {BasicTask}
   */
  get prompting() {
    return this.asPromptingTaskGroup(this._prompting());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _prompting() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asPromptingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring priority is used to customize and validate the configuration.
   */
  get configuring() {
    return this.asConfiguringTaskGroup(this._configuring());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _configuring() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asConfiguringTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Composing should be used to compose with others generators.
   */
  get composing() {
    return this.asComposingTaskGroup(this._composing());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _composing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asComposingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Loading should be used to load application configuration from jhipster configuration.
   * Before this priority the configuration should be considered dirty, while each generator configures itself at configuring priority, another generator composed at composing priority can still change it.
   */
  get loading() {
    return this.asLoadingTaskGroup(this._loading());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _loading() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asLoadingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   */
  get preparing() {
    return this.asPreparingTaskGroup(this._preparing());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _preparing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asPreparingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Public API method used by the getter and also by Blueprints
   */
  _preparingFields() {
    return {};
  }

  /**
   * Public API method used by the getter and also by Blueprints
   */
  _preparingRelationships() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   *
   * Default priority should used as misc customizations.
   */
  get default() {
    return this.asDefaultTaskGroup(this._default());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _default() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asDefaultTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Writing priority should used to write files.
   */
  get writing() {
    return this.asWritingTaskGroup(this._writing());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _writing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postWriting() {
    return this.asPostWritingTaskGroup(this._postWriting());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _postWriting() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asPostWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Install priority should used to prepare the project.
   */
  get install() {
    return this.asInstallTaskGroup(this._install());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _install() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postInstall() {
    return this.asPostInstallTaskGroup(this._postInstall());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _postInstall() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asPostInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * End priority should used to say good bye and print instructions.
   */
  get end() {
    return this.asEndTaskGroup(this._end());
  }

  /**
   * @deprecated
   * Public API method used by the getter and also by Blueprints
   */
  _end() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('../types/tasks').BasicTaskGroup<this>} taskGroup
   * @returns {import('../types/tasks').BasicTaskGroup<this>}
   */
  asEndTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * @private
   * Composes with blueprint generators, if any.
   * @param {String} subGen - sub generator
   * @param {Object} extraOptions - extra options to pass to blueprint generator
   */
  async composeWithBlueprints(subGen, extraOptions) {
    this.delegateToBlueprint = false;

    if (!this.configOptions.blueprintConfigured) {
      this.configOptions.blueprintConfigured = true;
      this._configureBlueprints();
    }

    let blueprints = this.jhipsterConfig.blueprints || [];
    if (this.options.localBlueprint) {
      blueprints = blueprints.concat({ name: '@jhipster/local' });
    }
    for (const blueprint of blueprints) {
      const blueprintGenerator = await this._composeBlueprint(blueprint.name, subGen, extraOptions);
      if (blueprintGenerator) {
        if (blueprintGenerator.sbsBlueprint) {
          // If sbsBlueprint, add templatePath to the original generator templatesFolder.
          this.jhipsterTemplatesFolders.unshift(blueprintGenerator.templatePath());
        } else {
          // If the blueprints does not sets sbsBlueprint property, ignore normal workflow.
          this.delegateToBlueprint = true;
        }
      }
    }
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

    if (blueprints.length > 0) {
      this.jhipsterConfig.blueprints = blueprints;
    }
    if (otherModules.length > 0) {
      this.jhipsterConfig.otherModules = otherModules;
    }

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
   * @param {any} [extraOptions] - options to pass to blueprint generator
   * @return {Generator|undefined}
   */
  async _composeBlueprint(blueprint, subGen, extraOptions = {}) {
    blueprint = normalizeBlueprintName(blueprint);
    if (!this.configOptions.skipChecks && !this.options.skipChecks) {
      this._checkBlueprint(blueprint);
    }

    const generatorName = packageNameToNamespace(blueprint);
    const generatorNamespace = `${generatorName}:${subGen}`;
    if (!this.env.isPackageRegistered(generatorName)) {
      await this.env.lookup({ filterPaths: true, packagePatterns: blueprint });
    }
    if (!(await this.env.get(generatorNamespace))) {
      this.debug(
        `No blueprint found for blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(
          generatorNamespace
        )} subgenerator: falling back to default generator`
      );
      return undefined;
    }
    this.debug(`Found blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(generatorNamespace)}`);

    const finalOptions = {
      ...this.options,
      configOptions: this.configOptions,
      ...extraOptions,
      jhipsterContext: this,
    };

    const blueprintGenerator = await this.composeWith(generatorNamespace, finalOptions, true);
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
    const packageJsonFile = path.join(blueprintPackagePath, 'package.json');
    if (!fs.existsSync(packageJsonFile)) {
      return undefined;
    }
    return JSON.parse(fs.readFileSync(packageJsonFile));
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
    this._findBlueprintPackageJson(blueprint);
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
      if (!semver.valid(blueprintJhipsterVersion) && !semver.validRange(blueprintJhipsterVersion)) {
        this.info(`Blueprint ${blueprintPkgName} contains generator-jhipster dependency with non comparable version`);
        return;
      }
      if (semver.satisfies(mainGeneratorJhipsterVersion, blueprintJhipsterVersion)) {
        return;
      }
      throw new Error(
        `The installed ${chalk.yellow(
          blueprintPkgName
        )} blueprint targets JHipster v${blueprintJhipsterVersion} and is not compatible with this JHipster version. Either update the blueprint or JHipster. You can also disable this check using --skip-checks at your own risk`
      );
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
