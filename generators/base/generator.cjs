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
const { parse: parseYaml, stringify: stringifyYaml } = require('yaml');
const _ = require('lodash');

const JHipsterBaseBlueprintGenerator = require('./generator-base-blueprint.cjs');

const { PRIORITY_NAMES, PRIORITY_PREFIX } = require('./priorities.cjs');

const { merge } = _;
const { INITIALIZING, PROMPTING, CONFIGURING, COMPOSING, LOADING, PREPARING, DEFAULT, WRITING, POST_WRITING, INSTALL, POST_INSTALL, END } =
  PRIORITY_NAMES;

const asPriority = priorityName => `${PRIORITY_PREFIX}${priorityName}`;

/**
 * This is the base class for a generator for every generator.
 *
 * @class
 * @extends {JHipsterBaseBlueprintGenerator}
 */
class BaseGenerator extends JHipsterBaseBlueprintGenerator {
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

  /**
   * @param {string | string[]} args
   * @param {import('./api.cjs').JHipsterGeneratorOptions} options
   * @param {import('./api.cjs').JHipsterGeneratorFeatures} features
   */
  constructor(args, options, features) {
    super(args, options, { tasksMatchingPriority: true, taskPrefix: PRIORITY_PREFIX, unique: 'namespace', ...features });
  }

  /**
   * Convert value to a yaml and write to destination
   * @param {string} filepath
   * @param {Record<string | number, any>} value
   */
  writeDestinationYaml(filepath, value) {
    this.writeDestination(filepath, stringifyYaml(value));
  }

  /**
   * Merge value to an existing yaml and write to destination
   * Removes every comment (due to parsing/merging process) except the at the top of the file.
   * @param {string} filepath
   * @param {Record<string | number, any>} value
   */
  mergeDestinationYaml(filepath, value) {
    this.editFile(filepath, content => {
      const lines = content.split('\n');
      const headerComments = [];
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
   * Convert dependencies to placeholder if needed
   *
   * @param {Record<string,string>} map
   * @param {(value: string) => string} [valuePlaceholder]
   * @returns {Record<string,string>}
   */
  prepareDependencies(map, valuePlaceholder = value => `'${_.snakeCase(value).toUpperCase()}_VERSION'`) {
    if (process.env.VERSION_PLACEHOLDERS === 'true') {
      return Object.fromEntries(Object.keys(map).map(dep => [dep, valuePlaceholder(dep)]));
    }
    return map;
  }

  /**
   * @private
   * Override yeoman-generator method that gets methods to be queued, filtering the result.
   *
   * @return {string[]}
   */
  getTaskNames() {
    let priorities = super.getTaskNames();
    if (this.options.skipPriorities) {
      priorities = priorities.filter(priorityName => !this.options.skipPriorities.includes(priorityName));
    }
    return priorities;
  }
}

module.exports = BaseGenerator;
