import chalk from 'chalk';

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

const formatInfoMessageHeader = message => {
  return `${chalk.green('INFO!')} ${message}`;
};

/**
 * Checks if the configOptions or generatorOptions contains the debug flag.
 * @param configOptions the jh configOptions
 * @param options the jh options
 */
const jhipsterDebugOptionsChecker = (configOptions, options) => {
  return (configOptions && configOptions.isDebugEnabled) || (options && options.debug);
};
/**
 * Prints the messages then the arguments using the yeoman logger
 * @param context the generator context.
 * @param message message to print as a prefix
 * @param args arguments to print
 */
const printMessageUsingGeneratorLogger = (log, message, ...args) => {
  log(message);
  args.forEach(arg => log(arg));
};

/**
 * formats the message to be displayed in the console.
 * @param message the debug message to format.
 */
const formatDebugMessageHeader = message => {
  return `${chalk.yellow.bold('DEBUG!')} ${message}`;
};

/**
 * Checks if the configOptions or generatorOptions contains the debug flag.
 * @param debuggerChannel the debugguer output
 */
const generatorDebugOptionChecker = debuggerChannel => {
  return debuggerChannel && debuggerChannel.enabled;
};

/**
 * Print message using then internal yeoman debugger.
 * @param debuggerChannel the debugguer output context.
 * @param message message to print as a prefix
 * @param args arguments to print
 */
const printMessageAndArgumentsUsingInternalDebugger = (debuggerChannel, message, ...args) => {
  debuggerChannel(message);
  args.forEach(arg => debuggerChannel(arg));
};

const logDebug = (isDebugEnabled, log, _debug, message, ...args) => {
  const formattedMsg = formatDebugMessageHeader(message);
  if (isDebugEnabled) {
    printMessageUsingGeneratorLogger(log, formattedMsg, ...args);
  }
  if (generatorDebugOptionChecker(_debug)) {
    printMessageAndArgumentsUsingInternalDebugger(_debug, formattedMsg, ...args);
  }
};

export class Logger {
  constructor(yeomanLogger, configOptions, options, yeomanDebug) {
    this.yeomanLogger = yeomanLogger;
    this.yeomanDebug = yeomanDebug;
    this.isDebugEnabled = jhipsterDebugOptionsChecker(configOptions, options);
  }

  debug(msg, ...args) {
    logDebug(this.isDebugEnabled, this.yeomanLogger, this.yeomanDebug, msg, ...args);
  }

  warn(msg) {
    const warn = formatWarningMessageHeader(msg);
    printMessageUsingGeneratorLogger(this.yeomanLogger, warn);
    if (this.isDebugEnabled) {
      printMessageAndArgumentsUsingInternalDebugger(this.yeomanDebug, warn);
    }
  }

  info(msg) {
    const info = formatInfoMessageHeader(msg);
    printMessageUsingGeneratorLogger(this.yeomanLogger, info);
    if (this.isDebugEnabled) {
      printMessageAndArgumentsUsingInternalDebugger(this.yeomanDebug, info);
    }
  }

  log(msg) {
    printMessageUsingGeneratorLogger(this.yeomanLogger, msg);
  }

  error(msg) {
    const warn = formatErrorMessageHeader(msg);
    printMessageUsingGeneratorLogger(this.yeomanLogger, warn);
    if (this.isDebugEnabled) {
      printMessageAndArgumentsUsingInternalDebugger(this.yeomanDebug, warn);
    }
  }
}

export const debug = (yeomanContext, message, ...args) => {
  logDebug(yeomanContext.configOptions, yeomanContext.options, yeomanContext.log, yeomanContext._debug, message, ...args);
};
