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
import fs, { existsSync, readFileSync, statSync } from 'fs';
import path, { join, relative } from 'path';
import { rm } from 'fs/promises';
import chalk from 'chalk';
import semver, { lt as semverLessThan } from 'semver';

import type { ComposeOptions } from 'yeoman-generator';
import { union } from 'lodash-es';
import { execaCommandSync } from 'execa';
import { packageJson } from '../../lib/index.js';
import CoreGenerator from '../base-core/index.js';
import type { TaskTypes as BaseTaskTypes, GenericTaskGroup } from '../../lib/types/base/tasks.js';
import type { Config } from '../base-core/types.js';
import { CONTEXT_DATA_EXISTING_PROJECT } from '../base-application/support/constants.js';
import { GENERATOR_JHIPSTER } from '../generator-constants.js';
import { formatDateForChangelog, packageNameToNamespace } from './support/index.js';
import { loadBlueprintsFromConfiguration, mergeBlueprints, normalizeBlueprintName, parseBluePrints } from './internal/index.js';
import { PRIORITY_NAMES } from './priorities.js';
import type { JHipsterGeneratorFeatures, JHipsterGeneratorOptions } from './api.js';
import {
  CONTEXT_DATA_BLUEPRINT_CONFIGURED,
  CONTEXT_DATA_REPRODUCIBLE_TIMESTAMP,
  LOCAL_BLUEPRINT_PACKAGE_NAMESPACE,
} from './support/constants.js';
import type { CleanupArgumentType, Control } from './types.js';

const { WRITING } = PRIORITY_NAMES;

/**
 * Base class that contains blueprints support.
 * Provides built-in state support with control object.
 */
export default class JHipsterBaseBlueprintGenerator<
  ConfigType = unknown,
  TaskTypes extends BaseTaskTypes = BaseTaskTypes,
  Options = unknown,
  Features = unknown,
