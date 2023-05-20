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
import type { Logger as LoggerApi, InputOutputAdapter } from '@yeoman/types';
import createDebug, { type Debugger } from 'debug';

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

export type LoggerOptions = {
  adapter: InputOutputAdapter;
  namespace?: string;
  debugEnabled?: boolean;
};

export const CLI_LOGGER = 'jhipster:cli';

export default class Logger {
  adapter: InputOutputAdapter;
  debugger: Debugger;

  constructor({ adapter, namespace = 'jhipster', debugEnabled }: LoggerOptions) {
    this.adapter = adapter;
    this.debugger = createDebug(namespace);

    const cliLogger = namespace === CLI_LOGGER;
    if (cliLogger) {
      debugEnabled = debugEnabled || process.argv.includes('-d') || process.argv.includes('--debug'); // Need this early
      if (debugEnabled) {
        this.info('Debug logging is on');
      }
    }
    if (debugEnabled) {
      this.debugger.enabled = true;
    }
  }

  debug(msg, ...args) {
    this.debugger(msg, ...args);
  }

  warn(msg) {
    const warn = formatWarningMessageHeader(msg);
    this.adapter.log(...warn);
  }

  info(...msgs) {
    this.adapter.log(...formatInfoMessageHeader(...msgs));
  }

  log(msg) {
    this.adapter.log(msg);
  }

  error(msg, error) {
    const errorMessage = formatErrorMessageHeader(msg);
    this.adapter.log(errorMessage);
    if (error) {
      this.adapter.log(error);
    }

    process.exitCode = 1;
  }

  /**
   *  Use with caution.
   *  process.exit is not recommended by Node.js.
   *  Refer to https://nodejs.org/api/process.html#process_process_exit_code.
   */
  fatal(msg, trace) {
    const fatalMessage = formatFatalMessageHeader(msg);
    this.adapter.log(fatalMessage);
    if (trace) {
      this.adapter.log(trace);
    }

    process.exit(1);
  }
}
