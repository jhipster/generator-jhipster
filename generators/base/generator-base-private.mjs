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

import _ from 'lodash';
import Generator from 'yeoman-generator';

import { Logger } from './support/logging.mjs';

/**
 * @typedef {import('./api.mjs').JHipsterGeneratorFeatures} JHipsterGeneratorFeatures
 */

/**
 * This class changes/corrects the yeoman-generator typescript definitions.
 *
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
}
