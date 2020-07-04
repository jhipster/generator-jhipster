/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');

const packageJson = require('../package.json');
const { logger, toString, getCommandOptions, doneFactory } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');

const env = EnvironmentBuilder.createDefaultBuilder().getEnvironment();

const command = process.argv[2];
const options = getCommandOptions(packageJson, process.argv.slice(3));
logger.info(chalk.yellow(`Executing ${command} on ${process.cwd()}`));
logger.debug(chalk.yellow(`Options: ${toString(options)}`));
try {
    env.run(command, options, doneFactory());
} catch (e) {
    logger.error(e.message, e);
    process.exitCode = 1;
}
