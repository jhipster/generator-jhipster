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

import { union } from 'lodash-es';
import { execaCommandSync } from 'execa';
import type { PackageJson } from 'type-fest';
import { packageJson } from '../../lib/index.js';
import CoreGenerator from '../base-core/index.js';
import { GENERATOR_JHIPSTER } from '../generator-constants.js';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand, ParseableCommand } from '../../lib/command/types.js';
import { GENERATOR_BOOTSTRAP } from '../generator-list.js';
import type { GenericTaskGroup } from '../base-core/types.js';
import { packageNameToNamespace } from '../../lib/utils/index.js';
import {
  CONTEXT_DATA_BLUEPRINTS_TO_COMPOSE,
  CONTEXT_DATA_EXISTING_PROJECT,
  CONTEXT_DATA_REPRODUCIBLE_TIMESTAMP,
  LOCAL_BLUEPRINT_PACKAGE_NAMESPACE,
  formatDateForChangelog,
} from '../base/support/index.js';
import { PRIORITY_NAMES } from '../base-core/priorities.ts';
import type { TaskTypes as BaseTasks } from './tasks.js';
import { mergeBlueprints, normalizeBlueprintName, parseBlueprints } from './internal/index.js';
import type {
  Config as BaseConfig,
  Features as BaseFeatures,
  Options as BaseOptions,
  Source as BaseSource,
  CleanupArgumentType,
  Control,
} from './types.js';

const { WRITING } = PRIORITY_NAMES;

/**
 * Base class that contains blueprints support.
 * Provides built-in state support with control object.
 */
export default class BaseGenerator<
  Config extends BaseConfig = BaseConfig,
  Options extends BaseOptions = BaseOptions,
  Source extends BaseSource = BaseSource,
  Features extends BaseFeatures = BaseFeatures,
  Tasks extends BaseTasks<Source> = BaseTasks<Source>,
