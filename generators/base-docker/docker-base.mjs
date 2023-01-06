/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { existsSync } from 'fs';
import chalk from 'chalk';
import _ from 'lodash';

import { createBase64Secret } from '../../lib/utils/secret-utils.mjs';
import { applicationTypes, buildToolTypes, getConfigWithDefaults } from '../../jdl/jhipster/index.mjs';

const { MAVEN } = buildToolTypes;
const { MONOLITH, MICROSERVICE, GATEWAY } = applicationTypes;

export { checkDocker } from './docker-utils.mjs';

export default {
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
export function checkImages() {
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
    if (!existsSync(imagePath)) {
      this.hasWarning = true;
      this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(this.directoryPath + appsFolder)}\n`;
    }
  });
}

/**
 * Generate Jwt Secret
 */
export function generateJwtSecret() {
  if (this.jwtSecretKey === undefined) {
    this.jwtSecretKey = createBase64Secret.call(this);
  }
}

/**
 * Configure Image Names
 */
export function configureImageNames() {
  for (let i = 0; i < this.appsFolders.length; i++) {
    const originalImageName = this.appConfigs[i].baseName.toLowerCase();
    const targetImageName = this.dockerRepositoryName ? `${this.dockerRepositoryName}/${originalImageName}` : originalImageName;
    this.appConfigs[i].targetImageName = targetImageName;
  }
}

/**
 * Set Apps Folder Paths
 */
export function setAppsFolderPaths() {
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
export function loadConfigs() {
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
      const config = getConfigWithDefaults(this.getJhipsterConfig(`${path}/.yo-rc.json`).getAll());
      config.composePort = serverPort + index;
      this.loadAppConfig(config, config);
      this.loadServerConfig(config, config);
      this.loadPlatformConfig(config, config);

      this.loadDerivedAppConfig(config);
      this.loadDerivedPlatformConfig(config);
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

export function setClusteredApps() {
  for (let i = 0; i < this.appsFolders.length; i++) {
    for (let j = 0; j < this.clusteredDbApps.length; j++) {
      this.appConfigs[i].clusteredDb = this.appsFolders[i] === this.clusteredDbApps[j];
    }
  }
}

export function loadFromYoRc() {
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
      this.adminPasswordBase64 = createBase64Secret.call(this, this.adminPassword);
    }
  }
}
