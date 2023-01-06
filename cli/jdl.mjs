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
import fs from 'fs';
import path from 'path';
import { logger } from './utils.mjs';
import importJdl from './import-jdl.mjs';
import download from './download.mjs';

/**
 * Add jdl extension to the file
 */
const toJdlFile = file => {
  if (!path.extname(file)) {
    return `${file}.jdl`;
  }
  return file;
};

/**
 * JDL command
 * @param {string[][]} args arguments passed for import-jdl
 * @param {string[]} args[0] jdl files
 * @param {any} options options passed from CLI
 * @param {any} env the yeoman environment
 * @param {EnvironmentBuilder} envBuilder
 * @param {(string[], object) => EnvironmentBuilder} createEnvBuilder
 */
const jdl = ([jdlFiles = []], options = {}, env, envBuilder, createEnvBuilder) => {
  logger.debug('cmd: import-jdl from ./import-jdl');
  logger.debug(`jdlFiles: ${toString(jdlFiles)}`);
  if (options.inline) {
    return importJdl(jdlFiles, options, env, envBuilder, createEnvBuilder);
  }
  if (!jdlFiles || jdlFiles.length === 0) {
    logger.fatal(chalk.red('\nAt least one jdl file is required.\n'));
  }
  const promises = jdlFiles.map(toJdlFile).map(filename => {
    if (!fs.existsSync(filename)) {
      logger.info(`File not found: ${filename}. Attempting download from jdl-samples repository`);
      return download([[filename]], options);
    }
    return Promise.resolve(filename);
  });
  return Promise.all(promises).then(jdlFiles => importJdl(jdlFiles.flat(), options, env, envBuilder, createEnvBuilder));
};

export default jdl;
