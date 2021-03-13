/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

const JSONToJDLConverter = require('../../jdl/converters/json-to-jdl-converter');

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('jdlFile', { type: String, required: false });

    if (this.options.help) {
      return;
    }
    this.baseName = this.config.get('baseName');
    this.jdlFile = this.options.jdlFile || `${this.baseName}.jdl`;
  }

  get default() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      insight() {
        statistics.sendSubGenEvent('generator', 'export-jdl');
      },

      convertToJDL() {
        try {
          JSONToJDLConverter.convertToJDL('.', this.jdlFile);
        } catch (error) {
          this.error(`An error occurred while exporting to JDL: ${error.message}\n${error}`);
        }
      },
    };
  }

  end() {
    this.log(chalk.green.bold('\nThe JDL export is complete!\n'));
  }
};
