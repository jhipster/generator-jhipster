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

import { rmSync, statSync } from 'fs';
import _ from 'lodash';
import Generator from 'yeoman-generator';
import shelljs from 'shelljs';

import { javaBeanCase } from '../server/support/index.mjs';
import { Logger } from './support/logging.mjs';
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
    this.logger = new Logger(this.log, this.configOptions, this.options, this._debug);
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
      this.logger.log(`Removing the file - ${destination}`);
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
      this.logger.log(`Could not remove folder ${folder}`);
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
      this.logger.info(`Renaming the file - ${source} to ${dest}`);
      return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
    }
    return true;
  }
}
