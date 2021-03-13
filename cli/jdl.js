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
const fs = require('fs');
const path = require('path');
const cliUtils = require('./utils');
const importJdl = require('./import-jdl');
const download = require('./download');

const { logger } = cliUtils;

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
 * @param {function} forkProcess the method to use for process forking
 */
module.exports = ([jdlFiles = []], options = {}, env, forkProcess) => {
  logger.debug('cmd: import-jdl from ./import-jdl');
  logger.debug(`jdlFiles: ${toString(jdlFiles)}`);
  if (options.inline) {
    return importJdl(jdlFiles, options, env, forkProcess);
  }
  if (!jdlFiles || jdlFiles.length === 0) {
    logger.fatal(chalk.red('\nAt least one jdl file is required.\n'));
  }
  const promises = jdlFiles.map(toJdlFile).map(filename => {
    if (!fs.existsSync(filename)) {
      return download([[filename]], options);
    }
    return Promise.resolve(filename);
  });
  return Promise.all(promises).then(jdlFiles => importJdl(jdlFiles.flat(), options, env, forkProcess));
};
