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
import type { Logger as LoggerApi } from '@yeoman/types';
import { createLogger, LoggerOptions, Logger as DefaultLogger } from '@yeoman/adapter';
import createDebug from 'debug';

/**
 * formats the message to be displayed in the console.
 * @param message the info message to format.
 */
const addPrefixToParameters = (prefix: string, ...args: Parameters<LoggerApi['write']>): Parameters<LoggerApi['write']> => {
  args[0] = `${prefix} ${args[0]}`;
  return args;
};

const formatWarningMessageHeader = (...args: Parameters<LoggerApi['write']>): Parameters<LoggerApi['write']> => {
  return addPrefixToParameters(chalk.yellow.bold('WARNING!'), ...args);
};

const formatErrorMessageHeader = (...args: Parameters<LoggerApi['write']>): Parameters<LoggerApi['write']> => {
  return addPrefixToParameters(chalk.red.bold('ERROR!'), ...args);
};

const formatFatalMessageHeader = (...args: Parameters<LoggerApi['write']>): Parameters<LoggerApi['write']> => {
  return addPrefixToParameters(chalk.red.bold('FATAL!'), ...args);
};

const formatInfoMessageHeader = (...args: Parameters<LoggerApi['write']>): Parameters<LoggerApi['write']> => {
  return addPrefixToParameters(chalk.green('INFO!'), ...args);
};

export const CLI_LOGGER = 'jhipster:cli';

export const createJHipsterLogger = (options: LoggerOptions & { namespace?: string; debugEnabled?: boolean } = {}) => {
  const { namespace = 'jhipster' } = options;
  const debug = createDebug(namespace);

  const customJHipsterLogger = {
    debugger: debug,

    debug(msg, ...args) {
      this.debugger(msg, ...args);
    },

    warn(this: LoggerApi, ...args: Parameters<LoggerApi['write']>) {
      this.writeln(...formatWarningMessageHeader(...args));
      return this;
    },

    verboseInfo(this: LoggerApi, ...args: Parameters<LoggerApi['write']>) {
      this.writeln(...formatInfoMessageHeader(...args));
      return this;
    },

    log(this: LoggerApi, ...args: Parameters<LoggerApi['write']>) {
      this.writeln(...args);
      return this;
    },

    error(this: DefaultLogger, msg, error) {
      const errorMessage = formatErrorMessageHeader(msg);
      this.console.error(...errorMessage);
      if (error) {
        this.console.error(error);
      }

      process.exitCode = 1;
    },

    fatal(this: any, msg, trace) {
      const fatalMessage = formatFatalMessageHeader(msg);
      this.console.error(...fatalMessage);
      if (trace) {
        this.console.error(trace);
      }

      process.exit(1);
    },
  };

  const logger = createLogger({ ...options, loggers: customJHipsterLogger });
  const cliLogger = namespace === CLI_LOGGER;
  let debugEnabled = options.debugEnabled;
  if (cliLogger) {
    debugEnabled = debugEnabled || process.argv.includes('-d') || process.argv.includes('--debug'); // Need this early
    if (debugEnabled) {
      logger.verboseInfo('Debug logging is on');
    }
  }
  if (debugEnabled) {
    logger.debugger.enabled = true;
  }
  return logger;
};

export type Logger = ReturnType<typeof createJHipsterLogger>;
