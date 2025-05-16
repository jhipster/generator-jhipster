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
import { basename, dirname, extname, isAbsolute, join, join as joinPath, relative } from 'path';
import { relative as posixRelative } from 'path/posix';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, rmSync, statSync } from 'fs';
import assert from 'assert';
import { requireNamespace } from '@yeoman/namespace';
import type { GeneratorMeta } from '@yeoman/types';
import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { defaults, get, kebabCase, merge, mergeWith, set, snakeCase } from 'lodash-es';
import { simpleGit } from 'simple-git';
import type { CopyOptions } from 'mem-fs-editor';
import type { Data as TemplateData, Options as TemplateOptions } from 'ejs';
import semver, { lt as semverLessThan } from 'semver';
import YeomanGenerator, { type ComposeOptions, type Storage } from 'yeoman-generator';
import type Environment from 'yeoman-environment';
import latestVersion from 'latest-version';

import SharedData from '../base/shared-data.js';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, PRIORITY_PREFIX, QUEUES } from '../base/priorities.js';
import type { Logger } from '../base/support/index.js';
import {
  CRLF,
  LF,
  createJHipster7Context,
  formatDateForChangelog,
  hasCrlr,
  joinCallbacks,
  normalizeLineEndings,
  removeFieldsWithNullishValues,
} from '../base/support/index.js';

import type {
  CascatedEditFileCallback,
  EditFileCallback,
  EditFileOptions,
  JHipsterGeneratorFeatures,
  JHipsterGeneratorOptions,
  ValidationResult,
  WriteFileOptions,
} from '../base/api.js';
import {
  type JHipsterArguments,
  type JHipsterCommandDefinition,
  type JHipsterConfigs,
  type JHipsterOptions,
  convertConfigToOption,
} from '../../lib/command/index.js';
import { packageJson } from '../../lib/index.js';
import type { BaseApplication } from '../base-application/types.js';
import { GENERATOR_BOOTSTRAP } from '../generator-list.js';
import NeedleApi from '../needle-api.js';
import baseCommand from '../base/command.js';
import { GENERATOR_JHIPSTER, YO_RC_FILE } from '../generator-constants.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/index.js';
import { getGradleLibsVersionsProperties } from '../gradle/support/dependabot-gradle.js';
import { dockerPlaceholderGenerator } from '../docker/utils.js';
import { getConfigWithDefaults } from '../../lib/jhipster/index.js';
import { extractArgumentsFromConfigs } from '../../lib/command/index.js';
import type BaseApplicationGenerator from '../base-application/generator.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { Control } from '../base/types.js';
import { convertWriteFileSectionsToBlocks } from './internal/index.js';

const {
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
  COMPOSING_COMPONENT,
  LOADING,
  PREPARING,
  POST_PREPARING,
  DEFAULT,
  WRITING,
  POST_WRITING,
  INSTALL,
  POST_INSTALL,
  END,
} = PRIORITY_NAMES;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const asPriority = (priorityName: string) => `${PRIORITY_PREFIX}${priorityName}`;

const relativeDir = (from: string, to: string) => {
  const rel = posixRelative(from, to);
  return rel ? `${rel}/` : '';
};

const deepMerge = (source1: any, source2: any) => mergeWith({}, source1, source2, (a, b) => (Array.isArray(a) ? a.concat(b) : undefined));

/**
 * This is the base class for a generator for every generator.
 */
export default class CoreGenerator extends YeomanGenerator<JHipsterGeneratorOptions, JHipsterGeneratorFeatures> {
  static asPriority = asPriority;

  static INITIALIZING = asPriority(INITIALIZING);

  static PROMPTING = asPriority(PROMPTING);

  static CONFIGURING = asPriority(CONFIGURING);

  static COMPOSING = asPriority(COMPOSING);

  static COMPOSING_COMPONENT = asPriority(COMPOSING_COMPONENT);

  static LOADING = asPriority(LOADING);

  static PREPARING = asPriority(PREPARING);

  static POST_PREPARING = asPriority(POST_PREPARING);

  static DEFAULT = asPriority(DEFAULT);

  static WRITING = asPriority(WRITING);

  static POST_WRITING = asPriority(POST_WRITING);

  static INSTALL = asPriority(INSTALL);

  static POST_INSTALL = asPriority(POST_INSTALL);

  static END = asPriority(END);

  context?: Record<string, any>;
  useVersionPlaceholders?: boolean;
  skipChecks?: boolean;
  ignoreNeedlesError?: boolean;
  experimental?: boolean;
  debugEnabled?: boolean;
  relativeDir = relativeDir;
  relative = posixRelative;

  readonly sharedData!: SharedData<any>;
  readonly logger: Logger;
  jhipsterConfig!: Record<string, any>;
  /**
   * @deprecated
   */
  jhipsterTemplatesFolders!: string[];

  blueprintStorage?: Storage;
  /** Allow to use a specific definition at current command operations */
  generatorCommand?: JHipsterCommandDefinition;
  /**
   * @experimental
   * Additional commands to be considered
   */
  generatorsToCompose: string[] = [];

  private _jhipsterGenerator?: string;
  private _needleApi?: NeedleApi;

