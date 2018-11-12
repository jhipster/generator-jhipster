/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const shelljs = require('shelljs');
const chalk = require('chalk');
const dockerCLI = require('./docker-cli');
/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = {
    checkDocker,
    checkImageExist,
    checkAndBuildImages
};

/**
 * Check that Docker exists.
 * @param failOver flag
 */
function checkDocker() {
    if (this.abort || this.skipChecks) return;
    const done = this.async();

    shelljs.exec('docker -v', { silent: true }, (code, stdout, stderr) => {
        if (stderr) {
            this.log(
                chalk.red(
                    'Docker version 1.10.0 or later is not installed on your computer.\n' +
                        '         Read http://docs.docker.com/engine/installation/#installation\n'
                )
            );
            this.abort = true;
        } else {
            const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
            const dockerVersionMajor = dockerVersion.split('.')[0];
            const dockerVersionMinor = dockerVersion.split('.')[1];
            if (dockerVersionMajor < 1 || (dockerVersionMajor === 1 && dockerVersionMinor < 10)) {
                this.log(
                    chalk.red(
                        `${'Docker version 1.10.0 or later is not installed on your computer.\n' +
                            '         Docker version found: '}${dockerVersion}\n` +
                            '         Read http://docs.docker.com/engine/installation/#installation\n'
                    )
                );
                this.abort = true;
            } else {
                this.log.ok('Docker is installed');
            }
        }
        done();
    });
}

/**
 * Check that a Docker image exists in a JHipster app.
 *
 * @param opts Options to pass.
 * @property pwd JHipster app directory. default is './'
 * @property appConfig Configuration for the current application
 */
function checkImageExist(opts = { cwd: './', appConfig: null }) {
    if (this.abort) return;

    let imagePath = '';
    this.warning = false;
    this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
    if (opts.appConfig.buildTool === 'maven') {
        imagePath = this.destinationPath(`${opts.cwd + opts.cwd}/target/docker`);
        this.dockerBuildCommand = './mvnw package -Pprod jib:dockerBuild';
    } else {
        imagePath = this.destinationPath(`${opts.cwd + opts.cwd}/build/docker`);
        this.dockerBuildCommand = './gradlew bootWar -Pprod jibDockerBuild';
    }

    if (shelljs.ls(imagePath).length === 0) {
        this.warning = true;
        this.warningMessage += `  ${chalk.cyan(this.dockerBuildCommand)} in ${this.destinationPath(this.directoryPath + opts.cwd)}\n`;
    }
}

/**
 * Check that a Docker image exists (using {@link #checkImageExists} and if the user agrees, rebuild it.
 * @param opts
 * @property pwd JHipster app directory. default is './'
 * @property forceBuild flag to force the image build.
 * @property appConfig Configuration for the current application
 * @returns {Promise.<TResult>|Promise}
 */
function checkAndBuildImages(opts = { cwd: './', forceBuild: false, appConfig: { buildTool: 'gradle' } }) {
    if (this.abort) return null;
    checkImageExist.call(this, opts);
    const pwd = shelljs.pwd();
    shelljs.cd(opts.cwd);
    return new Promise((resolve, reject) =>
        dockerCLI.command(`${opts.cwd}${this.dockerBuildCommand}`, err => {
            shelljs.cd(pwd);
            if (err) {
                this.log.error(chalk.red(`The Docker image build failed. ${err}`));
                this.abort = true;
                reject();
            }
            resolve();
        })
    );
}
