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
import { basename, join as joinPath, dirname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import _ from 'lodash';
import { simpleGit } from 'simple-git';
import type { CopyOptions } from 'mem-fs-editor';
import type { Data as TemplateData, Options as TemplateOptions } from 'ejs';
import { statSync, rmSync } from 'fs';
import { lt as semverLessThan } from 'semver';
import type Storage from 'yeoman-generator/lib/util/storage.js';

import SharedData from './shared-data.mjs';
import JHipsterBaseBlueprintGenerator from './generator-base-blueprint.mjs';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, PRIORITY_PREFIX } from './priorities.mjs';
import { joinCallbacks } from './ts-utils.mjs';
import baseOptions from './options.mjs';

import type {
  JHipsterGeneratorOptions,
  JHipsterGeneratorFeatures,
  EditFileCallback,
  EditFileOptions,
  CascatedEditFileCallback,
  JHipsterOptions,
  CheckResult,
} from './api.mjs';
import type { BaseTaskGroup } from './tasks.mjs';
import { packageJson } from '../../lib/index.mjs';
import { type BaseApplication } from '../base-application/types.mjs';
import { GENERATOR_BOOTSTRAP } from '../generator-list.mjs';

const { merge, kebabCase } = _;
const { INITIALIZING, PROMPTING, CONFIGURING, COMPOSING, LOADING, PREPARING, DEFAULT, WRITING, POST_WRITING, INSTALL, POST_INSTALL, END } =
  PRIORITY_NAMES;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const asPriority = (priorityName: string) => `${PRIORITY_PREFIX}${priorityName}`;

/**
 * This is the base class for a generator for every generator.
 *
 * @class
 * @extends {JHipsterBaseBlueprintGenerator}
 */
export default class BaseGenerator extends JHipsterBaseBlueprintGenerator {
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

  readonly sharedData!: SharedData<BaseApplication>;

  declare _config: Record<string, any>;
  jhipsterConfig!: Record<string, any>;
  /**
   * @deprecated
   */
  configOptions!: Record<string, any>;
  jhipsterTemplatesFolders!: string[];

  fromBlueprint!: boolean;
  sbsBlueprint?: boolean;
  blueprintStorage?: Storage;
  blueprintConfig?: Record<string, any>;
  jhipsterContext?: any;

