/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { basename, join as joinPath, dirname, relative, isAbsolute, join, extname } from 'path';
import { relative as posixRelative } from 'path/posix';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { statSync, rmSync, existsSync, readFileSync } from 'fs';
import assert from 'assert';
import { requireNamespace } from '@yeoman/namespace';
import { GeneratorMeta } from '@yeoman/types';
import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { kebabCase, snakeCase, merge, get, set } from 'lodash-es';
import { simpleGit } from 'simple-git';
import type { CopyOptions } from 'mem-fs-editor';
import type { Data as TemplateData, Options as TemplateOptions } from 'ejs';
import semver, { lt as semverLessThan } from 'semver';
import YeomanGenerator, { type ComposeOptions, type Storage } from 'yeoman-generator';
import type Environment from 'yeoman-environment';
import latestVersion from 'latest-version';
import SharedData from '../base/shared-data.js';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, PRIORITY_PREFIX } from '../base/priorities.js';
import { createJHipster7Context, formatDateForChangelog, joinCallbacks, Logger } from '../base/support/index.js';

import type {
  JHipsterGeneratorOptions,
  JHipsterGeneratorFeatures,
  EditFileCallback,
  EditFileOptions,
  CascatedEditFileCallback,
  JHipsterOptions,
  ValidationResult,
  WriteFileOptions,
  JHipsterArguments,
  JHipsterConfigs,
  JHipsterCommandDefinition,
} from '../base/api.js';
import { packageJson } from '../../lib/index.js';
import { CommonClientServerApplication, type BaseApplication } from '../base-application/types.js';
import { GENERATOR_BOOTSTRAP } from '../generator-list.js';
import NeedleApi from '../needle-api.js';
import command from '../base/command.js';
import { GENERATOR_JHIPSTER, YO_RC_FILE } from '../generator-constants.js';
import { convertConfigToOption } from '../../lib/internal/index.js';
import { getGradleLibsVersionsProperties } from '../gradle/support/dependabot-gradle.js';
import { dockerPlaceholderGenerator } from '../docker/utils.js';

