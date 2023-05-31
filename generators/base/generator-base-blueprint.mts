/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import type { ComposeOptions } from 'yeoman-generator';
import { packageJson } from '../../lib/index.mjs';
import { packageNameToNamespace } from './support/index.mjs';
import JHipsterBaseGenerator from './generator-base.mjs';
import { mergeBlueprints, parseBluePrints, loadBlueprintsFromConfiguration, normalizeBlueprintName } from './internal/index.mjs';
import { PRIORITY_NAMES } from './priorities.mjs';
import { BaseGeneratorDefinition, GenericTaskGroup } from './tasks.mjs';
import { JHipsterGeneratorFeatures, JHipsterGeneratorOptions } from './api.mjs';
import CoreGenerator from './generator-base.mjs';

/**
 * Base class that contains blueprints support.
 */
export default class JHipsterBaseBlueprintGenerator<
  Definition extends BaseGeneratorDefinition = BaseGeneratorDefinition
> extends JHipsterBaseGenerator {
  fromBlueprint!: boolean;
  sbsBlueprint?: boolean;
  delegateToBlueprint?: boolean;
  blueprintConfig?: Record<string, any>;
  jhipsterContext?: any;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    const { jhipsterContext, ...opts } = options ?? {};
    super(args, opts, features);

    if (this.options.help) {
      return;
    }

    this.sbsBlueprint = this.features.sbsBlueprint ?? false;
    this.fromBlueprint = this.rootGeneratorName() !== 'generator-jhipster';

    if (this.fromBlueprint) {
      this.blueprintStorage = this._getStorage();
      this.blueprintConfig = this.blueprintStorage.createProxy();

      // jhipsterContext is the original generator
      this.jhipsterContext = jhipsterContext;

      try {
        // Fallback to the original generator if the file does not exists in the blueprint.
        const blueprintedTemplatePath = this.jhipsterTemplatePath();
        if (!this.jhipsterTemplatesFolders.includes(blueprintedTemplatePath)) {
          this.jhipsterTemplatesFolders.push(blueprintedTemplatePath);
        }
      } catch (error) {
        this.log.warn('Error adding current blueprint templates as alternative for JHipster templates.');
        this.log.log(error);
      }
    }
  }

  /**
   * Filter generator's tasks in case the blueprint should be responsible on queueing those tasks.
   */
  delegateTasksToBlueprint<TaskGroupType>(tasksGetter: () => TaskGroupType): TaskGroupType {
    return this.delegateToBlueprint ? ({} as TaskGroupType) : tasksGetter();
  }

  /**
   * Priority API stub for blueprints.
   *
   * Initializing priority is used to show logo and tasks related to preparing for prompts, like loading constants.
   */
  get initializing(): GenericTaskGroup<this, Definition['initializingTaskParam']> {
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
   */
  asInitializingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['initializingTaskParam']>
  ): GenericTaskGroup<this, Definition['initializingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Prompting priority is used to prompt users for configuration values.
   */
  get prompting(): GenericTaskGroup<this, Definition['promptingTaskParam']> {
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
   */
  asPromptingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['promptingTaskParam']>
  ): GenericTaskGroup<this, Definition['promptingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring priority is used to customize and validate the configuration.
   */
  get configuring(): GenericTaskGroup<this, Definition['configuringTaskParam']> {
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
   */
  asConfiguringTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['configuringTaskParam']>
  ): GenericTaskGroup<this, Definition['configuringTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Composing should be used to compose with others generators.
   */
  get composing(): GenericTaskGroup<this, Definition['composingTaskParam']> {
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
   */
  asComposingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['composingTaskParam']>
  ): GenericTaskGroup<this, Definition['composingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Loading should be used to load application configuration from jhipster configuration.
   * Before this priority the configuration should be considered dirty, while each generator configures itself at configuring priority, another generator composed at composing priority can still change it.
   */
  get loading(): GenericTaskGroup<this, Definition['loadingTaskParam']> {
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
   */
  asLoadingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['loadingTaskParam']>
  ): GenericTaskGroup<this, Definition['loadingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   */
  get preparing(): GenericTaskGroup<this, Definition['preparingTaskParam']> {
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
   */
  asPreparingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['preparingTaskParam']>
  ): GenericTaskGroup<this, Definition['preparingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Default priority should used as misc customizations.
   */
  get default(): GenericTaskGroup<this, Definition['defaultTaskParam']> {
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
   */
  asDefaultTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['defaultTaskParam']>
  ): GenericTaskGroup<this, Definition['defaultTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Writing priority should used to write files.
   */
  get writing(): GenericTaskGroup<this, Definition['writingTaskParam']> {
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
   */
  asWritingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['writingTaskParam']>
  ): GenericTaskGroup<this, Definition['writingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postWriting(): GenericTaskGroup<this, Definition['postWritingTaskParam']> {
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
   */
  asPostWritingTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['postWritingTaskParam']>
  ): GenericTaskGroup<this, Definition['postWritingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Install priority should used to prepare the project.
   */
  get install(): GenericTaskGroup<this, Definition['installTaskParam']> {
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
   */
  asInstallTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['installTaskParam']>
  ): GenericTaskGroup<this, Definition['installTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postInstall(): GenericTaskGroup<this, Definition['postInstallTaskParam']> {
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
   */
  asPostInstallTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['postInstallTaskParam']>
  ): GenericTaskGroup<this, Definition['postInstallTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * End priority should used to say good bye and print instructions.
   */
  get end(): GenericTaskGroup<this, Definition['endTaskParam']> {
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
   */
  asEndTaskGroup(taskGroup: GenericTaskGroup<this, Definition['endTaskParam']>): GenericTaskGroup<this, Definition['endTaskParam']> {
    return taskGroup;
  }

  /**
   * @protected
   * Composes with blueprint generators, if any.
   */
  protected async composeWithBlueprints(subGen: string, options?: ComposeOptions) {
    this.delegateToBlueprint = false;

    if (!this.configOptions.blueprintConfigured) {
      this.configOptions.blueprintConfigured = true;
      this._configureBlueprints();
    }

    let blueprints = this.jhipsterConfig.blueprints || [];
    if (this.options.localBlueprint) {
      blueprints = blueprints.concat({ name: '@jhipster/local' });
    }
    const composedBlueprints: any[] = [];
    for (const blueprint of blueprints) {
      const blueprintGenerator = await this._composeBlueprint(blueprint.name, subGen, options);
      if (blueprintGenerator) {
        composedBlueprints.push(blueprintGenerator);
        if ((blueprintGenerator as any).sbsBlueprint) {
          // If sbsBlueprint, add templatePath to the original generator templatesFolder.
          this.jhipsterTemplatesFolders.unshift(blueprintGenerator.templatePath());
        } else {
          // If the blueprints does not sets sbsBlueprint property, ignore normal workflow.
          this.delegateToBlueprint = true;
          this.checkBlueprintImplementsPriorities(blueprintGenerator);
        }
      }
    }
    return composedBlueprints;
  }

  /**
   * Check if the blueprint implements every priority implemented by the parent generator
   * @param {BaseGenerator} blueprintGenerator
   */
  private checkBlueprintImplementsPriorities(blueprintGenerator) {
    const { taskPrefix: baseGeneratorTaskPrefix = '' } = this.features;
    const { taskPrefix: blueprintTaskPrefix = '' } = blueprintGenerator.features;
    // v8 remove deprecated priorities
    const DEPRECATED_PRIORITIES = ['preConflicts'];
    for (const priorityName of Object.values(PRIORITY_NAMES).filter(p => !DEPRECATED_PRIORITIES.includes(p))) {
      const baseGeneratorPriorityName = `${baseGeneratorTaskPrefix}${priorityName}`;
      if (baseGeneratorPriorityName in this) {
        const blueprintPriorityName = `${blueprintTaskPrefix}${priorityName}`;
        if (!Object.hasOwn(Object.getPrototypeOf(blueprintGenerator), blueprintPriorityName)) {
          this.log.debug(`Priority ${blueprintPriorityName} not implemented at ${blueprintGenerator.options.namespace}.`);
        }
      }
    }
  }

  /**
   * @private
   * Configure blueprints.
   */
  private _configureBlueprints() {
    let argvBlueprints = this.options.blueprints || '';
    // check for old single blueprint declaration
    const blueprint = this.options.blueprint;
    if (blueprint) {
      this.log.warn('--blueprint option is deprecated. Please use --blueprints instead');
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
      this.env.lookup({ filterPaths: true, packagePatterns: missingBlueprints } as any);
    }

    if (blueprints && blueprints.length > 0) {
      blueprints.forEach(blueprint => {
        blueprint.version = this._findBlueprintVersion(blueprint.name) || blueprint.version;
      });
      this.jhipsterConfig.blueprints = blueprints;
    }

    if (!this.skipChecks) {
      const namespaces = blueprints.map(blueprint => packageNameToNamespace(blueprint.name));
      // Verify if the blueprints hava been registered.
      const missing = namespaces.filter(namespace => !this.env.isPackageRegistered(namespace));
      if (missing && missing.length > 0) {
        throw new Error(`Some blueprints were not found ${missing}, you should install them manually`);
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
  private async _composeBlueprint<G extends CoreGenerator = CoreGenerator>(
    blueprint,
    subGen,
    extraOptions: ComposeOptions = {}
  ): Promise<G | undefined> {
    blueprint = normalizeBlueprintName(blueprint);
    if (!this.skipChecks) {
      this._checkBlueprint(blueprint);
    }

    const generatorName = packageNameToNamespace(blueprint);
    const generatorNamespace = `${generatorName}:${subGen}`;
    if (!this.env.isPackageRegistered(generatorName)) {
      await this.env.lookup({ filterPaths: true, packagePatterns: blueprint } as any);
    }
    if (!(await this.env.get(generatorNamespace))) {
      this.log.debug(
        `No blueprint found for blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(
          generatorNamespace
        )} subgenerator: falling back to default generator`
      );
      return undefined;
    }
    this.log.debug(
      `Found blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(generatorNamespace)}`
    );

    const finalOptions: ComposeOptions = {
      forwardOptions: true,
      ...extraOptions,
      generatorOptions: {
        jhipsterContext: this,
        ...extraOptions?.generatorOptions,
      } as any,
    };

    const blueprintGenerator = await this.composeWith<G>(generatorNamespace, finalOptions as any);
    if (blueprintGenerator instanceof Error) {
      throw blueprintGenerator;
    }
    (this as any)._debug(`Using blueprint ${chalk.yellow(blueprint)} for ${chalk.yellow(subGen)} subgenerator`);
    return blueprintGenerator;
  }

  /**
   * @private
   * Try to retrieve the package.json of the blueprint used, as an object.
   * @param {string} blueprintPkgName - generator name
   * @return {object} packageJson - retrieved package.json as an object or undefined if not found
   */
  private _findBlueprintPackageJson(blueprintPkgName) {
    const blueprintGeneratorName = packageNameToNamespace(blueprintPkgName);
    const blueprintPackagePath = this.env.getPackagePath(blueprintGeneratorName);
    if (!blueprintPackagePath) {
      this.log.warn(`Could not retrieve packagePath of blueprint '${blueprintPkgName}'`);
      return undefined;
    }
    const packageJsonFile = path.join(blueprintPackagePath, 'package.json');
    if (!fs.existsSync(packageJsonFile)) {
      return undefined;
    }
    return JSON.parse(fs.readFileSync(packageJsonFile).toString());
  }

  /**
   * @private
   * Try to retrieve the version of the blueprint used.
   * @param {string} blueprintPkgName - generator name
   * @return {string} version - retrieved version or empty string if not found
   */
  private _findBlueprintVersion(blueprintPkgName) {
    const blueprintPackageJson = this._findBlueprintPackageJson(blueprintPkgName);
    if (!blueprintPackageJson || !blueprintPackageJson.version) {
      this.log.warn(`Could not retrieve version of blueprint '${blueprintPkgName}'`);
      return undefined;
    }
    return blueprintPackageJson.version;
  }

  /**
   * @private
   * Check if the generator specified as blueprint is installed.
   * @param {string} blueprint - generator name
   */
  protected _checkBlueprint(blueprint) {
    if (blueprint === 'generator-jhipster') {
      throw new Error(`You cannot use ${chalk.yellow(blueprint)} as the blueprint.`);
    }
    this._findBlueprintPackageJson(blueprint);
  }

  /**
   * @private
   * Check if the generator specified as blueprint has a version compatible with current JHipster.
   * @param {string} blueprintPkgName - generator name
   */
  protected _checkJHipsterBlueprintVersion(blueprintPkgName) {
    const blueprintPackageJson = this._findBlueprintPackageJson(blueprintPkgName);
    if (!blueprintPackageJson) {
      this.log.warn(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
      return;
    }
    const mainGeneratorJhipsterVersion = packageJson.version;
    const blueprintJhipsterVersion = blueprintPackageJson.dependencies && blueprintPackageJson.dependencies['generator-jhipster'];
    if (blueprintJhipsterVersion) {
      if (!semver.valid(blueprintJhipsterVersion) && !semver.validRange(blueprintJhipsterVersion)) {
        this.log.verboseInfo(`Blueprint ${blueprintPkgName} contains generator-jhipster dependency with non comparable version`);
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
      throw new Error(
        `The installed ${chalk.yellow(
          blueprintPkgName
        )} blueprint targets JHipster ${blueprintPeerJhipsterVersion} and is not compatible with this JHipster version. Either update the blueprint or JHipster. You can also disable this check using --skip-checks at your own risk`
      );
    }
    this.log.warn(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
  }
}
