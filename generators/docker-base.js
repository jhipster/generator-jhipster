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
const dockerUtils = require('./docker-utils');
const { getBase64Secret } = require('./utils');

module.exports = {
    checkDocker: dockerUtils.checkDocker,
    checkImages,
    generateJwtSecret,
    configureImageNames,
    setAppsFolderPaths,
    loadConfigs,
    loadFromYoRc,
    setClusteredApps
};

/**
 * Check Images
 */
function checkImages() {
    this.log('\nChecking Docker images in applications directories...');

    let imagePath = '';
    let runCommand = '';
    this.warning = false;
    this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
    this.appsFolders.forEach((appsFolder, index) => {
        const appConfig = this.appConfigs[index];
        if (appConfig.buildTool === 'maven') {
            imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/target/jib-cache`);
            runCommand = './mvnw package -Pprod jib:dockerBuild';
        } else {
            imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/build/jib-cache`);
            runCommand = './gradlew bootWar -Pprod jibDockerBuild';
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
        this.jwtSecretKey = getBase64Secret();
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

/**
 * Load config from this.appFolders
 */
function loadConfigs() {
    this.appConfigs = [];
    this.gatewayNb = 0;
    this.monolithicNb = 0;
    this.microserviceNb = 0;
    this.uaaNb = 0;

    // Loading configs
    this.debug(`Apps folders: ${this.appsFolders}`);
    this.appsFolders.forEach(appFolder => {
        const path = this.destinationPath(`${this.directoryPath + appFolder}/.yo-rc.json`);
        const fileData = this.fs.readJSON(path);
        if (fileData) {
            const config = fileData['generator-jhipster'];

            if (config.applicationType === 'monolith') {
                this.monolithicNb++;
            } else if (config.applicationType === 'gateway') {
                this.gatewayNb++;
            } else if (config.applicationType === 'microservice') {
                this.microserviceNb++;
            } else if (config.applicationType === 'uaa') {
                this.uaaNb++;
            }

            this.portsToBind = this.monolithicNb + this.gatewayNb;
            config.appFolder = appFolder;
            this.appConfigs.push(config);
        } else {
            this.error(`Application '${appFolder}' is not found in the path '${this.directoryPath}'`);
        }
    });
}

function setClusteredApps() {
    for (let i = 0; i < this.appsFolders.length; i++) {
        for (let j = 0; j < this.clusteredDbApps.length; j++) {
            this.appConfigs[i].clusteredDb = this.appsFolders[i] === this.clusteredDbApps[j];
        }
    }
}

function loadFromYoRc() {
    this.authenticationType = this.config.get('authenticationType');
    this.defaultAppsFolders = this.config.get('appsFolders');
    this.directoryPath = this.config.get('directoryPath');
    this.gatewayType = this.config.get('gatewayType');
    this.clusteredDbApps = this.config.get('clusteredDbApps');
    this.monitoring = this.config.get('monitoring');
    this.consoleOptions = this.config.get('consoleOptions');
    this.useKafka = false;
    this.useMemcached = false;
    this.dockerRepositoryName = this.config.get('dockerRepositoryName');
    this.dockerPushCommand = this.config.get('dockerPushCommand');
    this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
    if (this.serviceDiscoveryType === undefined) {
        this.serviceDiscoveryType = 'eureka';
    }
    this.adminPassword = this.config.get('adminPassword');
    this.jwtSecretKey = this.config.get('jwtSecretKey');

    if (this.defaultAppsFolders !== undefined) {
        this.log('\nFound .yo-rc.json config file...');
    }

    if (this.regenerate) {
        this.appsFolders = this.defaultAppsFolders;
        loadConfigs.call(this);
        if (this.microserviceNb > 0 || this.gatewayNb > 0 || this.uaaNb > 0) {
            this.deploymentApplicationType = 'microservice';
        } else {
            this.deploymentApplicationType = 'monolith';
        }
        setClusteredApps.call(this);
        if (!this.adminPassword) {
            this.adminPassword = 'admin'; // TODO find a better way to do this
            this.adminPasswordBase64 = getBase64Secret(this.adminPassword);
        }
    }
}
