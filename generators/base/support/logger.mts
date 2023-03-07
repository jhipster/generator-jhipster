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
import type TerminalAdapter from 'yeoman-environment/lib/adapter';
import createDebug, { type Debugger } from 'debug';

/**
 * formats the message to be displayed in the console.
 * @param message the info message to format.
 */
const formatWarningMessageHeader = message => {
  return `${chalk.yellow.bold('WARNING!')} ${message}`;
};

const formatErrorMessageHeader = message => {
  return `${chalk.red.bold('ERROR!')} ${message}`;
};

const formatFatalMessageHeader = message => {
  return `${chalk.red.bold('FATAL!')} ${message}`;
};

const formatInfoMessageHeader = message => {
  return `${chalk.green('INFO!')} ${message}`;
};

export type LoggerOptions = {
  adapter: TerminalAdapter;
  namespace?: string;
  debugEnabled?: boolean;
};

export const CLI_LOGGER = 'jhipster:cli';

export default class Logger {
  adapter: TerminalAdapter;
  debugger: Debugger;
  debugEnabled: boolean;

  constructor({ adapter, namespace = 'jhipster', debugEnabled }: LoggerOptions) {
    this.adapter = adapter;
    this.debugger = createDebug(namespace);

    const cliLogger = namespace === CLI_LOGGER;
    if (cliLogger) {
      this.debugEnabled = debugEnabled || process.argv.includes('-d') || process.argv.includes('--debug'); // Need this early
    } else {
      this.debugEnabled = debugEnabled ?? false;
    }
    if (debugEnabled) {
      this.debugger.enabled = true;
    }
    if (cliLogger && this.debugEnabled) {
      this.info('Debug logging is on');
    }
  }

  debug(msg, ...args) {
    this.debugger(msg, ...args);
  }

  warn(msg) {
    const warn = formatWarningMessageHeader(msg);
    this.adapter.log(warn);
  }

  info(msg) {
    const info = formatInfoMessageHeader(msg);
    this.adapter.log(info);
  }

  log(msg) {
    this.adapter.log(msg);
  }

  error(msg) {
    const errorMessage = formatErrorMessageHeader(msg);
    this.adapter.log(errorMessage);

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