> extends CoreGenerator<Config, Options, Features> {
  fromBlueprint!: boolean;
  sbsBlueprint?: boolean;
  delegateToBlueprint = false;
  blueprintConfig?: Record<string, any>;
  jhipsterContext?: any;

  constructor(args: string | string[], options: Options, features: Features) {
    const { jhipsterContext, ...opts } = options ?? {};
    super(args, opts as Options, { blueprintSupport: true, ...features });

    if (this.options.help) {
      return;
    }

    const {
      sbsBlueprint = false,
      checkBlueprint,
      jhipsterBootstrap = this._namespace !== 'jhipster:project-name' &&
        !this._namespace.split(':')[1]?.startsWith('bootstrap') &&
        !this._namespace.endsWith(':bootstrap'),
    } = this.getFeatures();

    this.sbsBlueprint = sbsBlueprint;
    this.fromBlueprint = this.rootGeneratorName() !== 'generator-jhipster';

    if (this.fromBlueprint) {
      this.blueprintStorage = this._getStorage();
      this.blueprintConfig = this.blueprintStorage.createProxy();

      // jhipsterContext is the original generator
      this.jhipsterContext = jhipsterContext;

      if (checkBlueprint) {
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

    if (jhipsterBootstrap) {
      // jhipster:bootstrap is always required. Run it once the environment starts.
      this.env.queueTask('environment:run', async () => this.composeWithJHipster(GENERATOR_BOOTSTRAP).then(), {
        once: 'queueJhipsterBootstrap',
        startQueue: false,
      });
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
   * Generate a timestamp to be used by Liquibase changelogs.
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
          const newCreationTimestamp: string | number | undefined = creationTimestamp ?? this.config.get('creationTimestamp');
          const newDate = newCreationTimestamp ? new Date(newCreationTimestamp) : now;
          newDate.setMilliseconds(0);
          return newDate;
        },
      });
      now.setMinutes(now.getMinutes() + 1);
      this.getContextData(CONTEXT_DATA_REPRODUCIBLE_TIMESTAMP, { replacement: now });

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
  asAnyTaskGroup(taskGroup: GenericTaskGroup<this, any>): GenericTaskGroup<any, any> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Initializing priority is used to show logo and tasks related to preparing for prompts, like loading constants.
   */
  get initializing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asInitializingTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['InitializingTaskParam']>,
  ): GenericTaskGroup<any, Tasks['InitializingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Prompting priority is used to prompt users for configuration values.
   */
  get prompting() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPromptingTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['PromptingTaskParam']>): GenericTaskGroup<any, Tasks['PromptingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring priority is used to customize and validate the configuration.
   */
  get configuring() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asConfiguringTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['ConfiguringTaskParam']>,
  ): GenericTaskGroup<any, Tasks['ConfiguringTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Composing should be used to compose with others generators.
   */
  get composing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asComposingTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['ComposingTaskParam']>): GenericTaskGroup<any, Tasks['ComposingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * ComposingComponent priority should be used to handle component configuration order.
   */
  get composingComponent() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asComposingComponentTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['ComposingTaskParam']>,
  ): GenericTaskGroup<any, Tasks['ComposingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Loading should be used to load application configuration from jhipster configuration.
   * Before this priority the configuration should be considered dirty, while each generator configures itself at configuring priority, another generator composed at composing priority can still change it.
   */
  get loading() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['LoadingTaskParam']>): GenericTaskGroup<any, Tasks['LoadingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Preparing should be used to generate derived properties.
   */
  get preparing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['PreparingTaskParam']>): GenericTaskGroup<any, Tasks['PreparingTaskParam']> {
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
  asPostPreparingTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['PostPreparingTaskParam']>,
  ): GenericTaskGroup<any, Tasks['PostPreparingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Default priority should used as misc customizations.
   */
  get default() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asDefaultTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['DefaultTaskParam']>): GenericTaskGroup<any, Tasks['DefaultTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Writing priority should used to write files.
   */
  get writing() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asWritingTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['WritingTaskParam']>): GenericTaskGroup<any, Tasks['WritingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postWriting() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostWritingTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['PostWritingTaskParam']>,
  ): GenericTaskGroup<any, Tasks['PostWritingTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Install priority should used to prepare the project.
   */
  get install() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asInstallTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['InstallTaskParam']>): GenericTaskGroup<any, Tasks['InstallTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * PostWriting priority should used to customize files.
   */
  get postInstall() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostInstallTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['PostInstallTaskParam']>,
  ): GenericTaskGroup<any, Tasks['PostInstallTaskParam']> {
    return taskGroup;
  }

  /**
   * Priority API stub for blueprints.
   *
   * End priority should used to say good bye and print instructions.
   */
  get end() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asEndTaskGroup(taskGroup: GenericTaskGroup<this, Tasks['EndTaskParam']>): GenericTaskGroup<any, Tasks['EndTaskParam']> {
    return taskGroup;
  }

  /**
   * @protected
   * Composes with blueprint generators, if any.
   */
  protected async composeWithBlueprints() {
    if (this.fromBlueprint) {
      throw new Error('Only the main generator can compose with blueprints');
    }
    const namespace = this._namespace;
    if (!namespace?.startsWith('jhipster:')) {
      throw new Error(`Generator is not blueprintable ${namespace}`);
    }
    const subGen = namespace.substring('jhipster:'.length);

    this.delegateToBlueprint = false;

    if (this.options.disableBlueprints) {
      return [];
    }

    let blueprints = await this.#configureBlueprints();
    if (this.options.composeWithLocalBlueprint) {
      blueprints = blueprints.concat('@jhipster/local');
    }
    const composedBlueprints: any[] = [];
    for (const blueprintName of blueprints) {
      const blueprintGenerator = await this.#composeBlueprint(blueprintName, subGen);
      let blueprintCommand;
      if (blueprintGenerator) {
        composedBlueprints.push(blueprintGenerator);
        if ((blueprintGenerator as any).sbsBlueprint) {
          // If sbsBlueprint, add templatePath to the original generator templatesFolder.
          this.jhipsterTemplatesFolders.unshift(blueprintGenerator.templatePath());
        } else {
          // If the blueprints does not sets sbsBlueprint property, ignore normal workflow.
          this.delegateToBlueprint = true;
          this.#checkBlueprintImplementsPriorities(blueprintGenerator);
        }
        const blueprintModule = (await blueprintGenerator._meta?.importModule?.()) as any;
        blueprintCommand = blueprintModule?.command;
      } else {
        const generatorName = packageNameToNamespace(normalizeBlueprintName(blueprintName));
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
  #checkBlueprintImplementsPriorities(blueprintGenerator: BaseGenerator) {
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
  async #configureBlueprints(): Promise<string[]> {
    try {
      return this.getContextData(CONTEXT_DATA_BLUEPRINTS_TO_COMPOSE);
    } catch {
      // Ignore
    }
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
    const blueprints = mergeBlueprints(parseBlueprints(argvBlueprints), this.jhipsterConfig.blueprints ?? []);

    // EnvironmentBuilder already looks for blueprint when running from cli, this is required for tests.
    // Can be removed once the tests uses EnvironmentBuilder.
    const missingBlueprints = blueprints
      .filter(blueprint => !this.env.isPackageRegistered(packageNameToNamespace(blueprint.name)))
      .map(blueprint => blueprint.name);
    if (missingBlueprints.length > 0) {
      await this.env.lookup({ filterPaths: true, packagePatterns: missingBlueprints });
    }

    if (blueprints && blueprints.length > 0) {
      blueprints.forEach(blueprint => {
        blueprint.version = this.#findBlueprintVersion(blueprint.name) ?? blueprint.version;
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
      blueprints.forEach(blueprint => {
        this.#checkJHipsterBlueprintVersion(blueprint.name);
      });
    }
    const blueprintNames = blueprints.map(blueprint => blueprint.name);
    this.getContextData(CONTEXT_DATA_BLUEPRINTS_TO_COMPOSE, {
      replacement: blueprintNames,
    });

    return blueprintNames;
  }

  /**
   * Compose external blueprint module
   */
  async #composeBlueprint(blueprint: string, subGen: string) {
    blueprint = normalizeBlueprintName(blueprint);
    if (!this.skipChecks && blueprint !== LOCAL_BLUEPRINT_PACKAGE_NAMESPACE) {
      this.#checkBlueprint(blueprint);
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

    const blueprintGenerator = await this.composeWith<BaseGenerator>(generatorNamespace, {
      forwardOptions: true,
      schedule: generator => (generator as any).sbsBlueprint,
      generatorArgs: this._args,
      generatorOptions: {
        jhipsterContext: this,
      },
    });
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
  #findBlueprintPackageJson(blueprintPkgName: string): PackageJson | undefined {
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
  #findBlueprintVersion(blueprintPkgName: string): string | undefined {
    const blueprintPackageJson = this.#findBlueprintPackageJson(blueprintPkgName);
    if (!blueprintPackageJson?.version) {
      this.log.warn(`Could not retrieve version of blueprint '${blueprintPkgName}'`);
      return undefined;
    }
    return blueprintPackageJson.version;
  }

  /**
   * Check if the generator specified as blueprint is installed.
   */
  #checkBlueprint(blueprint: string) {
    if (blueprint === 'generator-jhipster') {
      throw new Error(`You cannot use ${chalk.yellow(blueprint)} as the blueprint.`);
    }
  }

  /**
   * Check if the generator specified as blueprint has a version compatible with current JHipster.
   */
  #checkJHipsterBlueprintVersion(blueprintPkgName: string) {
    const blueprintPackageJson = this.#findBlueprintPackageJson(blueprintPkgName);
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

export class CommandBaseGenerator<
  Command extends ParseableCommand,
  AdditionalOptions = unknown,
  AdditionalFeatures = unknown,
> extends BaseGenerator<
  BaseConfig & ExportStoragePropertiesFromCommand<Command>,
  BaseOptions & ExportGeneratorOptionsFromCommand<Command> & AdditionalOptions,
  BaseSource,
  BaseFeatures & AdditionalFeatures,
  BaseTasks
> {}
