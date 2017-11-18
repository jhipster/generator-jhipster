/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

const spawn = require('child_process').spawn;
const chalk = require('chalk'); // eslint-disable-line import/no-extraneous-dependencies
const winston = require('winston');

const WIN_PLATFORM = process.platform === 'win32';

const command = WIN_PLATFORM
  ? (process.env.comspec || 'cmd.exe')
  : 'npm';
const args = WIN_PLATFORM
  ? ['/s', '/c', 'npm outdated', '--json']
  : ['outdated', '--json'];

const outDatedCommand = spawn(command, args);

outDatedCommand.stdout.on('data', (data) => {
  const dependencies = JSON.parse(data || {});
  const dependenciesToUpdate = Object.keys(dependencies).sort();
  winston.info(`There ${dependenciesToUpdate.length === 1 ? 'is' : 'are'} ${dependenciesToUpdate.length} dependenc${dependenciesToUpdate.length === 1 ? 'y' : 'ies'} to update:`);
  dependenciesToUpdate.forEach((dependency) => {
    winston.info(`\t${dependency} to v${dependencies[dependency].latest}`);
  });
});

outDatedCommand.stderr.on('data', (data) => {
  winston.error(
    chalk.red(
      `Oops. Something went wrong with this script.\nHere is the error: ${data}`
    )
  );
});
