/* eslint-disable no-console */
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
const program = require('commander');
const yeoman = require('yeoman-environment');
const chalk = require('chalk');
const packageJson = require('../package.json');

const version = packageJson.version;
const env = yeoman.createEnv();

const JHIPSTER_NS = 'jhipster';
const DEFAULT_GENERATOR = 'app';
const SUB_GENERATORS = [
    DEFAULT_GENERATOR,
    'aws', 'ci-cd', 'client', 'cloudfoundry', 'docker-compose',
    'entity', 'export-jdl', 'heroku', 'import-jdl', 'info', 'kubernetes',
    'languages', 'rancher-compose', 'server', 'service', 'upgrade'
];

SUB_GENERATORS.forEach((item) => {
    env.register(require.resolve(`../generators/${item}`), `${JHIPSTER_NS}:${item}`);
});

const done = () => {
    console.log('Done');
};

// validate passed arguments
const isValidCmd = cmd => SUB_GENERATORS.includes(cmd);

program
    .version(version);

program
    .arguments('<cmd> [arguments...]')
    .action((cmd, args) => {
        const options = args.join(' ');
        if (isValidCmd(cmd)) {
            console.log('Running "%s" "%s"', cmd, options);
            console.log(program.args);
            env.run(`${JHIPSTER_NS}:${cmd} ${options}`, done);
        } else {
            console.error(chalk.red(`The command ${cmd} ${options
            } you are trying to run is invalid.\nPlease run ${chalk.yellow(
                'jh --help'
            )} to see possible commands.`));
            process.exit(1);
        }
    });

program.on('--help', () => {
    console.log('  Commands:');
    console.log('');
    SUB_GENERATORS.forEach((item) => {
        console.log(`    ${item}`);
    });
    console.log('');
});
program.parse(process.argv);
