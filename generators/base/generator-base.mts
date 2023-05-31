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
import { basename, join as joinPath, dirname, relative, isAbsolute, join } from 'path';
import { requireNamespace } from '@yeoman/namespace';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import _ from 'lodash';
import { simpleGit } from 'simple-git';
import type { CopyOptions } from 'mem-fs-editor';
import type { Data as TemplateData, Options as TemplateOptions } from 'ejs';
import { statSync, rmSync, existsSync } from 'fs';
import { lt as semverLessThan } from 'semver';
import type { ComposeOptions, Storage } from 'yeoman-generator';
import semver from 'semver';
import latestVersion from 'latest-version';
import assert from 'assert';
import SharedData from './shared-data.mjs';
import YeomanGenerator from './generator-base-todo.mjs';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, PRIORITY_PREFIX } from './priorities.mjs';
import { createJHipsterLogger, joinCallbacks, Logger } from './support/index.mjs';

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
} from './api.mjs';
import { packageJson } from '../../lib/index.mjs';
import { type BaseApplication } from '../base-application/types.mjs';
import { GENERATOR_BOOTSTRAP } from '../generator-list.mjs';
import NeedleApi from '../needle-api.mjs';
import command from './command.mjs';
import { GENERATOR_JHIPSTER } from '../generator-constants.mjs';

const { merge } = _;
const { INITIALIZING, PROMPTING, CONFIGURING, COMPOSING, LOADING, PREPARING, DEFAULT, WRITING, POST_WRITING, INSTALL, POST_INSTALL, END } =
  PRIORITY_NAMES;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const asPriority = (priorityName: string) => `${PRIORITY_PREFIX}${priorityName}`;

/**
 * This is the base class for a generator for every generator.
 */
export default class CoreGenerator extends YeomanGenerator {
  static asPriority = asPriority;

  static INITIALIZING = asPriority(INITIALIZING);

  static PROMPTING = asPriority(PROMPTING);

  static CONFIGURING = asPriority(CONFIGURING);

  static COMPOSING = asPriority(COMPOSING);

  static LOADING = asPriority(LOADING);

  static PREPARING = asPriority(PREPARING);

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

  readonly sharedData!: SharedData<BaseApplication>;
  readonly logger: Logger;
  jhipsterConfig!: Record<string, any>;
  /**
   * @deprecated
   */
  configOptions!: Record<string, any>;
  jhipsterTemplatesFolders!: string[];

  blueprintStorage?: Storage;

  private _jhipsterGenerator?: string;
  private _needleApi?: NeedleApi;

