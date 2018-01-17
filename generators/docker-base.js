
/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const shelljs = require('shelljs');
const chalk = require('chalk');
const crypto = require('crypto');

/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = {
    checkDocker,
    checkImages,
    generateJwtSecret,
    configureImageNames,
    setAppsFolderPaths,
};

/**
 * Check Docker
 */
function checkDocker() {
    const done = this.async();

    shelljs.exec('docker -v', { silent: true }, (code, stdout, stderr) => {
        if (stderr) {
            this.log(chalk.red('Docker version 1.10.0 or later is not installed on your computer.\n' +
                '         Read http://docs.docker.com/engine/installation/#installation\n'));
        } else {
            const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
            const dockerVersionMajor = dockerVersion.split('.')[0];
            const dockerVersionMinor = dockerVersion.split('.')[1];
            if (dockerVersionMajor < 1 || (dockerVersionMajor === 1 && dockerVersionMinor < 10)) {
                this.log(chalk.red(`${'Docker version 1.10.0 or later is not installed on your computer.\n' +
                    '         Docker version found: '}${dockerVersion}\n` +
                    '         Read http://docs.docker.com/engine/installation/#installation\n'));
            }
        }
        done();
    });
}

/**
 * Check Images
 */
function checkImages() {
    this.log('\nChecking Docker images in applications\' directories...');

    let imagePath = '';
    let runCommand = '';
    this.warning = false;
    this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
    this.appsFolders.forEach((appsFolder, index) => {
        const appConfig = this.appConfigs[index];
        if (appConfig.buildTool === 'maven') {
            imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/target/docker`);
            runCommand = './mvnw verify -Pprod dockerfile:build';
        } else {
            imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/build/docker`);
            runCommand = './gradlew -Pprod bootRepackage buildDocker';
        }
        if (shelljs.ls(imagePath).length === 0) {
            this.warning = true;
            this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(this.directoryPath + appsFolder)}\n`;
        }
    });
}

/**
 * Generate Jwt Secret
 */
function generateJwtSecret() {
    if (this.jwtSecretKey === undefined) {
        this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
    }
}

/**
 * Configure Image Names
 */
function configureImageNames() {
    for (let i = 0; i < this.appsFolders.length; i++) {
        const originalImageName = this.appConfigs[i].baseName.toLowerCase();
        const targetImageName = this.dockerRepositoryName ? `${this.dockerRepositoryName}/${originalImageName}` : originalImageName;
        this.appConfigs[i].targetImageName = targetImageName;
    }
}

/**
 * Set Apps Folder Paths
 */
function setAppsFolderPaths() {
    if (this.applicationType) return;
    this.appsFolderPaths = [];
    for (let i = 0; i < this.appsFolders.length; i++) {
        const path = this.destinationPath(this.directoryPath + this.appsFolders[i]);
        this.appsFolderPaths.push(path);
    }
}
