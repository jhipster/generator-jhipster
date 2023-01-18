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
import chalk from 'chalk';

import BaseGenerator from '../base/index.mjs';

import statistics from '../statistics.cjs';
import { GENERATOR_EXPORT_JDL } from '../generator-list.mjs';
import { applicationOptions } from '../../jdl/jhipster/index.mjs';
import JSONToJDLConverter from '../../jdl/converters/json-to-jdl-converter.js';
import type { JHipsterGeneratorOptions, JHipsterGeneratorFeatures } from '../base/api.mjs';

const { OptionNames } = applicationOptions;

const { BASE_NAME } = OptionNames;

export default class extends BaseGenerator {
  baseName!: string;

  jdlFile!: string;

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, features);

    this.argument('jdlFile', { type: String, required: false });

    if (this.options.help) {
      return;
    }
    this.baseName = this.config.get(BASE_NAME);
    this.jdlFile = this.options.jdlFile || `${this.baseName}.jdl`;
  }

  get [BaseGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_EXPORT_JDL);
      },

      convertToJDL() {
        try {
          JSONToJDLConverter.convertToJDL('.', this.jdlFile);
        } catch (error: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(`An error occurred while exporting to JDL: ${(error as any).message}\n${error}`);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.asEndTaskGroup({
      end() {
        this.log(chalk.green.bold('\nThe JDL export is complete!\n'));
      },
    });
  }
}