  // TODO switch to FullEnvironment type
  declare env: any;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, {
      skipParseOptions: true,
      tasksMatchingPriority: true,
      taskPrefix: PRIORITY_PREFIX,
      unique: 'namespace',
      ...features,
    });

    this.option('skip-prompts', {
      description: 'Skip prompts',
      type: Boolean,
    });

    this.option('skip-prettier', {
      description: 'Skip prettier',
      type: Boolean,
      hide: true,
    });

    this.option('ignore-needles-error', {
      description: 'Ignore needles failures',
      type: Boolean,
      hide: true,
    });

    this.parseJHipsterOptions(command.options);

    let jhipsterOldVersion = null;
    if (!this.options.help) {
      // JHipster runtime config that should not be stored to .yo-rc.json.
      this.configOptions = this.options.configOptions || {};

      /* Force config to use 'generator-jhipster' namespace. */
      this._config = this._getStorage('generator-jhipster');
      /* JHipster config using proxy mode used as a plain object instead of using get/set. */
      this.jhipsterConfig = this.config.createProxy();

      jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion ?? null;
      // Don't write jhipsterVersion to .yo-rc.json when reproducible
      if (!this.options.reproducible && !this.jhipsterConfig.jhipsterVersion) {
        this.jhipsterConfig.jhipsterVersion = packageJson.version;
      }
    }

    this.sharedData = this.createSharedData({ jhipsterOldVersion, help: this.options.help });

    this.logger = this.log as any;

    if (this.options.help) {
      return;
    }

    this.parseJHipsterOptions(command.options);

    this.registerPriorities(CUSTOM_PRIORITIES);

    this.loadRuntimeOptions();
    this.loadStoredAppOptions();

    if (this.options.namespace !== 'jhipster:bootstrap') {
      // jhipster:bootstrap is always required. Run it once the enviroment starts.
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
    if (priorityName === POST_WRITING || priorityName === PREPARING) {
      const source = this.sharedData.getSource();
      return [{ control, source }];
    }
    return [{ control }];
  }

  /**
   * Override yeoman-generator method that gets methods to be queued, filtering the result.
   */
  getTaskNames(): string[] {
    let priorities = super.getTaskNames();
    if (this.options.skipPriorities) {
      priorities = priorities.filter(priorityName => !this.options.skipPriorities!.includes(priorityName));
    }
    return priorities;
  }

  /**
   * Load options from an object.
   * When composing, we need to load options from others generators, externalising options allow to easily load them.
   * @param options - Object containing options.
   * @param common - skip generator scoped options.
   */
  parseJHipsterOptions(options: JHipsterOptions, common = false) {
    Object.entries(options).forEach(([optionName, optionDesc]) => {
      if (!optionDesc.scope || (common && optionDesc.scope === 'generator')) return;
      let optionValue;
      // Hidden options are test options, which doesn't rely on commoander for options parsing.
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
      }
    });
  }

  parseJHipsterArguments(jhipsterArguments: JHipsterArguments = {}) {
    const { positionalArguments = [] } = this.options;
    const argumentEntries = Object.entries(jhipsterArguments);
    if (positionalArguments.length > argumentEntries.length) {
      throw new Error('More arguments than allowed');
    }
    argumentEntries.forEach(([argumentName, argumentDef], index) => {
      if (positionalArguments.length > index) {
        const argument = positionalArguments[index];
        const convertedValue = !argumentDef.type || argumentDef.type === Array ? argument : argumentDef.type(argument as any);
        this[argumentName] = convertedValue;
      } else if (argumentDef.required) {
        throw new Error(`Missing required argument ${argumentName}`);
      }
    });
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
        // Keep test compatibily were jhipster lookup does not run.
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
      forwardOptions: true,
      ...options,
      generatorOptions: {
        configOptions: this.configOptions,
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
  writeFiles<DataType = any>(options: WriteFileOptions<this, DataType>): Promise<string[]> {
    return (this as any).internalWriteFiles(options);
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
        throw new Error(`Unknow Error ${error}`);
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
   * Shallow clone or convert dependencies to placeholder if needed.
   */
  prepareDependencies(
    map: Record<string, string>,
    valuePlaceholder: (value: string) => string = value => `${_.snakeCase(value).toUpperCase()}_VERSION`
  ): Record<string, string> {
    if (this.useVersionPlaceholders) {
      return Object.fromEntries(Object.keys(map).map(dep => [dep, valuePlaceholder(dep)]));
    }
    return {
      ...map,
    };
  }

  loadNodeDependencies(destination: Record<string, string>, source: Record<string, string>): void {
    Object.assign(destination, this.prepareDependencies(source));
  }

  loadNodeDependenciesFromPackageJson(destination: Record<string, string>, packageJsonFile: string): void {
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
          }\n`
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

  private createSharedData({
    jhipsterOldVersion,
    help,
  }: {
    jhipsterOldVersion: string | null;
    help?: boolean;
  }): SharedData<BaseApplication> {
    const destinationPath = this.destinationPath();
    const dirname = basename(destinationPath);
    const applicationId =
      this.options.applicationId ??
      `${createHash('shake256', { outputLength: 1 }).update(destinationPath, 'utf8').digest('hex')}-${dirname}`;
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
