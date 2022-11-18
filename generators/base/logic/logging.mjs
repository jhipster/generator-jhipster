import chalk from 'chalk';

/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
 * @param message the debug message to format.
 */
const formatDebugMessageHeader = message => {
  return `${chalk.yellow.bold('DEBUG!')} ${message}`;
};

/**
 * Checks if the configOptions or generatorOptions contains the debug flag.
 * @param context
 */
const jhipsterDebugOptionsChecker = context => {
  return (context.configOptions && context.configOptions.isDebugEnabled) || (context.options && context.options.debug);
};

/**
 * Prints the messages then the arguments using the yeoman logger
 * @param context the generator context.
 * @param message message to print as a prefix
 * @param args arguments to print
 */
const printMessageUsingGeneratorLogger = (context, message, ...args) => {
  context.log(message);
  args.forEach(arg => context.log(arg));
};

/**
 * Checks if the configOptions or generatorOptions contains the debug flag.
 * @param context the generator context.
 */
const generatorDebugOptionChecker = context => {
  return context._debug && context._debug.enabled;
};

/**
 * Print message using then internal yeoman debugger.
 * @param context the generator context.
 */
const printUsingInternalDebugger = (context, message, ...args) => {
  context._debug(message);
  args.forEach(arg => context._debug(arg));
};

const logging = (context, message, ...args) => {
  const formattedMsg = formatDebugMessageHeader(message);
  if (jhipsterDebugOptionsChecker(context)) {
    printMessageUsingGeneratorLogger(context, formattedMsg, ...args);
  }
  if (generatorDebugOptionChecker(context)) {
    printUsingInternalDebugger(context, formattedMsg, ...args);
  }
};

export default logging;
