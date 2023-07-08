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
/* eslint-disable no-console */
import chalk from 'chalk';
import _ from 'lodash';

import { createJHipsterLogger, CLI_LOGGER } from '../generators/base/support/index.mjs';

export const CLI_NAME = 'jhipster';
export const GENERATOR_NAME = 'generator-jhipster';

const SUCCESS_MESSAGE = `Congratulations, JHipster execution is complete!
If you find JHipster useful consider sponsoring the project ${chalk.yellow('https://www.jhipster.tech/sponsors/')}`;
const SPONSOR_MESSAGE = 'Sponsored with ❤️  by @oktadev.';

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

export const doneFactory = (successMsg, sponsorMsg) => {
  return errorOrMsg => {
    if (errorOrMsg instanceof Error) {
      logger.error(`ERROR! ${errorOrMsg.message}`);
      logger.log(errorOrMsg);
    } else if (errorOrMsg) {
      logger.error(`ERROR! ${errorOrMsg}`);
    } else if (successMsg) {
      logger.log('');
      logger.log(chalk.green.bold(successMsg));
      logger.log('');
      logger.log(chalk.cyan.bold(sponsorMsg));
    }
  };
};

export const printSuccess = () => {
  if (process.exitCode === undefined || process.exitCode === 0) {
    logger.log('');
    logger.log(chalk.green.bold(SUCCESS_MESSAGE));
    logger.log('');
    logger.log(chalk.cyan.bold(SPONSOR_MESSAGE));
  } else {
    logger.error(`JHipster finished with code ${process.exitCode}`);
  }
};

export const done = doneFactory(SUCCESS_MESSAGE, SPONSOR_MESSAGE);
