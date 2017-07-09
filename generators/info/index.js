/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const util = require('util');
const BaseGenerator = require('../generator-base');

const ReportGenerator = generator.extend({});

util.inherits(ReportGenerator, BaseGenerator);

// We use console.log() in this generator because we want to print on stdout not on
// stderr unlike yeoman's log() so that user can easily redirect output to a file.
/* eslint-disable no-console */
module.exports = ReportGenerator.extend({

    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
    },

    initializing: {
        sayHello() {
            this.log(chalk.white('Welcome to the JHipster Information Sub-Generator\n'));
        },

        checkJHipster() {
            const done = this.async();
            console.log('##### **JHipster Version(s)**');
            shelljs.exec('npm list generator-jhipster', { silent: true }, (err, stdout, stderr) => {
                if (stdout) {
                    console.log(`\n\`\`\`\n${stdout}\`\`\`\n`);
                }
                done();
            });
        },

        displayConfiguration() {
            const done = this.async();
            let result = shelljs.cat('.yo-rc.json');
            result = result.replace(/"rememberMeKey": ".*"/g, '"rememberMeKey": "replaced-by-jhipster-info"');
            result = result.replace(/"jwtSecretKey": ".*"/g, '"jwtSecretKey": "replaced-by-jhipster-info"');
            console.log('\n##### **JHipster configuration, a `.yo-rc.json` file generated in the root folder**\n');
            console.log(`\n<details>\n<summary>.yo-rc.json file</summary>\n<pre>\n${result}\n</pre>\n</details>\n`);
            done();
        },

        displayEntities() {
            const done = this.async();
            console.log('\n##### **JDL for the Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory**\n');
            const jdl = this.generateJDLFromEntities();
            console.log('<details>\n<summary>JDL entity definitions</summary>\n');
            console.log(`<pre>\n${jdl.toString()}\n</pre>\n</details>\n`);
            done();
        },

        checkJava() {
            const done = this.async();
            console.log('\n##### **Environment and Tools**\n');
            shelljs.exec('java -version', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stderr);
                }
                done();
            });
        },

        checkGit() {
            const done = this.async();
            shelljs.exec('git version', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                }
                done();
            });
        },

        checkNode() {
            const done = this.async();
            shelljs.exec('node -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(`node: ${stdout}`);
                }
                done();
            });
        },

        checkNpm() {
            const done = this.async();
            shelljs.exec('npm -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(`npm: ${stdout}`);
                }
                done();
            });
        },

        checkBower() {
            const done = this.async();
            shelljs.exec('bower -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(`bower: ${stdout}`);
                }
                done();
            });
        },

        checkGulp() {
            const done = this.async();
            shelljs.exec('gulp -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log('gulp:');
                    console.log(stdout);
                }
                done();
            });
        },

        checkYeoman() {
            const done = this.async();
            shelljs.exec('yo --version', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(`yeoman: ${stdout}`);
                }
                done();
            });
        },

        checkYarn() {
            const done = this.async();
            shelljs.exec('yarn --version', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(`yarn: ${stdout}`);
                }
                done();
            });
        },

        checkDocker() {
            const done = this.async();
            shelljs.exec('docker -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                }
                done();
            });
        },

        checkDockerCompose() {
            const done = this.async();
            shelljs.exec('docker-compose -v', { silent: true }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                }
                done();
            });
        }
    }
});
/* eslint-enable no-console */