  private _jhipsterGenerator?: string;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, { tasksMatchingPriority: true, taskPrefix: PRIORITY_PREFIX, unique: 'namespace', ...features });

    if (!this.features.jhipsterModular) {
      // This adds support for a `--from-cli` flag
      this.option('from-cli', {
        description: 'Indicates the command is run from JHipster CLI',
        type: Boolean,
        hide: true,
      });

      this.option('with-generated-flag', {
        description: 'Add a GeneratedByJHipster annotation to all generated java classes and interfaces',
        type: Boolean,
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
    }

    /*
     * When building help, this.jhipsterConfig is not available.
     * At current state jhipsterOptions registers options and parses it.
     * TODO split register/parse options process, register should alway be executed.
     * When building the help, parse can be skipped.
     */
    let jhipsterOldVersion = null;
    if (!this.options.help) {
      // JHipster runtime config that should not be stored to .yo-rc.json.
      this.configOptions = this.options.configOptions || { sharedEntities: {} };
      this.configOptions.sharedEntities = this.configOptions.sharedEntities || {};

      /* Force config to use 'generator-jhipster' namespace. */
      this._config = this._getStorage('generator-jhipster', { sorted: true });
      /* JHipster config using proxy mode used as a plain object instead of using get/set. */
      this.jhipsterConfig = this.config.createProxy();

      if (!this.options.reproducible) {
        jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion ?? null;
        if (!this.jhipsterConfig.jhipsterVersion) {
          this.jhipsterConfig.jhipsterVersion = packageJson.version;
        }
      }
    }

    this.sharedData = this.createSharedData(jhipsterOldVersion);

    this.jhipsterOptions(baseOptions as JHipsterOptions);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES as any);

    this.loadRuntimeOptions();
    this.loadStoredAppOptions();

    if (this.options.namespace !== 'jhipster:bootstrap') {
      // jhipster:bootstrap is always required. Run it once the enviroment starts.
      (this.env as any).runLoop.add(
        'environment:run',
        async (done, stop) => {
          try {
            await this.composeWithJHipster(GENERATOR_BOOTSTRAP);
            done();
          } catch (error) {
            stop(error);
          }
        },
        {
          once: 'queueJhipsterBootstrap',
          run: false,
        }
      );
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
        this.logger.warn('Error adding current blueprint templates as alternative for JHipster templates.');
        this.logger.log(error);
      }
    }
  }

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage(): string {
    return super.usage().replace('yo jhipster:', 'jhipster ');
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
      priorities = priorities.filter(priorityName => !this.options.skipPriorities.includes(priorityName));
    }
    return priorities;
  }

  /**
   * Filter generator's tasks in case the blueprint should be responsible on queueing those tasks.
   */
  delegateTasksToBlueprint(tasksGetter: () => BaseTaskGroup<this>): BaseTaskGroup<this> {
    return this.delegateToBlueprint ? {} : tasksGetter();
  }

  /**
   * Load options from an object.
   * When composing, we need to load options from others generators, externalising options allow to easily load them.
   * @param options - Object containing options.
   * @param common - skip generator scoped options.
   */
  jhipsterOptions(options: JHipsterOptions, common = false) {
    options = _.cloneDeep(options);
    Object.entries(options).forEach(([optionName, optionDesc]) => {
      this.option(kebabCase(optionName), optionDesc);
      if (!optionDesc.scope || (common && optionDesc.scope === 'generator')) return;
      let optionValue;
      // Hidden options are test options, which doesn't rely on commoander for options parsing.
      // We must parse environment variables manually
      if (optionDesc.hide && optionDesc.env && process.env[optionDesc.env]) {
        optionValue = process.env[optionDesc.env];
      } else {
        optionValue = this.options[optionName];
      }
      if (optionValue !== undefined) {
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
        if (optionDesc.scope !== 'generator') {
          // generator scoped options may be duplicated
          delete this.options[optionName];
        }
      }
    });
  }

  /**
   * Alternative templatePath that fetches from the blueprinted generator, instead of the blueprint.
   */
  jhipsterTemplatePath(...path: string[]) {
    let existingGenerator: string;
    try {
      existingGenerator = this._jhipsterGenerator || (this.env as any).requireNamespace(this.options.namespace).generator;
    } catch (error) {
      if (this.options.namespace) {
        const split = this.options.namespace.split(':', 2);
        existingGenerator = split.length === 1 ? split[0] : split[1];
      } else {
        throw new Error('Could not determine the generator name');
      }
    }
    this._jhipsterGenerator = existingGenerator;
    return this.fetchFromInstalledJHipster(this._jhipsterGenerator, 'templates', ...path);
  }

  /**
   * Remove File
   * @param file
   */
  removeFile(...path: string[]) {
    const destinationFile = this.destinationPath(...path);
    try {
      if (destinationFile && statSync(destinationFile).isFile()) {
        this.logger.log(`Removing the file - ${destinationFile}`);
        rmSync(destinationFile, { force: true });
      }
    } catch {
      this.logger.log(`Could not remove file ${destinationFile}`);
    }
    return destinationFile;
  }

  /**
   * Remove Folder
   * @param path
   */
  removeFolder(...path: string[]) {
    const destinationFolder = this.destinationPath(...path);
    try {
      if (statSync(destinationFolder).isDirectory()) {
        rmSync(destinationFolder, { recursive: true });
      }
    } catch (error) {
      this.logger.log(`Could not remove folder ${destinationFolder}`);
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
    if (this.sharedData.getControl().useVersionPlaceholders) {
      return Object.fromEntries(Object.keys(map).map(dep => [dep, valuePlaceholder(dep)]));
    }
    return {
      ...map,
    };
  }

  /**
   * Print CheckResult info/warnings or throw result Error.
   */
  validateCheckResult(result: CheckResult, { printInfo = false, throwOnError = true } = {}) {
    // Don't print check info by default for cleaner outputs.
    if (printInfo && result.info) {
      this.logger.info(result.info);
    }
    if (result.warning) {
      this.logger.warn(result.warning);
    }
    if (result.error) {
      if (throwOnError) {
        throw new Error(result.error);
      } else {
        this.logger.warn(result.error);
      }
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

  private createSharedData(jhipsterOldVersion: string | null): SharedData<BaseApplication> {
    const destinationPath = this.destinationPath();
    const dirname = basename(destinationPath);
    const prefix = createHash('shake256', { outputLength: 1 }).update(destinationPath, 'utf8').digest('hex');
    const applicationId = `${prefix}-${dirname}`;
    if (this.options.sharedData.applications === undefined) {
      this.options.sharedData.applications = {};
    }
    const sharedApplications = this.options.sharedData.applications;
    if (!sharedApplications[applicationId]) {
      sharedApplications[applicationId] = {};
    }
    const { ignoreNeedlesError } = this.options;

    return new SharedData<BaseApplication>(sharedApplications[applicationId], { jhipsterOldVersion, ignoreNeedlesError });
  }
}
