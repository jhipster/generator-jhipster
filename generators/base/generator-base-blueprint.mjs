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
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

import { packageJson } from '../../lib/index.mjs';
import { packageNameToNamespace } from '../utils.mjs';
import JHipsterBaseGenerator from './generator-base.mjs';
import { mergeBlueprints, parseBluePrints, loadBlueprintsFromConfiguration, normalizeBlueprintName } from '../../utils/blueprint.mjs';
import { PRIORITY_NAMES } from './priorities.mjs';

/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @extends {JHipsterBaseGenerator}
 * @property {import('yeoman-generator/lib/util/storage')} blueprintStorage - Storage for blueprint config (Blueprints only).
 * @property {Record<string, any>} blueprintConfig - Proxy object for blueprintStorage (Blueprints only).
 * @property {import('yeoman-generator')} jhipsterContext - JHipster parent generator (Blueprints only).
 */
export default class JHipsterBaseBlueprintGenerator extends JHipsterBaseGenerator {
  /**
   * @param {string | string[]} args
   * @param {import('./base/api.mjs').JHipsterGeneratorOptions} options
   * @param {import('./base/api.mjs').JHipsterGeneratorFeatures} features
   */
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
   * @returns {import('./tasks.mjs').InitializingTaskGroup<this>}
   */
  get initializing() {
    return this.asInitializingTaskGroup(this._initializing());
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
   * @param {import('./tasks.mjs').InitializingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').InitializingTaskGroup<this>}
   */
  asInitializingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Prompting priority is used to prompt users for configuration values.
   *
   * @returns {import('./tasks.mjs').PromptingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').PromptingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').PromptingTaskGroup<this>}
   */
  asPromptingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring priority is used to customize and validate the configuration.
   * @returns {import('./tasks.mjs').ConfiguringTaskGroup<this>}
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
   * @param {import('./tasks.mjs').ConfiguringTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').ConfiguringTaskGroup<this>}
   */
  asConfiguringTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Composing should be used to compose with others generators.
   * @returns {import('./tasks.mjs').ComposingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').ComposingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').ComposingTaskGroup<this>}
   */
  asComposingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Loading should be used to load application configuration from jhipster configuration.
   * Before this priority the configuration should be considered dirty, while each generator configures itself at configuring priority, another generator composed at composing priority can still change it.
   *
   * @returns {import('./tasks.mjs').LoadingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').LoadingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').LoadingTaskGroup<this>}
   */
  asLoadingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   * @returns {import('./tasks.mjs').PreparingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').PreparingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').PreparingTaskGroup<this>}
   */
  asPreparingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Default priority should used as misc customizations.
   * @returns {import('./tasks.mjs').DefaultTaskGroup<this>}
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
   * @param {import('./tasks.mjs').DefaultTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').DefaultTaskGroup<this>}
   */
  asDefaultTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Writing priority should used to write files.
   *
   * @returns {import('./tasks.mjs').WritingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').WritingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').WritingTaskGroup<this>}
   */
  asWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   * @returns {import('./tasks.mjs').PostWritingTaskGroup<this>}
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
   * @param {import('./tasks.mjs').PostWritingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').PostWritingTaskGroup<this>}
   */
  asPostWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Install priority should used to prepare the project.
   * @returns {import('./tasks.mjs').InstallTaskGroup<this>}
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
   * @param {import('./tasks.mjs').InstallTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').InstallTaskGroup<this>}
   */
  asInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   * @returns {import('./tasks.mjs').PostInstallTaskGroup<this>}
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
   * @param {import('./tasks.mjs').PostInstallTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').PostInstallTaskGroup<this>}
   */
  asPostInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * End priority should used to say good bye and print instructions.
   *
   * @returns {import('./tasks.mjs').EndTaskGroup<this>}
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
   * @param {import('./tasks.mjs').EndTaskGroup<this>} taskGroup
   * @returns {import('./tasks.mjs').EndTaskGroup<this>}
   */
  asEndTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * @protected
   * Composes with blueprint generators, if any.
   * @param {String} subGen - sub generator
   * @param {Object} [extraOptions] - extra options to pass to blueprint generator
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
          this.checkBlueprintImplementsPriorities(blueprintGenerator);
        }
      }
    }
  }

  /**
   * Check if the blueprint implements every priority implemented by the parent generator
   * @param {BaseGenerator} blueprintGenerator
   */
  checkBlueprintImplementsPriorities(blueprintGenerator) {
    const { taskPrefix: baseGeneratorTaskPrefix = '' } = this.features;
    const { taskPrefix: blueprintTaskPrefix = '' } = blueprintGenerator.features;
    // v8 remove deprecated priorities
    const DEPRECATED_PRIORITIES = ['preConflicts'];
    for (const priorityName of Object.values(PRIORITY_NAMES).filter(p => !DEPRECATED_PRIORITIES.includes(p))) {
      const baseGeneratorPriorityName = `${baseGeneratorTaskPrefix}${priorityName}`;
      if (baseGeneratorPriorityName in this) {
        const blueprintPriorityName = `${blueprintTaskPrefix}${priorityName}`;
        if (!Object.hasOwn(Object.getPrototypeOf(blueprintGenerator), blueprintPriorityName)) {
          this.debug(`Priority ${blueprintPriorityName} not implemented at ${blueprintGenerator.options.namespace}.`);
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

    if (blueprints && blueprints.length > 0) {
      blueprints.forEach(blueprint => {
        blueprint.version = this._findBlueprintVersion(blueprint.name) || blueprint.version;
      });
      this.jhipsterConfig.blueprints = blueprints;
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
    this._debug(`Using blueprint ${chalk.yellow(blueprint)} for ${chalk.yellow(subGen)} subgenerator`);
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
    const mainGeneratorJhipsterVersion = packageJson.version;
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
}
