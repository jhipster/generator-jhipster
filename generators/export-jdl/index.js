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
const chalk = require('chalk');

const BaseGenerator = require('../generator-base');
const { DEFAULT_PRIORITY } = require('../../lib/constants/priorities.cjs').compat;

const statistics = require('../statistics');
const { GENERATOR_EXPORT_JDL } = require('../generator-list');
const { OptionNames } = require('../../jdl/jhipster/application-options');
const JSONToJDLConverter = require('../../jdl/converters/json-to-jdl-converter');

const { BASE_NAME } = OptionNames;

module.exports = class extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.argument('jdlFile', { type: String, required: false });

    if (this.options.help) {
      return;
    }
    this.baseName = this.config.get(BASE_NAME);
    this.jdlFile = this.options.jdlFile || `${this.baseName}.jdl`;
  }

  get [DEFAULT_PRIORITY]() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_EXPORT_JDL);
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