> extends CoreGenerator<ConfigType & Config, Options, Features> {
  fromBlueprint!: boolean;
  sbsBlueprint?: boolean;
  delegateToBlueprint?: boolean;
  blueprintConfig?: Record<string, any>;
  jhipsterContext?: any;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    const { jhipsterContext, ...opts } = options ?? {};
    super(args, opts, { blueprintSupport: true, ...features });

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

      if (this.getFeatures().checkBlueprint) {
        if (!this.jhipsterContext) {
          throw new Error(
            `This is a JHipster blueprint and should be used only like ${chalk.yellow(
              `jhipster --blueprints ${this.options.namespace.split(':')[0]}`,
            )}`,
          );
        }
      }

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

    this.on('before:queueOwnTasks', () => {
      const { storeBlueprintVersion, storeJHipsterVersion, queueCommandTasks = true } = this.getFeatures();
      if (this.fromBlueprint) {
        if (storeBlueprintVersion && !this.options.reproducibleTests) {
          try {
            const blueprintPackageJson = JSON.parse(readFileSync(this._meta!.packagePath!, 'utf8'));
            this.blueprintConfig!.blueprintVersion = blueprintPackageJson.version;
          } catch {
            this.log(`Could not retrieve version of blueprint '${this.options.namespace}'`);
          }
        }
      }
      if (!this.fromBlueprint && !this.delegateToBlueprint) {
        if (storeJHipsterVersion && !this.options.reproducibleTests) {
          this.jhipsterConfig.jhipsterVersion = packageJson.version;
        }
      }
      if (this.fromBlueprint || !this.delegateToBlueprint) {
        if (queueCommandTasks) {
          this._queueCurrentJHipsterCommandTasks();
        }
      }
    });
  }

  /**
   * Filter generator's tasks in case the blueprint should be responsible on queueing those tasks.
   */
  delegateTasksToBlueprint<TaskGroupType>(tasksGetter: () => TaskGroupType): TaskGroupType {
    return this.delegateToBlueprint ? ({} as TaskGroupType) : tasksGetter();
  }

  /**
   * Configure blueprints once per application.
   */
  get #blueprintConfigured() {
    return this.getContextData(CONTEXT_DATA_BLUEPRINT_CONFIGURED, { override: true });
  }

  get #control(): Control {
    const generator = this;
    return this.getContextData<Control>('jhipster:control', {
      factory: () => {
        let jhipsterOldVersion: string | null;
        let enviromentHasDockerCompose: undefined | boolean;
        const customizeRemoveFiles: ((file: string) => string | undefined)[] = [];
        return {
          get existingProject(): boolean {
            try {
              return generator.getContextData<boolean>(CONTEXT_DATA_EXISTING_PROJECT);
            } catch {
              return false;
            }
          },
          get jhipsterOldVersion(): string | null {
            if (jhipsterOldVersion === undefined) {
              jhipsterOldVersion = existsSync(generator.config.path)
                ? (JSON.parse(readFileSync(generator.config.path, 'utf-8').toString())[GENERATOR_JHIPSTER]?.jhipsterVersion ?? null)
                : null;
            }
            return jhipsterOldVersion;
          },
          get enviromentHasDockerCompose(): boolean {
            if (enviromentHasDockerCompose === undefined) {
              const { exitCode } = execaCommandSync('docker compose version', { reject: false, stdio: 'pipe' });
              enviromentHasDockerCompose = exitCode === 0;
            }
            return enviromentHasDockerCompose;
          },
          customizeRemoveFiles,
          isJhipsterVersionLessThan(version: string): boolean {
            const jhipsterOldVersion = this.jhipsterOldVersion;
            return jhipsterOldVersion ? semverLessThan(jhipsterOldVersion, version) : false;
          },
          async removeFiles(assertions: { oldVersion?: string; removedInVersion?: string } | string, ...files: string[]) {
            const versions = typeof assertions === 'string' ? { removedInVersion: undefined, oldVersion: undefined } : assertions;
            if (typeof assertions === 'string') {
              files = [assertions, ...files];
            }

            for (const customize of this.customizeRemoveFiles) {
              files = files.map(customize).filter(file => file) as string[];
            }

            const { removedInVersion, oldVersion = this.jhipsterOldVersion } = versions;
            if (removedInVersion && oldVersion && !semverLessThan(oldVersion, removedInVersion)) {
              return;
            }

            const absolutePaths = files.map(file => generator.destinationPath(file));
            // Delete from memory fs to keep updated.
            generator.fs.delete(absolutePaths);
            await Promise.all(
              absolutePaths.map(async file => {
                const relativePath = relative(generator.env.logCwd, file);
                try {
                  if (statSync(file).isFile()) {
                    generator.log.info(`Removing legacy file ${relativePath}`);
                    await rm(file, { force: true });
                  }
                } catch {
                  generator.log.info(`Could not remove legacy file ${relativePath}`);
                }
              }),
            );
          },
          async cleanupFiles(oldVersionOrCleanup: string | CleanupArgumentType, cleanup?: CleanupArgumentType) {
            if (!jhipsterOldVersion) return;
            let oldVersion: string;
            if (typeof oldVersionOrCleanup === 'string') {
              oldVersion = oldVersionOrCleanup;
              assert(cleanup, 'cleanupFiles requires cleanup object');
            } else {
              cleanup = oldVersionOrCleanup;
              oldVersion = jhipsterOldVersion;
            }
            await Promise.all(
              Object.entries(cleanup).map(async ([version, files]) => {
                const stringFiles: string[] = [];
                for (const file of files) {
                  if (Array.isArray(file)) {
                    const [condition, ...fileParts] = file;
                    if (condition) {
                      stringFiles.push(join(...fileParts));
                    }
                  } else {
                    stringFiles.push(file);
                  }
                }
                await this.removeFiles({ oldVersion, removedInVersion: version }, ...stringFiles);
              }),
            );
          },
        };
      },
    });
  }

  /**
   * Generate a timestrap to be used by Liquibase changelogs.
   */
  nextTimestamp(): string {
    const reproducible = Boolean(this.options.reproducible);
    // Use started counter or use stored creationTimestamp if creationTimestamp option is passed
    const creationTimestamp = this.options.creationTimestamp ? this.config.get('creationTimestamp') : undefined;
    let now = new Date();
    // Miliseconds is ignored for changelogDate.
    now.setMilliseconds(0);
    // Run reproducible timestamp when regenerating the project with reproducible option or an specific timestamp.
    if (reproducible || creationTimestamp) {
      now = this.getContextData(CONTEXT_DATA_REPRODUCIBLE_TIMESTAMP, {
        factory: () => {
          const newCreationTimestamp: string = (creationTimestamp as string) ?? this.config.get('creationTimestamp');
          const newDate = newCreationTimestamp ? new Date(newCreationTimestamp) : now;
          newDate.setMilliseconds(0);
          return newDate;
        },
      });
      now.setMinutes(now.getMinutes() + 1);
      this.getContextData(CONTEXT_DATA_REPRODUCIBLE_TIMESTAMP, { override: now });

      // Reproducible build can create future timestamp, save it.
      const lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (!lastLiquibaseTimestamp || now.getTime() > lastLiquibaseTimestamp) {
        this.config.set('lastLiquibaseTimestamp', now.getTime());
      }
    } else {
      // Get and store lastLiquibaseTimestamp, a future timestamp can be used
      const lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (lastLiquibaseTimestamp) {
        const lastTimestampDate = new Date(lastLiquibaseTimestamp);
        if (lastTimestampDate >= now) {
          now = lastTimestampDate;
          now.setSeconds(now.getSeconds() + 1);
          now.setMilliseconds(0);
        }
      }
      this.jhipsterConfig.lastLiquibaseTimestamp = now.getTime();
    }
    return formatDateForChangelog(now);
  }

  /**
   * Get arguments for the priority
   */
  override getArgsForPriority(priorityName: string) {
    const [fistArg] = super.getArgsForPriority(priorityName);
    const control = this.#control;
    if (priorityName === WRITING) {
      if (existsSync(this.config.path)) {
        try {
          const oldConfig = JSON.parse(readFileSync(this.config.path).toString())[GENERATOR_JHIPSTER];
          const newConfig: any = this.config.getAll();
          const keys = [...new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])];
          const configChanges = Object.fromEntries(
            keys
              .filter(key =>
                Array.isArray(newConfig[key])
                  ? newConfig[key].length === oldConfig[key].length &&
                    newConfig[key].find((element, index) => element !== oldConfig[key][index])
                  : newConfig[key] !== oldConfig[key],
              )
              .map(key => [key, { newValue: newConfig[key], oldValue: oldConfig[key] }]),
          );
          return [{ ...fistArg, control, configChanges }];
        } catch {
          // Fail to parse
        }
      }
    }
    return [{ ...fistArg, control }];
  }

  /**
   * Check if the generator should ask for prompts.
   */
  override shouldAskForPrompts({ control }: { control: Control }): boolean {
    if (!control) throw new Error(`Control object not found in ${this.options.namespace}`);
    return !control.existingProject || this.options.askAnswered === true;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asAnyTaskGroup<const K extends string>(taskGroup: GenericTaskGroup<this, any, K>): GenericTaskGroup<any, any, K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Initializing priority is used to show logo and tasks related to preparing for prompts, like loading constants.
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
   */
  asInitializingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['InitializingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['InitializingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Prompting priority is used to prompt users for configuration values.
   */
  get prompting() {
    return this._prompting();
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
  asPromptingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PromptingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PromptingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring priority is used to customize and validate the configuration.
   */
  get configuring() {
    return this._configuring();
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
  asConfiguringTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['ConfiguringTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['ConfiguringTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Composing should be used to compose with others generators.
   */
  get composing() {
    return this._composing();
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
  asComposingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['ComposingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['ComposingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * ComposingComponent priority should be used to handle component configuration order.
   */
  get composingComponent(): any {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asComposingComponentTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['ComposingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['ComposingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Loading should be used to load application configuration from jhipster configuration.
   * Before this priority the configuration should be considered dirty, while each generator configures itself at configuring priority, another generator composed at composing priority can still change it.
   */
  get loading(): any {
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
  asLoadingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['LoadingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['LoadingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   */
  get preparing() {
    return this._preparing();
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
  asPreparingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PreparingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PreparingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   */
  get postPreparing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostPreparingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PostPreparingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PostPreparingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Default priority should used as misc customizations.
   */
  get default() {
    return this._default();
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
  asDefaultTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['DefaultTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['DefaultTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Writing priority should used to write files.
   */
  get writing() {
    return this._writing();
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
  asWritingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['WritingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['WritingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postWriting() {
    return this._postWriting();
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
  asPostWritingTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PostWritingTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PostWritingTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Install priority should used to prepare the project.
   */
  get install() {
    return this._install();
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
  asInstallTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['InstallTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['InstallTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postInstall() {
    return this._postInstall();
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
  asPostInstallTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PostInstallTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PostInstallTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * End priority should used to say good bye and print instructions.
   */
  get end() {
    return this._end();
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
  asEndTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['EndTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['EndTaskParam'], K> {
    return taskGroup;
  }

  /**
   * @protected
   * Composes with blueprint generators, if any.
   */
  protected async composeWithBlueprints(subGen?: string, options?: ComposeOptions) {
    if (subGen === undefined) {
      const { namespace } = this.options;
      if (!namespace?.startsWith('jhipster:')) {
        throw new Error(`Generator is not blueprintable ${namespace}`);
      }
      subGen = namespace.substring('jhipster:'.length);
    }
    this.delegateToBlueprint = false;

    if (this.options.disableBlueprints) {
      return [];
    }

    if (!this.#blueprintConfigured) {
      await this._configureBlueprints();
    }

    let blueprints = this.jhipsterConfig.blueprints || [];
    if (this.options.composeWithLocalBlueprint) {
      blueprints = blueprints.concat({ name: '@jhipster/local' });
    }
    const composedBlueprints: any[] = [];
    for (const blueprint of blueprints) {
      const blueprintGenerator = await this._composeBlueprint(blueprint.name, subGen, options);
      let blueprintCommand;
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
        const blueprintModule = (await blueprintGenerator._meta?.importModule?.()) as any;
        blueprintCommand = blueprintModule?.command;
      } else {
        const generatorName = packageNameToNamespace(normalizeBlueprintName(blueprint.name));
        const generatorNamespace = `${generatorName}:${subGen}`;
        const blueprintMeta = await this.env.findMeta(generatorNamespace);
        const blueprintModule = (await blueprintMeta?.importModule?.()) as any;
        blueprintCommand = blueprintModule?.command;
        if (blueprintCommand?.compose) {
          this.generatorsToCompose.push(...blueprintCommand.compose);
        }
      }
      if (blueprintCommand?.override) {
        if (this.generatorCommand) {
          this.log.warn('Command already set, multiple blueprints may be overriding the command. Unexpected behavior may occur.');
        }
        // Use the blueprint command if it is set to override.
        this.generatorCommand = blueprintCommand;
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
  private async _configureBlueprints() {
    let argvBlueprints = this.options.blueprints || '';
    // check for old single blueprint declaration
    let { blueprint } = this.options;
    if (blueprint) {
      if (typeof blueprint === 'string') {
        blueprint = [blueprint];
      }
      this.log.warn('--blueprint option is deprecated. Please use --blueprints instead');
      argvBlueprints = union(blueprint, argvBlueprints.split(',')).join(',');
    }
    const blueprints = mergeBlueprints(parseBluePrints(argvBlueprints), loadBlueprintsFromConfiguration(this.config));

    // EnvironmentBuilder already looks for blueprint when running from cli, this is required for tests.
    // Can be removed once the tests uses EnvironmentBuilder.
    const missingBlueprints = blueprints
      .filter(blueprint => !this.env.isPackageRegistered(packageNameToNamespace(blueprint.name)))
      .map(blueprint => blueprint.name);
    if (missingBlueprints.length > 0) {
      await this.env.lookup({ filterPaths: true, packagePatterns: missingBlueprints } as any);
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
    extraOptions: ComposeOptions = {},
  ): Promise<G | undefined> {
    blueprint = normalizeBlueprintName(blueprint);
    if (!this.skipChecks && blueprint !== LOCAL_BLUEPRINT_PACKAGE_NAMESPACE) {
      this._checkBlueprint(blueprint);
    }

    const generatorName = packageNameToNamespace(blueprint);
    const generatorNamespace = `${generatorName}:${subGen}`;
    if (!(await this.env.get(generatorNamespace))) {
      this.log.debug(
        `No blueprint found for blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(
          generatorNamespace,
        )} subgenerator: falling back to default generator`,
      );
      return undefined;
    }
    this.log.debug(
      `Found blueprint ${chalk.yellow(blueprint)} and ${chalk.yellow(subGen)} with namespace ${chalk.yellow(generatorNamespace)}`,
    );

    const finalOptions: ComposeOptions = {
      forwardOptions: true,
      schedule: generator => (generator as any).sbsBlueprint,
      generatorArgs: this._args,
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
    if (!blueprintPackageJson?.version) {
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
    const compatibleJhipsterRange =
      blueprintPackageJson.engines?.['generator-jhipster'] ??
      blueprintPackageJson.dependencies?.['generator-jhipster'] ??
      blueprintPackageJson.peerDependencies?.['generator-jhipster'];
    if (compatibleJhipsterRange) {
      if (!semver.valid(compatibleJhipsterRange) && !semver.validRange(compatibleJhipsterRange)) {
        this.log.verboseInfo(`Blueprint ${blueprintPkgName} contains generator-jhipster dependency with non comparable version`);
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
    this.log.warn(`Could not retrieve version of JHipster declared by blueprint '${blueprintPkgName}'`);
  }
}
