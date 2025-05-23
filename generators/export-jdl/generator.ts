/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import CoreGenerator from '../base-core/index.js';

import { convertToJDL } from '../../lib/jdl/converters/json-to-jdl-converter.js';
import { CommandCoreGenerator } from '../base-core/generator.js';
import type command from './command.js';

export default class extends CommandCoreGenerator<typeof command> {
  jdlFile!: string;
  jdlContent?: string;

  get [CoreGenerator.DEFAULT]() {
    return this.asAnyTaskGroup({
      convertToJDL() {
        try {
          const jdlObject = convertToJDL(this.destinationPath(), false, this.options.jdlDefinition);
          if (jdlObject) {
            this.jdlContent = jdlObject.toString();
          }
        } catch (error: unknown) {
          throw new Error(`An error occurred while exporting to JDL: ${(error as Error).message}\n${error}`, { cause: error });
        }
      },
    });
  }

  get [CoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      writeJdl() {
        if (this.jdlContent) {
          this.writeDestination(this.jdlFile, this.jdlContent);
        }
      },
    });
  }

  get [CoreGenerator.END]() {
    return this.asAnyTaskGroup({
      end() {
        this.log.log(chalk.green.bold('\nThe JDL export is complete!\n'));
      },
    });
  }
}
