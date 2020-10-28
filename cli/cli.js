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

const { createProgram, buildCommands } = require('./program');
const { logger, done } = require('./utils');
const EnvironmentBuilder = require('./environment-builder');
const SUB_GENERATORS = require('./commands');

const envBuilder = EnvironmentBuilder.createDefaultBuilder();
const env = envBuilder.getEnvironment();

const program = createProgram();

/* setup debugging */
logger.init(program);

const allCommands = { ...SUB_GENERATORS, ...envBuilder.getBlueprintCommands() };

/* eslint-disable-next-line global-require, import/no-dynamic-require */
buildCommands({ program, commands: allCommands, envBuilder, env, loadCommand: key => require(`./${key}`) });

module.exports = program.parseAsync(process.argv).catch(done);

process.on('unhandledRejection', up => {
    throw up;
});

