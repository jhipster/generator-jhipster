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

import { CLI_LOGGER, createJHipsterLogger } from '../lib/utils/index.ts';

export const CLI_NAME = 'jhipster';
export const GENERATOR_NAME = 'generator-jhipster';

const SUCCESS_MESSAGE = `Congratulations, JHipster execution is complete!
If you find JHipster useful consider sponsoring the project ${chalk.yellow('https://www.jhipster.tech/sponsors/')}`;
const SPONSOR_MESSAGE = 'Thanks for using JHipster!';

export const logger = createJHipsterLogger({ namespace: CLI_LOGGER });

/**
 *  Get options for the command
 */
export const getCommand = (cmd, args = []) => {
  let cmdArgs;
  if (args.length > 0) {
    logger.debug('Arguments found');
    args = args.flat();
    cmdArgs = args.join(' ').trim();
    logger.debug(`cmdArgs: ${cmdArgs}`);
  }
  return `${cmd}${cmdArgs ? ` ${cmdArgs}` : ''}`;
};

export const doneFactory = (options = {}) => {
  const { successMsg = SUCCESS_MESSAGE, sponsorMsg = SPONSOR_MESSAGE, logger: log = logger } = options;
  return errorOrMsg => {
    if (errorOrMsg instanceof Error) {
      log.error(`ERROR! ${errorOrMsg.message}`);
      log.log(errorOrMsg);
    } else if (errorOrMsg) {
      log.error(`ERROR! ${errorOrMsg}`);
    } else if (successMsg) {
      log.log('');
      log.log(chalk.green.bold(successMsg));
      log.log('');
      log.log(chalk.cyan.bold(sponsorMsg));
    }
  };
};

export const done = doneFactory();
