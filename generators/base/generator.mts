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
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { basename } from 'path';
import { createHash } from 'crypto';
import _ from 'lodash';
import { simpleGit } from 'simple-git';

import type { CopyOptions } from 'mem-fs-editor';
import type { Data as TemplateData, Options as TemplateOptions } from 'ejs';

import SharedData from './shared-data.mjs';

import JHipsterBaseBlueprintGenerator from './generator-base-blueprint.mjs';

import { PRIORITY_NAMES, PRIORITY_PREFIX } from './priorities.mjs';
import { joinCallbacks } from './ts-utils.mjs';
import baseOptions from './options.mjs';

import type {
  JHipsterGeneratorOptions,
  JHipsterGeneratorFeatures,
  EditFileCallback,
  CascatedEditFileCallback,
  JHipsterOptions,
  CheckResult,
} from './api.mjs';
import type { BaseTaskGroup } from './tasks.mjs';

const { merge, kebabCase } = _;
const { INITIALIZING, PROMPTING, CONFIGURING, COMPOSING, LOADING, PREPARING, DEFAULT, WRITING, POST_WRITING, INSTALL, POST_INSTALL, END } =
  PRIORITY_NAMES;

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

  readonly sharedData!: SharedData<any>;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, { tasksMatchingPriority: true, taskPrefix: PRIORITY_PREFIX, unique: 'namespace', ...features });

    this.sharedData = this.createSharedData();

    this.jhipsterOptions(baseOptions as JHipsterOptions);
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
          this.blueprintStorage.set(optionName, optionValue);
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
   * Utility function to write file.
   *
   * @param source
   * @param destination - destination
   * @param data - template data
   * @param options - options passed to ejs render
   * @param copyOptions
   */
  writeFile(source: string, destination: string, data: TemplateData = this, options?: TemplateOptions, copyOptions?: CopyOptions) {
    // Convert to any because ejs types doesn't support string[] https://github.com/DefinitelyTyped/DefinitelyTyped/pull/63315
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root: any = this.jhipsterTemplatesFolders ?? this.templatePath();
    return this.renderTemplate(source, destination, data, { root, ...options }, copyOptions);
  }

  /**
   * Edit file content
   */
  editFile(file: string, ...transformCallbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this> {
    let filePath = this.destinationPath(file);
    if (!this.env.sharedFs.existsInMemory(filePath) && this.env.sharedFs.existsInMemory(`${filePath}.jhi`)) {
      filePath = `${filePath}.jhi`;
    }

    let content;

    try {
      content = this.readDestination(filePath);
    } catch (_error) {
      if (transformCallbacks.length === 0) {
        throw new Error(`File ${filePath} doesn't exist`);
      }
      // allow to edit non existing files
      content = '';
    }

    const writeCallback = (...callbacks: EditFileCallback<this>[]): CascatedEditFileCallback<this> => {
      try {
        content = joinCallbacks(...callbacks).call(this, content, filePath);
        this.writeDestination(filePath, content);
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
      this.info(result.info);
    }
    if (result.warning) {
      this.warning(result.warning);
    }
    if (result.error) {
      if (throwOnError) {
        throw new Error(result.error);
      } else {
        this.warning(result.error);
      }
    }
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
   * Create a simple-git instance using current destinationPath as baseDir.
   */
  createGit() {
    return simpleGit({ baseDir: this.destinationPath() }).env({
      ...process.env,
      LANG: 'en',
    });
  }

  /**
   * @private
   */
  createSharedData() {
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
    return new SharedData(sharedApplications[applicationId]);
  }
}