const {
  INITIALIZING,
  PROMPTING,
  CONFIGURING,
  COMPOSING,
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

/**
 * This is the base class for a generator for every generator.
 */
export default class CoreGenerator extends YeomanGenerator<JHipsterGeneratorOptions, JHipsterGeneratorFeatures> {
  static asPriority = asPriority;

  static INITIALIZING = asPriority(INITIALIZING);

  static PROMPTING = asPriority(PROMPTING);

  static CONFIGURING = asPriority(CONFIGURING);

  static COMPOSING = asPriority(COMPOSING);

  static LOADING = asPriority(LOADING);

  static PREPARING = asPriority(PREPARING);

  static POST_PREPARING = asPriority(POST_PREPARING);

  static DEFAULT = asPriority(DEFAULT);

  static WRITING = asPriority(WRITING);

  static POST_WRITING = asPriority(POST_WRITING);

  static INSTALL = asPriority(INSTALL);

  static POST_INSTALL = asPriority(POST_INSTALL);

  static END = asPriority(END);

  useVersionPlaceholders?: boolean;
  skipChecks?: boolean;
  experimental?: boolean;
  debugEnabled?: boolean;
  jhipster7Migration?: boolean;
  relativeDir = relativeDir;
  relative = posixRelative;

  readonly sharedData!: SharedData<CommonClientServerApplication>;
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

    let jhipsterOldVersion = null;
    if (!this.options.help) {
      /* Force config to use 'generator-jhipster' namespace. */
      this._config = this._getStorage('generator-jhipster');

      /* JHipster config using proxy mode used as a plain object instead of using get/set. */
      this.jhipsterConfig = this.config.createProxy();

      jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion ?? null;
      this.sharedData = this.createSharedData({ jhipsterOldVersion, help: this.options.help }) as any;

      /* Options parsing must be executed after forcing jhipster storage namespace and after sharedData have been populated */
      this.parseJHipsterOptions(command.options);

      // Don't write jhipsterVersion to .yo-rc.json when reproducible
      if (
        this.options.namespace.startsWith('jhipster:') &&
        !this.options.namespace.startsWith('jhipster:bootstrap') &&
        this.getFeatures().storeJHipsterVersion !== false &&
        !this.options.reproducibleTests &&
        !this.jhipsterConfig.jhipsterVersion
      ) {
        this.jhipsterConfig.jhipsterVersion = packageJson.version;
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
    this.jhipster7Migration = this.features.jhipster7Migration ?? false;
  }

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage(): string {
    return super.usage().replace('yo jhipster:', 'jhipster ');
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
  isJhipsterVersionLessThan(version) {
    const jhipsterOldVersion = this.sharedData.getControl().jhipsterOldVersion;
    if (!jhipsterOldVersion) {
      // if old version is unknown then can't compare (the project may be null) and return false
      return false;
    }
    return semverLessThan(jhipsterOldVersion, version);
  }

  /**
   * Get arguments for the priority
   */
  getArgsForPriority(priorityName: string) {
    const control = this.sharedData.getControl();
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
   * Override yeoman-generator method that gets methods to be queued, filtering the result.
   */
  getTaskNames(): string[] {
    let priorities = super.getTaskNames();
    if (!this.features.disableSkipPriorities && this.options.skipPriorities) {
      // Make sure yeoman-generator will not throw on empty tasks due to filtered priorities.
      this.customLifecycle = priorities.length > 0;
      priorities = priorities.filter(priorityName => !this.options.skipPriorities!.includes(priorityName));
    }
    return priorities;
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
    this.parseJHipsterCommand(generatorCommand!);
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
    return this.prompt(this.prepareQuestions(generatorCommand.configs));
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

    const config = (this as any).jhipsterConfigWithDefaults;
    Object.entries(generatorCommand.configs).forEach(([name, def]) => {
      if (def.scope === 'storage') {
        context[name] = context[name] ?? config?.[name] ?? this.config.get(name) ?? def.default;
      }
      if (def.scope === 'generator') {
        context[name] = context[name] ?? this[name] ?? def.default;
      }
      if (def.scope === 'blueprint') {
        context[name] = context[name] ?? this.blueprintStorage?.get(name) ?? def.default;
      }
    });
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
      this.parseJHipsterArguments(
        Object.fromEntries(
          Object.entries(commandDef.configs as Record<string, any>)
            .filter(([_name, def]) => def.argument)
            .map(([name, def]) => [
              name,
              {
                description: def.description,
                ...def.argument,
              },
            ]),
        ) as any,
      );
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
            this.sharedData.getControl()[optionName] = optionValue;
          } else if (optionDesc.scope === 'generator') {
            this[optionName] = optionValue;
          } else {
            throw new Error(`Scope ${optionDesc.scope} not supported`);
          }
        } else if (optionDesc.default && optionDesc.scope === 'generator' && this[optionName] === undefined) {
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
          argument = positionalArguments.shift();
        } else {
          // Varags argument.
          argument = positionalArguments;
          positionalArguments = [];
        }
        if (argument !== undefined) {
          const convertedValue = !argumentDef.type || argumentDef.type === Array ? argument : argumentDef.type(argument as any);
          if ((argumentDef.scope ?? 'generator') === 'generator') {
            this[argumentName] = convertedValue;
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
        const promptSpec = typeof def.prompt === 'function' ? def.prompt(this) : { ...def.prompt };
        let storage: any;
        if ((def.scope ?? 'storage') === 'storage') {
          storage = this.config;
          if (promptSpec.default === undefined) {
            promptSpec.default = () => (this as any).jhipsterConfigWithDefaults?.[name];
          }
        } else if (def.scope === 'blueprint') {
          storage = this.blueprintStorage;
        } else if (def.scope === 'generator') {
          storage = {
            getPath: path => get(this, path),
            setPath: (path, value) => set(this, path, value),
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
  dateFormatForLiquibase(reproducible?: boolean) {
    const control = this.sharedData.getControl();
    reproducible = reproducible ?? control.reproducible;
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
        const newCreationTimestamp = creationTimestamp ?? this.config.get('creationTimestamp');
        now = newCreationTimestamp ? new Date(newCreationTimestamp as any) : now;
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
  jhipsterTemplatePath(...path: string[]) {
    let existingGenerator: string;
    try {
      existingGenerator = this._jhipsterGenerator ?? requireNamespace(this.options.namespace).generator;
    } catch (error) {
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
  async composeWithJHipster(generator: string, options?: ComposeOptions) {
    assert(typeof generator === 'string', 'generator should to be a string');
    if (!isAbsolute(generator)) {
      const namespace = generator.includes(':') ? generator : `jhipster:${generator}`;
      if (await this.env.get(namespace)) {
        generator = namespace;
      } else {
        // Keep test compatibility were jhipster lookup does not run.
        const found = ['/index.js', '/index.cjs', '/index.mjs', '/index.ts', '/index.cts', '/index.mts'].find(extension => {
          const pathToLook = join(__dirname, `../${generator}${extension}`);
          return existsSync(pathToLook) ? pathToLook : undefined;
        });
        if (!found) {
          throw new Error(`Generator ${generator} was not found`);
        }
        generator = join(__dirname, `../${generator}${found}`);
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
  async dependsOnJHipster(generator: string, options?: ComposeOptions) {
    return this.composeWithJHipster(generator, {
      ...options,
      schedule: false,
    });
  }

  /**
   * Remove File
   * @param file
   */
  removeFile(...path: string[]) {
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
  removeFolder(...path: string[]) {
    const destinationFolder = this.destinationPath(...path);
    const relativePath = relative((this.env as any).logCwd, destinationFolder);
    // Delete from memory fs to keep updated.
    this.fs.delete(`${destinationFolder}/**`);
    try {
      if (statSync(destinationFolder).isDirectory()) {
        this.log.info(`Removing legacy folder ${relativePath}`);
        rmSync(destinationFolder, { recursive: true });
      }
    } catch (error) {
      this.log.log(`Could not remove folder ${destinationFolder}`);
    }
  }

  /**
   * Fetch files from the generator-jhipster instance installed
   */
  fetchFromInstalledJHipster(...path: string[]) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root: any = this.jhipsterTemplatesFolders ?? this.templatePath();
    return this.renderTemplate(source, destination, data, { root, ...options }, { noGlob: true, ...copyOptions });
  }

  /**
   * write the given files using provided options.
   */
  async writeFiles<DataType = any>(options: WriteFileOptions<this, DataType>): Promise<string[]> {
    const paramCount = Object.keys(options).filter(key => ['sections', 'blocks', 'templates'].includes(key)).length;
    assert(paramCount > 0, 'One of sections, blocks or templates is required');
    assert(paramCount === 1, 'Only one of sections, blocks or templates must be provided');

    const { sections, blocks, templates, rootTemplatesPath, context = this, transform: methodTransform = [] } = options as any;
    const { _: commonSpec = {} } = sections || {};
    const { transform: sectionTransform = [] } = commonSpec;
    const startTime = new Date().getMilliseconds();

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
        .map(templateFolder => [].concat(rootTemplatesPath).map(relativePath => join(templateFolder, relativePath)))
        .flat();
    }

    const normalizeEjs = file => file.replace('.ejs', '');
    const resolveCallback = (val, fallback?) => {
      if (val === undefined) {
        if (typeof fallback === 'function') {
          return resolveCallback(fallback);
        }
        return fallback;
      }
      if (typeof val === 'boolean' || typeof val === 'string') {
        return val;
      }
      if (typeof val === 'function') {
        return val.call(this, context) || false;
      }
      throw new Error(`Type not supported ${val}`);
    };

    const renderTemplate = async ({ sourceFile, destinationFile, options, noEjs, transform, binary }) => {
      const extension = extname(sourceFile);
      const isBinary = binary || ['.png', '.jpg', '.gif', '.svg', '.ico'].includes(extension);
      const appendEjs = noEjs === undefined ? !isBinary && extension !== '.ejs' : !noEjs;
      const ejsFile = appendEjs || extension === '.ejs';
      let targetFile;
      if (typeof destinationFile === 'function') {
        targetFile = resolveCallback(destinationFile);
      } else {
        targetFile = appendEjs ? normalizeEjs(destinationFile) : destinationFile;
      }

      let sourceFileFrom;
      if (Array.isArray(rootTemplatesAbsolutePath)) {
        // Look for existing templates
        const existingTemplates = rootTemplatesAbsolutePath
          .map(rootPath => this.templatePath(rootPath, sourceFile))
          .filter(templateFile => existsSync(appendEjs ? `${templateFile}.ejs` : templateFile));

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

        if (sourceFileFrom === undefined) {
          throw new Error(`Template file ${sourceFile} was not found at ${rootTemplatesAbsolutePath}`);
        }
      } else if (typeof rootTemplatesAbsolutePath === 'string') {
        sourceFileFrom = this.templatePath(rootTemplatesAbsolutePath, sourceFile);
      } else {
        sourceFileFrom = this.templatePath(sourceFile);
      }
      if (appendEjs) {
        sourceFileFrom = `${sourceFileFrom}.ejs`;
      }

      if (!ejsFile) {
        await (this as any).copyTemplateAsync(sourceFileFrom, targetFile);
      } else {
        let useAsync = true;
        if (context.entityClass) {
          if (!context.baseName) {
            throw new Error('baseName is require at templates context');
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
          root: rootTemplatesAbsolutePath,
          // ejs caching cause problem https://github.com/jhipster/generator-jhipster/pull/20757
          cache: false,
        };
        const copyOptions = { noGlob: true };
        // TODO drop for v8 final release
        const data = (this as any).jhipster7Migration ? createJHipster7Context(this, context, { ignoreWarnings: true }) : context;
        if (useAsync) {
          await (this as any).renderTemplateAsync(sourceFileFrom, targetFile, data, renderOptions, copyOptions);
        } else {
          (this as any).renderTemplate(sourceFileFrom, targetFile, data, renderOptions, copyOptions);
        }
      }
      if (!isBinary && transform && transform.length) {
        (this as any).editFile(targetFile, ...transform);
      }
      return targetFile;
    };

    let parsedBlocks = blocks;
    if (sections) {
      assert(typeof sections === 'object', 'sections must be an object');
      const parsedSections = Object.entries(sections)
        .map(([sectionName, sectionBlocks]) => {
          if (sectionName.startsWith('_')) return undefined;
          assert(Array.isArray(sectionBlocks), `Section must be an array for ${sectionName}`);
          return { sectionName, sectionBlocks };
        })
        .filter(Boolean);

      parsedBlocks = parsedSections
        .map(({ sectionName, sectionBlocks }: any) => {
          return sectionBlocks.map((block, blockIdx) => {
            const blockSpecPath = `${sectionName}[${blockIdx}]`;
            assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
            return { blockSpecPath, ...block };
          });
        })
        .flat();
    }

    let parsedTemplates;
    if (parsedBlocks) {
      parsedTemplates = parsedBlocks
        .map((block, blockIdx) => {
          const {
            blockSpecPath = `${blockIdx}`,
            path: blockPathValue = './',
            from: blockFromCallback,
            to: blockToCallback,
            condition: blockConditionCallback,
            transform: blockTransform = [],
            renameTo: blockRenameTo,
          } = block;
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
            let { noEjs } = fileSpec;
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
                destinationFile = this.destinationPath(blockRenameTo.call(this, context, fileSpec, this));
              } else {
                destinationFile = this.destinationPath(blockTo, fileSpec);
              }
              return { sourceFile, destinationFile, noEjs, transform: derivedTransform };
            }

            const { options, file, renameTo, transform: fileTransform = [], binary } = fileSpec;
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
            destinationFile = this.destinationPath(blockTo, join(resolveCallback(destinationFile || renameTo, normalizedFile)));

            const override = resolveCallback(fileSpec.override);
            if (override !== undefined && !override && (this as any).fs.exists(destinationFile)) {
              this.log.debug(`skipping file ${destinationFile}`);
              return undefined;
            }

            // TODO remove for jhipster 8
            if (noEjs === undefined) {
              const { method } = fileSpec;
              if (method === 'copy') {
                noEjs = true;
              }
            }

            return {
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
        .filter(template => template);
    } else {
      parsedTemplates = templates.map(template => {
        if (typeof template === 'string') {
          return { sourceFile: template, destinationFile: template };
        }
        return template;
      });
    }

    const files = await Promise.all(parsedTemplates.map(template => renderTemplate(template)));
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
    } catch (_error) {
      // null return should be treated like an error.
    }

    if (!originalContent) {
      const { ignoreNonExisting, create } = actualOptions;
      const errorMessage = typeof ignoreNonExisting === 'string' ? ` ${ignoreNonExisting}.` : '';
      if (ignoreNonExisting) {
        this.log(`${chalk.yellow('\nUnable to find ')}${filePath}.${chalk.yellow(errorMessage)}\n`);
        // return a noop.
        const noop = () => noop;
        return noop;
      }
      if (!create || transformCallbacks.length === 0) {
        throw new Error(`Unable to find ${filePath}. ${errorMessage}`);
      }
      // allow to edit non existing files
      originalContent = '';
    }

    let newContent = originalContent;
    const writeCallback = (...callbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this> => {
      try {
        newContent = joinCallbacks(...callbacks).call(this, newContent, filePath);
        if (actualOptions.assertModified && originalContent === newContent) {
          throw new Error(`Fail to edit file '${file}'.`);
        }
        this.writeDestination(filePath, newContent);
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
      return headerComments.join('\n').concat('\n', stringifyYaml(merge(parseYaml(content), value)));
    });
  }

  /**
   * Merge value to an existing json and write to destination
   */
  mergeDestinationJson(filepath: string, value: Record<string | number, any>) {
    this.editFile(filepath, { create: true }, content => {
      return JSON.stringify(merge(content ? JSON.parse(content) : {}, value), null, 2);
    });
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
  loadJavaDependenciesFromGradleCatalog(javaDependencies: Record<string, string>, gradleCatalog?: string | boolean): void {
    if (typeof gradleCatalog !== 'string') {
      const tomlFile = '../resources/gradle/libs.versions.toml';
      gradleCatalog = gradleCatalog ? this.jhipsterTemplatePath(tomlFile) : this.templatePath(tomlFile);
    }

    const gradleLibsVersions = this.readTemplate(gradleCatalog)?.toString();
    if (gradleLibsVersions) {
      Object.assign(javaDependencies, this.prepareDependencies(getGradleLibsVersionsProperties(gradleLibsVersions!), 'java'));
    }
  }

  loadNodeDependenciesFromPackageJson(
    destination: Record<string, string>,
    packageJsonFile: string = this.templatePath('../resources/package.json'),
  ): void {
    const { devDependencies, dependencies } = this.fs.readJSON(packageJsonFile, {}) as any;
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
  createGit() {
    return simpleGit({ baseDir: this.destinationPath() }).env({
      ...process.env,
      LANG: 'en',
    });
  }

  private calculateApplicationId(applicationPath: string) {
    const dirname = basename(applicationPath);
    return `${createHash('shake256', { outputLength: 1 }).update(applicationPath, 'utf8').digest('hex')}-${dirname}`;
  }

  protected getSharedApplication(applicationFolder: string = this.destinationPath()) {
    return this.options.sharedData.applications?.[this.calculateApplicationId(applicationFolder)];
  }

  private createSharedData({
    jhipsterOldVersion,
    help,
  }: {
    jhipsterOldVersion: string | null;
    help?: boolean;
  }): SharedData<BaseApplication> {
    const applicationId = this.options.applicationId ?? this.calculateApplicationId(this.destinationPath());
    if (this.options.sharedData.applications === undefined) {
      this.options.sharedData.applications = {};
    }
    const sharedApplications = help ? {} : this.options.sharedData.applications;
    if (!sharedApplications[applicationId]) {
      sharedApplications[applicationId] = {};
    }
    const { ignoreNeedlesError } = this.options;

    return new SharedData<BaseApplication>(sharedApplications[applicationId], { jhipsterOldVersion, ignoreNeedlesError });
  }
}
