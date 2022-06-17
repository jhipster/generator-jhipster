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
const shelljs = require('shelljs');
const chalk = require('chalk');
const _ = require('lodash');

const dockerUtils = require('./docker-utils');
const { getBase64Secret } = require('./utils');
const { MAVEN } = require('../jdl/jhipster/build-tool-types');
const { MONOLITH, MICROSERVICE, GATEWAY } = require('../jdl/jhipster/application-types');

module.exports = {
  checkDocker: dockerUtils.checkDocker,
  checkImages,
  generateJwtSecret,
  configureImageNames,
  setAppsFolderPaths,
  loadConfigs,
  loadFromYoRc,
  setClusteredApps,
};

/**
 * Check Images
 */
function checkImages() {
  this.log('\nChecking Docker images in applications directories...');

  let imagePath = '';
  let runCommand = '';
  this.hasWarning = false;
  this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
  this.appsFolders.forEach((appsFolder, index) => {
    const appConfig = this.appConfigs[index];
    if (appConfig.buildTool === MAVEN) {
      imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/target/jib-cache`);
      runCommand = './mvnw -ntp -Pprod verify jib:dockerBuild';
    } else {
      imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/build/jib-cache`);
      runCommand = './gradlew bootJar -Pprod jibDockerBuild';
    }
    if (shelljs.ls(imagePath).length === 0) {
      this.hasWarning = true;
      this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(this.directoryPath + appsFolder)}\n`;
    }
  });
}

/**
 * Generate Jwt Secret
 */
function generateJwtSecret() {
  if (this.jwtSecretKey === undefined) {
    this.jwtSecretKey = getBase64Secret.call(this);
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
  const serverPort = 8080;

  // Loading configs
  this.debug(`Apps folders: ${this.appsFolders}`);
  this.appsFolders.forEach((appFolder, index) => {
    const path = this.destinationPath(`${this.directoryPath + appFolder}`);
    if (this.fs.exists(`${path}/.yo-rc.json`)) {
      const config = this.getJhipsterConfig(`${path}/.yo-rc.json`).getAll();
      config.composePort = serverPort + index;
      _.defaults(config, this.getDefaultConfigForApplicationType(config.applicationType));
      this.loadAppConfig(config, config);
      this.loadServerConfig(config, config);
      this.loadDerivedPlatformConfig(config);
      this.loadDerivedAppConfig(config);
      this.loadDerivedServerConfig(config);

      if (config.applicationType === MONOLITH) {
        this.monolithicNb++;
      } else if (config.applicationType === GATEWAY) {
        this.gatewayNb++;
      } else if (config.applicationType === MICROSERVICE) {
        this.microserviceNb++;
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
  this.loadDeploymentConfig();

  this.useKafka = false;
  this.useMemcached = false;
  this.useRedis = false;

  // Current implementation loads appsFolders into defaultAppsFolders
  this.defaultAppsFolders = this.appsFolders;
  delete this.appsFolders;

  if (this.defaultAppsFolders !== undefined) {
    this.log('\nFound .yo-rc.json config file...');
  }

  if (this.regenerate) {
    this.appsFolders = this.defaultAppsFolders;
    loadConfigs.call(this);
    if (this.microserviceNb > 0 || this.gatewayNb > 0) {
      this.deploymentApplicationType = MICROSERVICE;
    } else {
      this.deploymentApplicationType = MONOLITH;
    }
    setClusteredApps.call(this);
    if (!this.adminPassword) {
      this.adminPassword = 'admin'; // TODO find a better way to do this
      this.adminPasswordBase64 = getBase64Secret.call(this, this.adminPassword);
    }
  }
}
