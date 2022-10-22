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
import _ from 'lodash';
import SharedData from './shared-data.mjs';

import JHipsterBaseBlueprintGenerator from './generator-base-blueprint.mjs';

import { PRIORITY_NAMES, PRIORITY_PREFIX } from './priorities.mjs';
import { JHipsterGeneratorOptions, JHipsterGeneratorFeatures, EditFileCallback, CascatedEditFileCallback } from './api.cjs';
import { joinCallbacks } from './ts-utils.mjs';

const { merge } = _;
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

  #sharedData;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, { tasksMatchingPriority: true, taskPrefix: PRIORITY_PREFIX, unique: 'namespace', ...features });
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
   * Shared Data
   */
  get sharedData() {
    if (!this.#sharedData) {
      const { baseName } = this.jhipsterConfig;
      if (!baseName) {
        throw new Error('baseName is required');
      }
      if (this.options.sharedData.applications === undefined) {
        this.options.sharedData.applications = {};
      }
      const sharedApplications = this.options.sharedData.applications;
      if (!sharedApplications[baseName]) {
        sharedApplications[baseName] = {};
      }
      this.#sharedData = new SharedData(sharedApplications[baseName]);
    }
    return this.#sharedData;
  }

  /**
   * Shallow clone or convert dependencies to placeholder if needed.
   */
  prepareDependencies(
    map: Record<string, string>,
    valuePlaceholder: (value: string) => string = value => `'${_.snakeCase(value).toUpperCase()}_VERSION'`
  ): Record<string, string> {
    if (process.env.VERSION_PLACEHOLDERS === 'true') {
      return Object.fromEntries(Object.keys(map).map(dep => [dep, valuePlaceholder(dep)]));
    }
    return {
      ...map,
    };
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
}