  // Override the type of `env` to be a full Environment
  declare env: Environment;
  declare log: Logger;
  declare _meta?: GeneratorMeta;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, {
      skipParseOptions: true,
      tasksMatchingPriority: true,
      taskPrefix: PRIORITY_PREFIX,
      unique: 'namespace',
      ...features,
    });

    if (!this.options.help) {
      /* Force config to use 'generator-jhipster' namespace. */
      this._config = this._getStorage('generator-jhipster');

      /* JHipster config using proxy mode used as a plain object instead of using get/set. */
      this.jhipsterConfig = this.config.createProxy();

      this.sharedData = this.createSharedData() as any;

      /* Options parsing must be executed after forcing jhipster storage namespace and after sharedData have been populated */
      this.parseJHipsterOptions(baseCommand.options);

      // Don't write jhipsterVersion to .yo-rc.json when reproducible
      if (
        this.options.namespace.startsWith('jhipster:') &&
        !this.options.namespace.startsWith('jhipster:bootstrap') &&
        this.getFeatures().storeJHipsterVersion !== false &&
        !this.options.reproducibleTests &&
        !this.jhipsterConfig.jhipsterVersion
      ) {
        this.storeCurrentJHipsterVersion();
      }
    }

    this.logger = this.log as any;

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    if (this.getFeatures().jhipsterBootstrap ?? true) {
      // jhipster:bootstrap is always required. Run it once the environment starts.
      this.env.queueTask('environment:run', async () => this.composeWithJHipster(GENERATOR_BOOTSTRAP).then(), {
        once: 'queueJhipsterBootstrap',
        startQueue: false,
      });
    }

    // Add base template folder.
    this.jhipsterTemplatesFolders = [this.templatePath()];

    if (this.features.queueCommandTasks === true) {
      this.on('before:queueOwnTasks', () => {
        this.queueCurrentJHipsterCommandTasks();
      });
    }
  }

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage(): string {
    return super.usage().replace('yo jhipster:', 'jhipster ');
  }

  storeCurrentJHipsterVersion(): void {
    this.jhipsterConfig.jhipsterVersion = packageJson.version;
  }

  /**
   * @deprecated
   */
  get needleApi() {
    if (this._needleApi === undefined || this._needleApi === null) {
      this._needleApi = new NeedleApi(this);
    }
    return this._needleApi;
  }

  get control(): Control {
    // TODO use contextData api.
    // return this.getContextData<Control>('jhipster:control', () => ({}) as unknown as Control);
    return this.sharedData.getControl();
  }

  /**
   * JHipster config with default values fallback
   */
  get jhipsterConfigWithDefaults(): Readonly<ApplicationConfiguration & Record<string, any>> {
    const configWithDefaults = getConfigWithDefaults(removeFieldsWithNullishValues(this.config.getAll()));
    defaults(configWithDefaults, {
      skipFakeData: false,
      skipCheckLengthOfIdentifier: false,
      enableGradleDevelocity: false,
      autoCrlf: false,
      pages: [],
    });
    return configWithDefaults as ApplicationConfiguration;
  }

  /**
   * Warn or throws check failure based on current skipChecks option.
   * @param message
   */
  handleCheckFailure(message: string) {
    if (this.skipChecks) {
      this.log.warn(message);
    } else {
      throw new Error(`${message}
You can ignore this error by passing '--skip-checks' to jhipster command.`);
    }
  }

  /**
   * Check if the JHipster version used to generate an existing project is less than the passed version argument
   *
   * @param {string} version - A valid semver version string
   */
  isJhipsterVersionLessThan(version: string): boolean {
    const jhipsterOldVersion = this.control.jhipsterOldVersion;
    return this.isVersionLessThan(jhipsterOldVersion, version);
  }

  /**
   * Wrapper for `semver.lt` to check if the oldVersion exists and is less than the newVersion.
   * Can be used by blueprints.
   */
  isVersionLessThan(oldVersion: string | null, newVersion: string): boolean {
    return oldVersion ? semverLessThan(oldVersion, newVersion) : false;
  }

  /**
   * Get arguments for the priority
   */
  getArgsForPriority(priorityName: string) {
    const control = this.control;
    if (priorityName === POST_WRITING || priorityName === PREPARING || priorityName === POST_PREPARING) {
      const source = this.sharedData.getSource();
      return [{ control, source }];
    }
    if (priorityName === WRITING) {
      if (existsSync(this.destinationPath(YO_RC_FILE))) {
        try {
          const oldConfig = JSON.parse(readFileSync(this.destinationPath(YO_RC_FILE)).toString())[GENERATOR_JHIPSTER];
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
          return [{ control, configChanges }];
        } catch {
          // Fail to parse
        }
      }
    }
    return [{ control }];
  }

  /**
   * Check if the generator should ask for prompts.
   */
  shouldAskForPrompts({ control }): boolean {
    return !control.existingProject || this.options.askAnswered === true;
  }

  /**
   * Override yeoman-generator method that gets methods to be queued, filtering the result.
   */
  getTaskNames(): string[] {
    let priorities = super.getTaskNames();
    if (!this.features.disableSkipPriorities && this.options.skipPriorities) {
      // Make sure yeoman-generator will not throw on empty tasks due to filtered priorities.
      this.customLifecycle = this.customLifecycle || priorities.length > 0;
      priorities = priorities.filter(priorityName => !this.options.skipPriorities!.includes(priorityName));
    }
    return priorities;
  }

  queueCurrentJHipsterCommandTasks() {
    this.queueTask({
      queueName: QUEUES.INITIALIZING_QUEUE,
      taskName: 'parseCurrentCommand',
      cancellable: true,
      async method() {
        try {
          await this.getCurrentJHipsterCommand();
        } catch {
          return;
        }
        await this.parseCurrentJHipsterCommand();
      },
    });

    this.queueTask({
      queueName: QUEUES.PROMPTING_QUEUE,
      taskName: 'promptCurrentCommand',
      cancellable: true,
      async method() {
        try {
          const command = await this.getCurrentJHipsterCommand();
          if (!command.configs) return;
        } catch {
          return;
        }
        const taskArgs = this.getArgsForPriority(PRIORITY_NAMES.INITIALIZING);
        const [{ control }] = taskArgs;
        if (!control) throw new Error(`Control object not found in ${this.options.namespace}`);
        if (!this.shouldAskForPrompts({ control })) return;
        await this.promptCurrentJHipsterCommand();
      },
    });

    this.queueTask({
      queueName: QUEUES.CONFIGURING_QUEUE,
      taskName: 'configureCurrentCommand',
      cancellable: true,
      async method() {
        try {
          const command = await this.getCurrentJHipsterCommand();
          if (!command.configs) return;
        } catch {
          return;
        }
        await this.configureCurrentJHipsterCommandConfig();
      },
    });

    this.queueTask({
      queueName: QUEUES.COMPOSING_QUEUE,
      taskName: 'composeCurrentCommand',
      cancellable: true,
      async method() {
        try {
          await this.getCurrentJHipsterCommand();
        } catch {
          return;
        }
        await this.composeCurrentJHipsterCommand();
      },
    });

    this.queueTask({
      queueName: QUEUES.LOADING_QUEUE,
      taskName: 'loadCurrentCommand',
      cancellable: true,
      async method() {
        try {
          const command = await this.getCurrentJHipsterCommand();
          if (!command.configs) return;

          const taskArgs = this.getArgsForPriority(PRIORITY_NAMES.LOADING);
          const [{ application }] = taskArgs as any;
          loadConfig.call(this, command.configs, { application: application ?? this });
          loadDerivedConfig(command.configs, { application });
        } catch {
          // Ignore non existing command
        }
      },
    });
  }

  /**
   * Get the current Command Definition for the generator.
   * `generatorCommand` takes precedence.
   */
  async getCurrentJHipsterCommand(): Promise<JHipsterCommandDefinition> {
    if (!this.generatorCommand) {
      const { command } = ((await this._meta?.importModule?.()) ?? {}) as any;
      if (!command) {
        throw new Error(`Command not found for generator ${this.options.namespace}`);
      }
      this.generatorCommand = command;
      return command;
    }
    return this.generatorCommand;
  }

  /**
   * Parse command definition arguments, options and configs.
   * Blueprints with command override takes precedence.
   */
  async parseCurrentJHipsterCommand() {
    const generatorCommand = await this.getCurrentJHipsterCommand();
    this.parseJHipsterCommand(generatorCommand);
  }

  /**
   * Prompts for command definition configs.
   * Blueprints with command override takes precedence.
   */
  async promptCurrentJHipsterCommand() {
    const generatorCommand = await this.getCurrentJHipsterCommand();
    if (!generatorCommand.configs) {
      throw new Error(`Configs not found for generator ${this.options.namespace}`);
    }
    return this.prompt(this.prepareQuestions(generatorCommand.configs) as any);
  }

  /**
   * Configure the current JHipster command.
   * Blueprints with command override takes precedence.
   */
  async configureCurrentJHipsterCommandConfig() {
    const generatorCommand = await this.getCurrentJHipsterCommand();
    if (!generatorCommand.configs) {
      throw new Error(`Configs not found for generator ${this.options.namespace}`);
    }

    for (const [name, def] of Object.entries(generatorCommand.configs)) {
      def.configure?.(this, this.options[name]);
    }
  }

  /**
   * Load the current JHipster command storage configuration into the context.
   * Blueprints with command override takes precedence.
   */
  async loadCurrentJHipsterCommandConfig(context: any) {
    const generatorCommand = await this.getCurrentJHipsterCommand();
    if (!generatorCommand.configs) {
      throw new Error(`Configs not found for generator ${this.options.namespace}`);
    }

    loadConfig.call(this, generatorCommand.configs, { application: context });
  }

  /**
   * @experimental
   * Compose the current JHipster command compose.
   * Blueprints commands compose without generators will be composed.
   */
  async composeCurrentJHipsterCommand() {
    const generatorCommand = await this.getCurrentJHipsterCommand();
    for (const compose of generatorCommand.compose ?? []) {
      await this.composeWithJHipster(compose);
    }

    for (const compose of this.generatorsToCompose) {
      await this.composeWithJHipster(compose);
    }
  }

  parseJHipsterCommand(commandDef: JHipsterCommandDefinition) {
    if (commandDef.arguments) {
      this.parseJHipsterArguments(commandDef.arguments);
    } else if (commandDef.configs) {
      this.parseJHipsterArguments(extractArgumentsFromConfigs(commandDef.configs));
    }
    if (commandDef.options || commandDef.configs) {
      this.parseJHipsterOptions(commandDef.options, commandDef.configs);
    }
  }

  parseJHipsterOptions(options: JHipsterOptions | undefined, configs: JHipsterConfigs | boolean = {}, common = false) {
    if (typeof configs === 'boolean') {
      common = configs;
      configs = {};
    }

    Object.entries(options ?? {})
      .concat(Object.entries(configs).map(([name, def]) => [name, convertConfigToOption(name, def)]) as any)
      .forEach(([optionName, optionDesc]) => {
        if (!optionDesc?.type || !optionDesc.scope || (common && optionDesc.scope === 'generator')) return;
        let optionValue;
        // Hidden options are test options, which doesn't rely on commander for options parsing.
        // We must parse environment variables manually
        if (this.options[optionDesc.name ?? optionName] === undefined && optionDesc.env && process.env[optionDesc.env]) {
          optionValue = process.env[optionDesc.env];
        } else {
          optionValue = this.options[optionDesc.name ?? optionName];
        }
        if (optionValue !== undefined) {
          optionValue = optionDesc.type !== Array && optionDesc.type !== Function ? optionDesc.type(optionValue) : optionValue;
          if (optionDesc.scope === 'storage') {
            this.config.set(optionName, optionValue);
          } else if (optionDesc.scope === 'blueprint') {
            this.blueprintStorage!.set(optionName, optionValue);
          } else if (optionDesc.scope === 'control') {
            this.control[optionName] = optionValue;
          } else if (optionDesc.scope === 'generator') {
            this[optionName] = optionValue;
          } else if (optionDesc.scope === 'context') {
            this.context![optionName] = optionValue;
          } else if (optionDesc.scope !== 'none') {
            throw new Error(`Scope ${optionDesc.scope} not supported`);
          }
        } else if (optionDesc.default !== undefined && optionDesc.scope === 'generator' && this[optionName] === undefined) {
          this[optionName] = optionDesc.default;
        }
      });
  }

  parseJHipsterArguments(jhipsterArguments: JHipsterArguments = {}) {
    const hasPositionalArguments = Boolean(this.options.positionalArguments);
    let positionalArguments: unknown[] = hasPositionalArguments ? this.options.positionalArguments! : this._args;
    const argumentEntries = Object.entries(jhipsterArguments);
    if (hasPositionalArguments && positionalArguments.length > argumentEntries.length) {
      throw new Error('More arguments than allowed');
    }

    argumentEntries.find(([argumentName, argumentDef]) => {
      if (positionalArguments.length > 0) {
        let argument;
        if (hasPositionalArguments || argumentDef.type !== Array) {
          // Positional arguments already parsed or a single argument.
          argument = Array.isArray(positionalArguments) ? positionalArguments.shift() : positionalArguments;
        } else {
          // Varags argument.
          argument = positionalArguments;
          positionalArguments = [];
        }
        // Replace varargs empty array with undefined.
        argument = Array.isArray(argument) && argument.length === 0 ? undefined : argument;
        if (argument !== undefined) {
          const convertedValue = !argumentDef.type || argumentDef.type === Array ? argument : argumentDef.type(argument);
          if (argumentDef.scope === undefined || argumentDef.scope === 'generator') {
            this[argumentName] = convertedValue;
          } else if (argumentDef.scope === 'context') {
            this.context![argumentName] = convertedValue;
          } else if (argumentDef.scope === 'storage') {
            this.config.set(argumentName, convertedValue);
          } else if (argumentDef.scope === 'blueprint') {
            this.blueprintStorage!.set(argumentName, convertedValue);
          }
        }
      } else {
        if (argumentDef.required) {
          throw new Error(`Missing required argument ${argumentName}`);
        }
        return true;
      }
      return false;
    });

    // Arguments should only be parsed by the root generator, cleanup to don't be forwarded.
    this.options.positionalArguments = [];
  }

  prepareQuestions(configs: JHipsterConfigs = {}) {
    return Object.entries(configs)
      .filter(([_name, def]) => def?.prompt)
      .map(([name, def]) => {
        let promptSpec = typeof def.prompt === 'function' ? def.prompt(this as any, def) : { ...def.prompt };
        let storage: any;
        if ((def.scope ?? 'storage') === 'storage') {
          storage = this.config;
          if (promptSpec.default === undefined) {
            promptSpec = { ...promptSpec, default: () => (this as any).jhipsterConfigWithDefaults?.[name] };
          }
        } else if (def.scope === 'blueprint') {
          storage = this.blueprintStorage;
        } else if (def.scope === 'generator') {
          storage = {
            getPath: path => get(this, path),
            setPath: (path, value) => set(this, path, value),
          };
        } else if (def.scope === 'context') {
          storage = {
            getPath: path => get(this.context, path),
            setPath: (path, value) => set(this.context!, path, value),
          };
        }
        return {
          name,
          choices: def.choices,
          ...promptSpec,
          storage,
        };
      });
  }

  /**
   * Generate a date to be used by Liquibase changelogs.
   *
   * @param {Boolean} [reproducible=true] - Set true if the changelog date can be reproducible.
   *                                 Set false to create a changelog date incrementing the last one.
   * @return {String} Changelog date.
   */
  dateFormatForLiquibase(reproducible?: boolean): string {
    const control = this.control;
    reproducible = reproducible ?? Boolean(control.reproducible);
    // Use started counter or use stored creationTimestamp if creationTimestamp option is passed
    const creationTimestamp = this.options.creationTimestamp ? this.config.get('creationTimestamp') : undefined;
    let now = new Date();
    // Miliseconds is ignored for changelogDate.
    now.setMilliseconds(0);
    // Run reproducible timestamp when regenerating the project with reproducible option or an specific timestamp.
    if (reproducible || creationTimestamp) {
      if (control.reproducibleLiquibaseTimestamp) {
        // Counter already started.
        now = control.reproducibleLiquibaseTimestamp;
      } else {
        // Create a new counter
        const newCreationTimestamp: string = (creationTimestamp as string) ?? this.config.get('creationTimestamp');
        now = newCreationTimestamp ? new Date(newCreationTimestamp) : now;
        now.setMilliseconds(0);
      }
      now.setMinutes(now.getMinutes() + 1);
      control.reproducibleLiquibaseTimestamp = now;

      // Reproducible build can create future timestamp, save it.
      const lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (!lastLiquibaseTimestamp || now.getTime() > lastLiquibaseTimestamp) {
        this.config.set('lastLiquibaseTimestamp', now.getTime());
      }
    } else {
      // Get and store lastLiquibaseTimestamp, a future timestamp can be used
      let lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (lastLiquibaseTimestamp) {
        lastLiquibaseTimestamp = new Date(lastLiquibaseTimestamp);
        if (lastLiquibaseTimestamp >= now) {
          now = lastLiquibaseTimestamp;
          now.setSeconds(now.getSeconds() + 1);
          now.setMilliseconds(0);
        }
      }
      this.jhipsterConfig.lastLiquibaseTimestamp = now.getTime();
    }
    return formatDateForChangelog(now);
  }

  /**
   * Alternative templatePath that fetches from the blueprinted generator, instead of the blueprint.
   */
  jhipsterTemplatePath(...path: string[]): string {
    let existingGenerator: string;
    try {
      existingGenerator = this._jhipsterGenerator ?? requireNamespace(this.options.namespace).generator;
    } catch {
      if (this.options.namespace) {
        const split = this.options.namespace.split(':', 2);
        existingGenerator = split.length === 1 ? split[0] : split[1];
      } else {
        throw new Error('Could not determine the generator name');
      }
    }
    this._jhipsterGenerator = existingGenerator;
    return this._jhipsterGenerator
      ? this.fetchFromInstalledJHipster(this._jhipsterGenerator, 'templates', ...path)
      : this.templatePath(...path);
  }

  /**
   * Compose with a jhipster generator using default jhipster config.
   * @return {object} the composed generator
   */
  async composeWithJHipster<const G extends string>(gen: G, options?: ComposeOptions<BaseApplicationGenerator>) {
    assert(typeof gen === 'string', 'generator should to be a string');
    let generator: string = gen;
    if (!isAbsolute(generator)) {
      const namespace = generator.includes(':') ? generator : `jhipster:${generator}`;
      if (await this.env.get(namespace)) {
        generator = namespace;
      } else {
        throw new Error(`Generator ${generator} was not found`);
      }
    }

    return this.composeWith(generator, {
      forwardOptions: false,
      ...options,
      generatorOptions: {
        ...this.options,
        positionalArguments: undefined,
        ...options?.generatorOptions,
      } as any,
    });
  }

  /**
   * Compose with a jhipster generator using default jhipster config, but queue it immediately.
   */
  async dependsOnJHipster(generator: string, options?: ComposeOptions<BaseApplicationGenerator>) {
    return this.composeWithJHipster(generator, {
      ...options,
      schedule: false,
    });
  }

  /**
   * Remove File
   */
  removeFile(...path: string[]): string {
    const destinationFile = this.destinationPath(...path);
    const relativePath = relative((this.env as any).logCwd, destinationFile);
    // Delete from memory fs to keep updated.
    this.fs.delete(destinationFile);
    try {
      if (destinationFile && statSync(destinationFile).isFile()) {
        this.log.info(`Removing legacy file ${relativePath}`);
        rmSync(destinationFile, { force: true });
      }
    } catch {
      this.log.info(`Could not remove legacy file ${relativePath}`);
    }
    return destinationFile;
  }

  /**
   * Remove Folder
   * @param path
   */
  removeFolder(...path: string[]): void {
    const destinationFolder = this.destinationPath(...path);
    const relativePath = relative((this.env as any).logCwd, destinationFolder);
    // Delete from memory fs to keep updated.
    this.fs.delete(`${destinationFolder}/**`);
    try {
      if (statSync(destinationFolder).isDirectory()) {
        this.log.info(`Removing legacy folder ${relativePath}`);
        rmSync(destinationFolder, { recursive: true });
      }
    } catch {
      this.log.log(`Could not remove folder ${destinationFolder}`);
    }
  }

  /**
   * Fetch files from the generator-jhipster instance installed
   */
  fetchFromInstalledJHipster(...path: string[]): string {
    if (path) {
      return joinPath(__dirname, '..', ...path);
    }
    return path;
  }

  /**
   * Utility function to write file.
   *
   * @param source
   * @param destination - destination
   * @param data - template data
   * @param options - options passed to ejs render
   * @param copyOptions
   */
  writeFile(source: string, destination: string, data: TemplateData = this, options?: TemplateOptions, copyOptions: CopyOptions = {}) {
    // Convert to any because ejs types doesn't support string[] https://github.com/DefinitelyTyped/DefinitelyTyped/pull/63315

    const root: any = this.jhipsterTemplatesFolders ?? this.templatePath();
    try {
      return this.renderTemplate(source, destination, data, { root, ...options }, { noGlob: true, ...copyOptions });
    } catch (error) {
      throw new Error(`Error writing file ${source} to ${destination}: ${error}`, { cause: error });
    }
  }

  /**
   * write the given files using provided options.
   */
  async writeFiles<DataType = any>(options: WriteFileOptions<DataType, this>): Promise<string[]> {
    const paramCount = Object.keys(options).filter(key => ['sections', 'blocks', 'templates'].includes(key)).length;
    assert(paramCount > 0, 'One of sections, blocks or templates is required');
    assert(paramCount === 1, 'Only one of sections, blocks or templates must be provided');

    const { context = {} } = options;
    const { rootTemplatesPath, customizeTemplatePath = file => file, transform: methodTransform = [] } = options;
    const startTime = new Date().getMilliseconds();
    const { customizeTemplatePaths: contextCustomizeTemplatePaths = [] } = context as BaseApplication;

    const { jhipster7Migration } = this.getFeatures();
    const templateData = jhipster7Migration
      ? createJHipster7Context(this, context, { log: jhipster7Migration === 'verbose' ? msg => this.log.info(msg) : () => {} })
      : context;

    /* Build lookup order first has preference.
     * Example
     * rootTemplatesPath = ['reactive', 'common']
     * jhipsterTemplatesFolders = ['/.../generator-jhispter-blueprint/server/templates', '/.../generator-jhispter/server/templates']
     *
     * /.../generator-jhispter-blueprint/server/templates/reactive/templatePath
     * /.../generator-jhispter-blueprint/server/templates/common/templatePath
     * /.../generator-jhispter/server/templates/reactive/templatePath
     * /.../generator-jhispter/server/templates/common/templatePath
     */
    let rootTemplatesAbsolutePath;
    if (!rootTemplatesPath) {
      rootTemplatesAbsolutePath = (this as any).jhipsterTemplatesFolders;
    } else if (typeof rootTemplatesPath === 'string' && isAbsolute(rootTemplatesPath)) {
      rootTemplatesAbsolutePath = rootTemplatesPath;
    } else {
      rootTemplatesAbsolutePath = (this as any).jhipsterTemplatesFolders
        .map(templateFolder => ([] as string[]).concat(rootTemplatesPath).map(relativePath => join(templateFolder, relativePath)))
        .flat();
    }

    const normalizeEjs = file => file.replace('.ejs', '');
    const resolveCallback = (maybeCallback, fallback?) => {
      if (maybeCallback === undefined) {
        if (typeof fallback === 'function') {
          return resolveCallback(fallback);
        }
        return fallback;
      }
      if (typeof maybeCallback === 'boolean' || typeof maybeCallback === 'string') {
        return maybeCallback;
      }
      if (typeof maybeCallback === 'function') {
        return (maybeCallback as any).call(this, templateData) || false;
      }
      throw new Error(`Type not supported ${maybeCallback}`);
    };

    type RenderTemplateParam = {
      condition?: boolean;
      sourceFile: string;
      destinationFile: string;
      options?: { renderOptions?: any };
      noEjs?: boolean;
      transform?: any[];
      binary?: boolean;
    };

    const renderTemplate = async ({ condition, sourceFile, destinationFile, options, noEjs, transform, binary }: RenderTemplateParam) => {
      if (condition !== undefined && !resolveCallback(condition, true)) {
        return undefined;
      }
      const extension = extname(sourceFile);
      const isBinary = binary || ['.png', '.jpg', '.gif', '.svg', '.ico'].includes(extension);
      const appendEjs = noEjs === undefined ? !isBinary && extension !== '.ejs' : !noEjs;
      let targetFile;
      if (typeof destinationFile === 'function') {
        targetFile = resolveCallback(destinationFile);
      } else {
        targetFile = appendEjs ? normalizeEjs(destinationFile) : destinationFile;
      }

      let sourceFileFrom;
      if (Array.isArray(rootTemplatesAbsolutePath)) {
        // Look for existing templates
        let existingTemplates = rootTemplatesAbsolutePath
          .map(rootPath => this.templatePath(rootPath, sourceFile))
          .filter(templateFile => existsSync(appendEjs ? `${templateFile}.ejs` : templateFile));

        if (existingTemplates.length === 0 && jhipster7Migration) {
          existingTemplates = rootTemplatesAbsolutePath
            .map(rootPath => this.templatePath(rootPath, appendEjs ? sourceFile : `${sourceFile}.ejs`))
            .filter(templateFile => existsSync(templateFile));
        }

        if (existingTemplates.length > 1) {
          const moreThanOneMessage = `Multiples templates were found for file ${sourceFile}, using the first
templates: ${JSON.stringify(existingTemplates, null, 2)}`;
          if (existingTemplates.length > 2) {
            this.log.warn(`Possible blueprint conflict detected: ${moreThanOneMessage}`);
          } else {
            this.log.debug(moreThanOneMessage);
          }
        }
        sourceFileFrom = existingTemplates.shift();
      } else if (typeof rootTemplatesAbsolutePath === 'string') {
        sourceFileFrom = this.templatePath(rootTemplatesAbsolutePath, sourceFile);
      } else {
        sourceFileFrom = this.templatePath(sourceFile);
      }

      const file = customizeTemplatePath.call(this, { sourceFile, resolvedSourceFile: sourceFileFrom, destinationFile: targetFile });
      if (!file) {
        return undefined;
      }
      sourceFileFrom = file.resolvedSourceFile;
      targetFile = file.destinationFile;

      let templatesRoots: string[] = [].concat(rootTemplatesAbsolutePath);
      for (const contextCustomizeTemplatePath of contextCustomizeTemplatePaths) {
        const file = contextCustomizeTemplatePath.call(
          this,
          {
            namespace: this.options.namespace,
            sourceFile,
            resolvedSourceFile: sourceFileFrom,
            destinationFile: targetFile,
            templatesRoots,
          },
          context,
        );
        if (!file) {
          return undefined;
        }
        sourceFileFrom = file.resolvedSourceFile;
        targetFile = file.destinationFile;
        templatesRoots = file.templatesRoots;
      }

      if (sourceFileFrom === undefined) {
        throw new Error(`Template file ${sourceFile} was not found at ${rootTemplatesAbsolutePath}`);
      }

      try {
        if (!appendEjs && extname(sourceFileFrom) !== '.ejs') {
          await (this as any).copyTemplateAsync(sourceFileFrom, targetFile);
        } else {
          let useAsync = true;
          if (context.entityClass) {
            if (!context.baseName) {
              throw new Error('baseName is required at templates context');
            }
            const sourceBasename = basename(sourceFileFrom);
            const seed = `${context.entityClass}-${sourceBasename}${context.fakerSeed ?? ''}`;
            Object.values((this.sharedData as any).getApplication()?.sharedEntities ?? {}).forEach((entity: any) => {
              entity.resetFakerSeed(seed);
            });
            // Async calls will make the render method to be scheduled, allowing the faker key to change in the meantime.
            useAsync = false;
          }

          const renderOptions = {
            ...(options?.renderOptions ?? {}),
            // Set root for ejs to lookup for partials.
            root: templatesRoots,
            // ejs caching cause problem https://github.com/jhipster/generator-jhipster/pull/20757
            cache: false,
          };
          const copyOptions = { noGlob: true };
          if (appendEjs) {
            sourceFileFrom = `${sourceFileFrom}.ejs`;
          }
          if (useAsync) {
            await (this as any).renderTemplateAsync(sourceFileFrom, targetFile, templateData, renderOptions, copyOptions);
          } else {
            (this as any).renderTemplate(sourceFileFrom, targetFile, templateData, renderOptions, copyOptions);
          }
        }
      } catch (error) {
        throw new Error(`Error rendering template ${sourceFileFrom} to ${targetFile}: ${error}`, { cause: error });
      }
      if (!isBinary && transform?.length) {
        this.editFile(targetFile, ...transform);
      }
      return targetFile;
    };

    let parsedTemplates: RenderTemplateParam[];
    if ('sections' in options || 'blocks' in options) {
      const sectionTransform = 'sections' in options ? (options.sections._?.transform ?? []) : [];

      parsedTemplates = ('sections' in options ? convertWriteFileSectionsToBlocks<DataType, this>(options.sections) : options.blocks)
        .map((block, blockIdx) => {
          const {
            path: blockPathValue = './',
            from: blockFromCallback,
            to: blockToCallback,
            condition: blockConditionCallback,
            transform: blockTransform = [],
            renameTo: blockRenameTo,
          } = block;

          // Temporary variable added to identify section/block
          const blockSpecPath: string = 'blockSpecPath' in block ? (block.blockSpecPath as string) : `${blockIdx}`;

          assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
          assert(Array.isArray(block.templates), `Block templates must be an array for ${blockSpecPath}`);
          const condition = resolveCallback(blockConditionCallback);
          if (condition !== undefined && !condition) {
            return undefined;
          }
          if (typeof blockPathValue === 'function') {
            throw new Error(`Block path should be static for ${blockSpecPath}`);
          }
          const blockPath = resolveCallback(blockFromCallback, blockPathValue);
          const blockTo = resolveCallback(blockToCallback, blockPath) || blockPath;
          return block.templates.map((fileSpec, fileIdx) => {
            const fileSpecPath = `${blockSpecPath}[${fileIdx}]`;
            assert(
              typeof fileSpec === 'object' || typeof fileSpec === 'string' || typeof fileSpec === 'function',
              `File must be an object, a string or a function for ${fileSpecPath}`,
            );
            if (typeof fileSpec === 'function') {
              fileSpec = fileSpec.call(this, context);
            }
            let noEjs: boolean | undefined;
            let derivedTransform;
            if (typeof blockTransform === 'boolean') {
              noEjs = !blockTransform;
              derivedTransform = [...methodTransform, ...sectionTransform];
            } else {
              derivedTransform = [...methodTransform, ...sectionTransform, ...blockTransform];
            }
            if (typeof fileSpec === 'string') {
              const sourceFile = join(blockPath, fileSpec);
              let destinationFile;
              if (blockRenameTo) {
                destinationFile = this.destinationPath(blockRenameTo.call(this, context, fileSpec));
              } else {
                destinationFile = this.destinationPath(blockTo, fileSpec);
              }
              return { sourceFile, destinationFile, noEjs, transform: derivedTransform };
            }

            const { condition, options, file, renameTo, transform: fileTransform = [], binary } = fileSpec;
            let { sourceFile, destinationFile } = fileSpec;

            if (typeof fileTransform === 'boolean') {
              noEjs = !fileTransform;
            } else if (Array.isArray(fileTransform)) {
              derivedTransform = [...derivedTransform, ...fileTransform];
            } else if (fileTransform !== undefined) {
              throw new Error(`Transform ${fileTransform} value is not supported`);
            }

            const normalizedFile = resolveCallback(sourceFile || file);
            sourceFile = join(blockPath, normalizedFile);
            destinationFile = join(resolveCallback(destinationFile || renameTo, normalizedFile));
            if (blockRenameTo) {
              destinationFile = this.destinationPath(blockRenameTo.call(this, context, destinationFile));
            } else {
              destinationFile = this.destinationPath(blockTo, destinationFile);
            }

            const override = resolveCallback(fileSpec.override);
            if (override !== undefined && !override && (this as any).fs.exists(destinationFile.replace(/\.jhi$/, ''))) {
              this.log.debug(`skipping file ${destinationFile}`);
              return undefined;
            }

            return {
              condition,
              sourceFile,
              destinationFile,
              options,
              transform: derivedTransform,
              noEjs,
              binary,
            };
          });
        })
        .flat()
        .filter(template => template) as RenderTemplateParam[];
    } else {
      parsedTemplates = options.templates.map(template => {
        if (typeof template === 'string') {
          return { sourceFile: template, destinationFile: template };
        }
        return template;
      }) as RenderTemplateParam[];
    }

    const files = await Promise.all(parsedTemplates.map(template => renderTemplate(template)).filter(Boolean));
    this.log.debug(`Time taken to write files: ${new Date().getMilliseconds() - startTime}ms`);
    return files.filter(file => file);
  }

  /**
   * Edit file content.
   * Edits an empty file if `options.create` is truthy or no callback is passed.
   * @example
   * // Throws if `foo.txt` doesn't exists or append the content.
   * editFile('foo.txt', content => content + 'foo.txt content');
   * @example
   * // Appends `foo.txt` content if whether exists or not.
   * editFile('foo.txt', { create: true }, content => content + 'foo.txt content');
   * @example
   * // Appends `foo.txt` content if whether exists or not using the returned cascaded callback.
   * editFile('foo.txt')(content => content + 'foo.txt content');
   */
  editFile(file: string, ...transformCallbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this>;
  editFile(file: string, options: EditFileOptions, ...transformCallbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this>;

  editFile(
    file: string,
    options?: EditFileOptions | EditFileCallback<this>,
    ...transformCallbacks: EditFileCallback<this>[]
  ): CascatedEditFileCallback<this> {
    let actualOptions: EditFileOptions;
    if (typeof options === 'function') {
      transformCallbacks = [options, ...transformCallbacks];
      actualOptions = {};
    } else if (options === undefined) {
      actualOptions = {};
    } else {
      actualOptions = options;
    }
    let filePath = this.destinationPath(file);
    if (!this.env.sharedFs.existsInMemory(filePath) && this.env.sharedFs.existsInMemory(`${filePath}.jhi`)) {
      filePath = `${filePath}.jhi`;
    }

    let originalContent;
    try {
      originalContent = this.readDestination(filePath);
    } catch {
      // null return should be treated like an error.
    }

    if (!originalContent) {
      const { ignoreNonExisting, create } = actualOptions;
      const errorMessage = typeof ignoreNonExisting === 'string' ? ` ${ignoreNonExisting}.` : '';
      if (!create || transformCallbacks.length === 0) {
        if (ignoreNonExisting || this.ignoreNeedlesError) {
          this.log(`${chalk.yellow('\nUnable to find ')}${filePath}.${chalk.yellow(errorMessage)}\n`);
          // return a noop.
          const noop = () => noop;
          return noop;
        }
        throw new Error(`Unable to find ${filePath}. ${errorMessage}`);
      }
      // allow to edit non existing files
      originalContent = '';
    }

    let newContent = originalContent;
    const writeCallback = (...callbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this> => {
      const { autoCrlf = this.jhipsterConfigWithDefaults.autoCrlf, assertModified } = actualOptions;
      try {
        const fileHasCrlf = autoCrlf && hasCrlr(newContent);
        newContent = joinCallbacks(...callbacks).call(this, fileHasCrlf ? normalizeLineEndings(newContent, LF) : newContent, filePath);
        if (assertModified && originalContent === newContent) {
          const errorMessage = `${chalk.yellow('Fail to modify ')}${filePath}.`;
          if (!this.ignoreNeedlesError) {
            throw new Error(errorMessage);
          }
          this.log(errorMessage);
        }
        this.writeDestination(filePath, fileHasCrlf ? normalizeLineEndings(newContent, CRLF) : newContent);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error editing file ${filePath}: ${error.message} at ${error.stack}`);
        }
        throw new Error(`Unknown Error ${error}`);
      }
      return writeCallback;
    };

    return writeCallback(...transformCallbacks);
  }

  /**
   * Convert value to a yaml and write to destination
   */
  writeDestinationYaml(filepath: string, value: Record<string | number, any>) {
    this.writeDestination(filepath, stringifyYaml(value));
  }

  /**
   * Merge value to an existing yaml and write to destination
   * Removes every comment (due to parsing/merging process) except the at the top of the file.
   */
  mergeDestinationYaml(filepath: string, value: Record<string | number, any>) {
    this.editFile(filepath, content => {
      const lines = content.split('\n');
      const headerComments: string[] = [];
      lines.find(line => {
        if (line.startsWith('#')) {
          headerComments.push(line);
          return false;
        }
        return true;
      });

      const mergedContent = stringifyYaml(deepMerge(parseYaml(content), value));
      const header = headerComments.length > 0 ? headerComments.join('\n').concat('\n') : '';
      return `${header}${mergedContent}`;
    });
  }

  /**
   * Merge value to an existing json and write to destination
   */
  mergeDestinationJson(filepath: string, value: Record<string | number, any>) {
    this.editFile(filepath, { create: true }, content => JSON.stringify(merge(content ? JSON.parse(content) : {}, value), null, 2));
  }

  /**
   * Shallow clone or convert dependencies to placeholder if needed.
   */
  prepareDependencies(
    map: Record<string, string>,
    valuePlaceholder?: 'java' | 'docker' | ((value: string) => string),
  ): Record<string, string> {
    let placeholder: (value: string) => string;
    if (valuePlaceholder === 'java') {
      placeholder = value => `'${kebabCase(value).toUpperCase()}-VERSION'`;
    } else if (valuePlaceholder === 'docker') {
      placeholder = dockerPlaceholderGenerator;
    } else {
      placeholder = valuePlaceholder ?? (value => `${snakeCase(value).toUpperCase()}_VERSION`);
    }
    if (this.useVersionPlaceholders) {
      return Object.fromEntries(Object.keys(map).map(dep => [dep, placeholder(dep)]));
    }
    return {
      ...map,
    };
  }

  loadNodeDependencies(destination: Record<string, string>, source: Record<string, string>): void {
    Object.assign(destination, this.prepareDependencies(source));
  }

  /**
   * Load Java dependencies from a gradle catalog file.
   * @param javaDependencies
   * @param gradleCatalog Gradle catalog file path, true for generator-jhipster's generator catalog of falsy for blueprint catalog
   */
  loadJavaDependenciesFromGradleCatalog(javaDependencies: Record<string, string>, gradleCatalogFile?: string): void;
  loadJavaDependenciesFromGradleCatalog(javaDependencies: Record<string, string>, mainGenerator: boolean): void;
  loadJavaDependenciesFromGradleCatalog(javaDependencies: Record<string, string>, gradleCatalog?: string | boolean): void {
    if (typeof gradleCatalog !== 'string') {
      const tomlFile = '../resources/gradle/libs.versions.toml';
      gradleCatalog = gradleCatalog ? this.jhipsterTemplatePath(tomlFile) : this.templatePath(tomlFile);
    }

    const gradleLibsVersions = this.readTemplate(gradleCatalog)?.toString();
    if (gradleLibsVersions) {
      Object.assign(javaDependencies, this.prepareDependencies(getGradleLibsVersionsProperties(gradleLibsVersions), 'java'));
    }
  }

  loadNodeDependenciesFromPackageJson(
    destination: Record<string, string>,
    packageJsonFile: string = this.templatePath('../resources/package.json'),
  ): void {
    const { devDependencies, dependencies } = this.fs.readJSON(packageJsonFile, {});
    this.loadNodeDependencies(destination, { ...devDependencies, ...dependencies });
  }

  /**
   * Print ValidationResult info/warnings or throw result Error.
   */
  validateResult(result: ValidationResult, { throwOnError = true } = {}) {
    // Don't print check info by default for cleaner outputs.
    if (result.debug) {
      if (Array.isArray(result.debug)) {
        for (const debug of result.debug) {
          this.log.debug(debug);
        }
      } else {
        this.log.debug(result.debug);
      }
    }
    if (result.info) {
      if (Array.isArray(result.info)) {
        for (const info of result.info) {
          this.log.info(info);
        }
      } else {
        this.log.info(result.info);
      }
    }
    if (result.warning) {
      if (Array.isArray(result.warning)) {
        for (const warning of result.warning) {
          this.log.warn(warning);
        }
      } else {
        this.log.warn(result.warning);
      }
    }
    if (result.error) {
      if (Array.isArray(result.error)) {
        if (throwOnError && result.error.length > 0) {
          throw new Error(result.error[0]);
        }
        for (const error of result.error) {
          this.log.warn(error);
        }
      } else if (throwOnError) {
        throw new Error(result.error);
      } else {
        this.log.warn(result.error);
      }
    }
  }

  /**
   * Checks if there is a newer JHipster version available.
   */
  protected async checkForNewVersion() {
    try {
      const latestJhipster = await latestVersion(GENERATOR_JHIPSTER);
      if (semver.lt(packageJson.version, latestJhipster)) {
        this.log.warn(
          `${
            chalk.yellow(' ______________________________________________________________________________\n\n') +
            chalk.yellow('  JHipster update available: ') +
            chalk.green.bold(latestJhipster) +
            chalk.gray(` (current: ${packageJson.version})`)
          }\n`,
        );
        this.log.log(chalk.yellow(`  Run ${chalk.magenta(`npm install -g ${GENERATOR_JHIPSTER}`)} to update.\n`));
        this.log.log(chalk.yellow(' ______________________________________________________________________________\n'));
      }
    } catch {
      // Ignore error
    }
  }

  /**
   * Create a simple-git instance using current destinationPath as baseDir.
   */
  createGit(options?: Parameters<typeof simpleGit>[0]) {
    return simpleGit({ baseDir: this.destinationPath(), ...options }).env({
      ...process.env,
      LANG: 'en',
    });
  }

  protected getSharedApplication() {
    return this.sharedData.getApplication();
  }

  private createSharedData(): SharedData {
    const application = this.getContextData(`jhipster:shared-data`, { factory: () => ({}) });

    const { ignoreNeedlesError } = this.options;

    return new SharedData(
      application,
      { destinationPath: this.destinationPath(), memFs: this.env.sharedFs, log: this.log, logCwd: this.env.logCwd },
      { ignoreNeedlesError },
    );
  }
}
