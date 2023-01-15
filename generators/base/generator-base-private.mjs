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
import path from 'path';
import { rmSync, statSync } from 'fs';
import _ from 'lodash';
import Generator from 'yeoman-generator';
import shelljs from 'shelljs';

import { Logguer } from './support/logging.mjs';
import { handleError } from './support/index.mjs';
/**
 * @typedef {import('./api.mjs').JHipsterGeneratorFeatures} JHipsterGeneratorFeatures
 */

/**
 * This is the Generator base private class.
 * This provides all the private API methods used internally.
 * These methods should not be directly utilized using commonJS require,
 * as these can have breaking changes without a major version bump
 *
 * The method signatures in private API can be changed without a major version change.
 * @class
 * @extends {Generator<JHipsterGeneratorOptions>}
 */
export default class PrivateBase extends Generator {
  /**
   * @param {string | string[]} args
   * @param {JHipsterGeneratorOptions} options
   * @param {JHipsterGeneratorFeatures} features
   */
  constructor(args, options, features) {
    super(args, options, features);
    if (!this.options.sharedData) {
      // Make sure sharedData is loaded.
      // Tests that instantiates the Generator direcly 'options.sharedData' may be missing.
      this.options.sharedData = this.env.sharedOptions.sharedData;
    }
    // expose lodash to templates
    this._ = _;
    this.logguer = new Logguer(this.log, this.configOptions, this.options, this._debug);
  }

  /**
   * Add getTaskNames to types
   * @returns {string[]}
   */
  getTaskNames() {
    return super.getTaskNames();
  }

  /**
   * Add features to types
   * @returns {JHipsterGeneratorFeatures}
   */
  get features() {
    return super.features;
  }

  /**
   * @param {JHipsterGeneratorFeatures} features
   */
  set features(features) {
    super.features = features;
  }

  /**
   * Normalizes a command across OS and spawns it (asynchronously).
   *
   * @param {string} command The program to execute.
   * @param {string[]} args A list of arguments to pass to the program.
   * @param {import('child_process').SpawnOptions} [opt] Any cross-spawn options.
   * @returns {import('execa').ExecaChildProcess<string>}
   */
  spawnCommand(command, args, opt) {
    return super.spawnCommand(command, args, opt);
  }

  /* ======================================================================== */
  /* private methods use within generator (not exposed to modules) */
  /* ======================================================================== */

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage() {
    return super.usage().replace('yo jhipster:', 'jhipster ');
  }

  /**
   * Remove File
   *
   * @param file
   */
  removeFile(file) {
    const destination = this.destinationPath(file);
    if (destination && shelljs.test('-f', destination)) {
      this.logguer.log(`Removing the file - ${destination}`);
      rmSync(destination, { force: true });
    }
    return destination;
  }

  /**
   * Remove Folder
   *
   * @param folder
   */
  removeFolder(folder) {
    folder = this.destinationPath(folder);
    try {
      if (statSync(folder).isDirectory()) {
        rmSync(folder, { recursive: true });
      }
    } catch (error) {
      this.logguer.log(`Could not remove folder ${folder}`);
    }
  }

  /**
   * @private
   * Execute a git mv.
   *
   * @param {string} source
   * @param {string} dest
   * @returns {boolean} true if success; false otherwise
   */
  gitMove(from, to) {
    const source = this.destinationPath(from);
    const dest = this.destinationPath(to);
    if (source && dest && shelljs.test('-f', source)) {
      this.logguer.info(`Renaming the file - ${source} to ${dest}`);
      return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
    }
    return true;
  }

  /**
   * @private
   * Get a parent folder path addition for entity
   * @param {string} clientRootFolder
   */
  getEntityParentPathAddition(clientRootFolder) {
    if (!clientRootFolder) {
      return '';
    }
    const relative = path.relative(`/app/entities/${clientRootFolder}/`, '/app/entities/');
    if (relative.includes('app')) {
      // Relative path outside angular base dir.
      const message = `
                "clientRootFolder outside app base dir '${clientRootFolder}'"
            `;
      // Test case doesn't have a environment instance so return 'error'
      if (this.env === undefined) {
        throw new Error(message);
      }
      handleError(this.logguer, message);
    }
    const entityFolderPathAddition = relative.replace(/[/|\\]?..[/|\\]entities/, '').replace('entities', '..');
    if (!entityFolderPathAddition) {
      return '';
    }
    return `${entityFolderPathAddition}/`;
  }

  /**
   * @private
   */
  generateDateTimeFormat(language, index, length) {
    let config = `  '${language}': {\n`;

    config += '    short: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    medium: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric',\n";
    config += "      weekday: 'short', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    long: {\n';
    config += "      year: 'numeric', month: 'long', day: 'numeric',\n";
    config += "      weekday: 'long', hour: 'numeric', minute: 'numeric'\n";
    config += '    }\n';
    config += '  }';
    if (index !== length - 1) {
      config += ',';
    }
    config += '\n';
    return config;
  }

  /**
   * @private
   * Convert to Java bean name case
   *
   * Handle the specific case when the second letter is capitalized
   * See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
   *
   * @param {string} beanName
   * @return {string}
   */
  javaBeanCase(beanName) {
    const secondLetter = beanName.charAt(1);
    if (secondLetter && secondLetter === secondLetter.toUpperCase()) {
      return beanName;
    }
    return _.upperFirst(beanName);
  }

  /**
   * @private
   * Create a java getter of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildJavaGet(reference) {
    let refPath;
    if (typeof refPath === 'string') {
      refPath = [reference];
    } else if (Array.isArray(reference)) {
      refPath = reference;
    } else {
      refPath = [reference.name];
    }
    return refPath.map(partialPath => `get${this.javaBeanCase(partialPath)}()`).join('.');
  }

  /**
   * @private
   * Create a dotted path of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildReferencePath(reference) {
    const refPath = Array.isArray(reference) ? reference : reference.path;
    return refPath.join('.');
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} type
   * @return {string}
   */
  buildJavaGetter(reference, type = reference.type) {
    return `${type} get${this.javaBeanCase(reference.name)}()`;
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `set${this.javaBeanCase(reference.name)}(${valueDefinition})`;
  }

  /**
   * @private
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaFluentSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `${reference.name}(${valueDefinition})`;
  }

  /**
   * @private
   * Create a angular form path getter method of reference.
   *
   * @param {object} reference
   * @param {string[]} prefix
   * @return {string}
   */
  buildAngularFormPath(reference, prefix = []) {
    const formPath = [...prefix, ...reference.path].join("', '");
    return `'${formPath}'`;
  }
}
