#!/usr/bin/env node
/**
 * Copyright 2013-2017 the original author or authors.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const semver = require('semver');
const packageJson = require('../package.json');

const currentNodeVersion = process.versions.node;
const minimumNodeVersion = packageJson.engines.node;

if (!semver.satisfies(currentNodeVersion, minimumNodeVersion)) {
    /* eslint-disable no-console */
    console.error(chalk.red(`You are running Node version ${currentNodeVersion
    }\nJHipster requires Node version ${minimumNodeVersion
    }\nPlease update your version of Node.`));
    /* eslint-enable  */
    process.exit(1);
}
require('./jh-cli');
