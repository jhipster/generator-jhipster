// @ts-nocheck
/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { convertSecretToBase64, createBase64Secret, removeFieldsWithNullishValues } from '../../../lib/utils/index.js';
import { applicationTypes, buildToolTypes, getConfigWithDefaults } from '../../../lib/jhipster/index.js';
import { GENERATOR_JHIPSTER } from '../../generator-constants.js';
import { loadDeploymentConfig } from '../../base-workspaces/internal/index.js';
import { loadDerivedAppConfig } from '../../app/support/index.js';
import { loadDerivedPlatformConfig, loadDerivedServerConfig } from '../../server/support/index.js';
import { loadCommandConfigsIntoApplication } from '../../../lib/command/load.js';
import { lookupCommandsConfigs } from '../../../lib/command/lookup-commands-configs.js';

const { MAVEN } = buildToolTypes;
const { MONOLITH, MICROSERVICE, GATEWAY } = applicationTypes;

export { checkDocker } from '../../docker/support/index.js';

/**
 * Check Images
 */
export function checkImages() {
  this.log.log('\nChecking Docker images in applications directories...');

  let imagePath = '';
  let runCommand = '';
  this.hasWarning = false;
  this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
  this.appsFolders.forEach((appsFolder, index) => {
    const appConfig = this.appConfigs[index];
    if (appConfig.buildTool === MAVEN) {
      imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/target/jib-cache`);
      runCommand = `./mvnw -ntp -Pprod verify jib:dockerBuild${process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''}`;
    } else {
      imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/build/jib-cache`);
      runCommand = `./gradlew bootJar -Pprod jibDockerBuild${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''}`;
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
  this.jwtSecretKey = this.jhipsterConfig.jwtSecretKey = this.jwtSecretKey ?? createBase64Secret(this.options.reproducibleTests);
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
 * Load config from this.appFolders
 */
export async function loadConfigs() {
  this.appConfigs = [];
  this.gatewayNb = 0;
  this.monolithicNb = 0;
  this.microserviceNb = 0;
  const serverPort = 8080;

  const getJhipsterConfig = yoRcPath => this.createStorage(yoRcPath, GENERATOR_JHIPSTER);

  // Loading configs
  this.log.debug(`Apps folders: ${this.appsFolders}`);
  for (const [index, appFolder] of this.appsFolders.entries()) {
    const path = this.destinationPath(`${this.directoryPath + appFolder}`);
    this.log.debug(chalk.red.bold(`App folder ${path}`));
    if (this.fs.exists(`${path}/.yo-rc.json`)) {
      const config = getConfigWithDefaults(removeFieldsWithNullishValues(getJhipsterConfig(`${path}/.yo-rc.json`).getAll()));
      config.composePort = serverPort + index;
      this.log.debug(chalk.red.bold(`${config.baseName} has compose port ${config.composePort} and appIndex ${config.applicationIndex}`));

      loadCommandConfigsIntoApplication({
        source: config,
        application: config,
        commandsConfigs: this.options.commandsConfigs ?? (await lookupCommandsConfigs()),
      });

      loadDerivedAppConfig({ application: config });
      loadDerivedPlatformConfig({ application: config });
      loadDerivedServerConfig({ application: config });

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
      throw new Error(`Application '${appFolder}' is not found in the path '${this.directoryPath}'`);
    }
  }
}

export function setClusteredApps() {
  for (let i = 0; i < this.appsFolders.length; i++) {
    for (let j = 0; j < this.clusteredDbApps.length; j++) {
      this.appConfigs[i].clusteredDb = this.appsFolders[i] === this.clusteredDbApps[j];
    }
  }
}

export async function loadFromYoRc() {
  loadDeploymentConfig.call(this);

  this.useKafka = false;
  this.usePulsar = false;
  this.useMemcached = false;
  this.useRedis = false;

  await loadConfigs.call(this);
  if (this.microserviceNb > 0 || this.gatewayNb > 0) {
    this.deploymentApplicationType = MICROSERVICE;
  } else {
    this.deploymentApplicationType = MONOLITH;
  }
  setClusteredApps.call(this);
  if (!this.adminPassword) {
    this.adminPassword = 'admin'; // TODO find a better way to do this
    this.adminPasswordBase64 = convertSecretToBase64(this.adminPassword);
  }
}
