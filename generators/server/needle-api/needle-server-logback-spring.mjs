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
import needleServer from './needle-server.mjs';
import { SERVER_MAIN_RES_DIR } from '../../generator-constants.mjs';

export default class extends needleServer {
  addlog(logName, level) {
    this.addlogToMaster(logName, level, 'jhipster-needle-logback-add-log');
  }

  addlogToMaster(logName, level, needle) {
    const errorMessage = `${chalk.yellow('Reference to ') + logName} ${chalk.yellow('not added.\n')}`;
    const fullPath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;
    const content = `<logger name="${logName}" level="${level}"/>`;

    const rewriteFileModel = this.generateFileModel(fullPath, needle, content);

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }
}
