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
import chalk from 'chalk';
import shelljs from 'shelljs';
import { loadConfigs, setClusteredApps } from './docker-base.mjs';
import { applicationTypes, monitoringTypes, serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';
import { createBase64Secret } from '../../lib/utils/secret-utils.mjs';

const { MICROSERVICE, MONOLITH, GATEWAY } = applicationTypes;
const { PROMETHEUS } = monitoringTypes;
const monitoring = monitoringTypes;

const NO_MONITORING = monitoring.NO;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;

const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
export default {
  askForApplicationType,
  askForGatewayType,
  askForPath,
  askForApps,
  askForClustersMode,
  askForMonitoring,
  askForServiceDiscovery,
  askForAdminPassword,
  askForDockerRepositoryName,
  askForDockerPushCommand,
  loadConfigs,
};

/**
 * Ask For Application Type
 */
async function askForApplicationType() {
  if (this.regenerate) return;

  const prompts = [
    {
      type: 'list',
      name: 'deploymentApplicationType',
      message: 'Which *type* of application would you like to deploy?',
      choices: [
        {
          value: MONOLITH,
          name: 'Monolithic application',
        },
        {
          value: MICROSERVICE,
          name: 'Microservice application',
        },
      ],
      default: MONOLITH,
    },
  ];

  const props = await this.prompt(prompts);
  this.deploymentApplicationType = props.deploymentApplicationType;
}

/**
 * Ask For Gateway Type
 */
async function askForGatewayType() {
  if (this.regenerate) return;
  if (this.deploymentApplicationType !== MICROSERVICE) return;

  const prompts = [
    {
      type: 'list',
      name: 'gatewayType',
      message: 'Which *type* of gateway would you like to use?',
      choices: [
        {
          value: 'SpringCloudGateway',
          name: 'JHipster gateway based on Spring Cloud Gateway',
        },
      ],
      default: 'SpringCloudGateway',
    },
  ];

  const props = await this.prompt(prompts);
  this.gatewayType = props.gatewayType;
}

/**
 * Ask For Path
 */
async function askForPath() {
  if (this.regenerate) return;

  const deploymentApplicationType = this.deploymentApplicationType;
  let messageAskForPath;
  if (deploymentApplicationType === MONOLITH) {
    messageAskForPath = 'Enter the root directory where your applications are located';
  } else {
    messageAskForPath = 'Enter the root directory where your gateway(s) and microservices are located';
  }
  const prompts = [
    {
      type: 'input',
      name: 'directoryPath',
      message: messageAskForPath,
      default: this.directoryPath || '../',
      validate: input => {
        const path = this.destinationPath(input);
        if (shelljs.test('-d', path)) {
          const appsFolders = getAppFolders.call(this, input, deploymentApplicationType);

          if (appsFolders.length === 0) {
            return deploymentApplicationType === MONOLITH ? `No monolith found in ${path}` : `No microservice or gateway found in ${path}`;
          }
          return true;
        }
        return `${path} is not a directory or doesn't exist`;
      },
    },
  ];

  const props = await this.prompt(prompts);
  this.directoryPath = props.directoryPath;
  // Patch the path if there is no trailing "/"
  if (!this.directoryPath.endsWith('/')) {
    this.log(chalk.yellow(`The path "${this.directoryPath}" does not end with a trailing "/", adding it anyway.`));
    this.directoryPath += '/';
  }

  this.appsFolders = getAppFolders.call(this, this.directoryPath, deploymentApplicationType);

  // Removing registry from appsFolders, using reverse for loop
  for (let i = this.appsFolders.length - 1; i >= 0; i--) {
    if (this.appsFolders[i] === 'jhipster-registry' || this.appsFolders[i] === 'registry') {
      this.appsFolders.splice(i, 1);
    }
  }

  this.log(chalk.green(`${this.appsFolders.length} applications found at ${this.destinationPath(this.directoryPath)}\n`));
}

/**
 * Ask For Apps
 */
async function askForApps() {
  if (this.regenerate) return;

  const messageAskForApps = 'Which applications do you want to include in your configuration?';

  const prompts = [
    {
      type: 'checkbox',
      name: 'chosenApps',
      message: messageAskForApps,
      choices: this.appsFolders,
      default: this.defaultAppsFolders,
      validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
    },
  ];

  const props = await this.prompt(prompts);
  this.appsFolders = props.chosenApps;
  loadConfigs.call(this);
}

/**
 * Ask For Clusters Mode
 */
async function askForClustersMode() {
  if (this.regenerate) return;

  const clusteredDbApps = [];
  this.appConfigs.forEach((appConfig, index) => {
    if (appConfig.databaseTypeMongodb || appConfig.databaseTypeCouchbase) {
      clusteredDbApps.push(this.appsFolders[index]);
    }
  });
  if (clusteredDbApps.length === 0) return;

  const prompts = [
    {
      type: 'checkbox',
      name: 'clusteredDbApps',
      message: 'Which applications do you want to use with clustered databases (only available with MongoDB and Couchbase)?',
      choices: clusteredDbApps,
      default: this.clusteredDbApps,
    },
  ];

  const props = await this.prompt(prompts);
  this.clusteredDbApps = props.clusteredDbApps;
  setClusteredApps.call(this);
}

/**
 * Ask For Monitoring
 */
async function askForMonitoring() {
  if (this.regenerate) return;

  const prompts = [
    {
      type: 'list',
      name: 'monitoring',
      message: 'Do you want to setup monitoring for your applications ?',
      choices: [
        {
          value: NO_MONITORING,
          name: 'No',
        },
        {
          value: PROMETHEUS,
          name: 'Yes, for metrics only with Prometheus',
        },
      ],
      default: this.monitoring ? this.monitoring : NO_MONITORING,
    },
  ];

  const props = await this.prompt(prompts);
  this.monitoring = props.monitoring;
}

/**
 * Ask For Service Discovery
 */
async function askForServiceDiscovery() {
  if (this.regenerate) return;

  const serviceDiscoveryEnabledApps = [];
  this.appConfigs.forEach((appConfig, index) => {
    if (appConfig.serviceDiscoveryAny) {
      serviceDiscoveryEnabledApps.push({
        baseName: appConfig.baseName,
        serviceDiscoveryType: appConfig.serviceDiscoveryType,
      });
    }
  });

  if (serviceDiscoveryEnabledApps.length === 0) {
    this.serviceDiscoveryType = false;
    return;
  }

  if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === CONSUL)) {
    this.serviceDiscoveryType = CONSUL;
    this.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
  } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === EUREKA)) {
    this.serviceDiscoveryType = EUREKA;
    this.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
  } else {
    this.log(chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'));
    this.log('Your service discovery enabled apps:');
    serviceDiscoveryEnabledApps.forEach(app => {
      this.log(` -${app.baseName} (${app.serviceDiscoveryType})`);
    });

    const prompts = [
      {
        type: 'list',
        name: 'serviceDiscoveryType',
        message: 'Which Service Discovery registry and Configuration server would you like to use ?',
        choices: [
          {
            value: EUREKA,
            name: 'JHipster Registry',
          },
          {
            value: CONSUL,
            name: 'Consul',
          },
          {
            value: NO_SERVICE_DISCOVERY,
            name: 'No Service Discovery and Configuration',
          },
        ],
        default: EUREKA,
      },
    ];

    const props = this.prompt(prompts);
    this.serviceDiscoveryType = props.serviceDiscoveryType;
  }
}

/**
 * Ask For Admin Password
 */
async function askForAdminPassword() {
  if (this.regenerate || this.serviceDiscoveryType !== EUREKA) return;

  const prompts = [
    {
      type: 'input',
      name: 'adminPassword',
      message: 'Enter the admin password used to secure the JHipster Registry',
      default: 'admin',
      validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
    },
  ];

  const props = await this.prompt(prompts);
  this.adminPassword = props.adminPassword;
  this.adminPasswordBase64 = createBase64Secret.call(this, this.adminPassword);
}

/**
 * Ask For Docker Repository Name
 */
async function askForDockerRepositoryName() {
  if (this.regenerate) return;

  const prompts = [
    {
      type: 'input',
      name: 'dockerRepositoryName',
      message: 'What should we use for the base Docker repository name?',
      default: this.dockerRepositoryName,
    },
  ];

  const props = await this.prompt(prompts);
  this.dockerRepositoryName = props.dockerRepositoryName;
}

/**
 * Ask For Docker Push Command
 */
async function askForDockerPushCommand() {
  if (this.regenerate) return;

  const prompts = [
    {
      type: 'input',
      name: 'dockerPushCommand',
      message: 'What command should we use for push Docker image to repository?',
      default: this.dockerPushCommand ? this.dockerPushCommand : 'docker push',
    },
  ];

  const props = await this.prompt(prompts);
  this.dockerPushCommand = props.dockerPushCommand;
}

/**
 * Get App Folders
 * @param input path to join to destination path
 * @param deploymentApplicationType type of application being composed
 * @returns {Array} array of string representing app folders
 */
export function getAppFolders(input, deploymentApplicationType) {
  const destinationPath = this.destinationPath(input);
  const files = shelljs.ls('-l', destinationPath);
  const appsFolders = [];

  files.forEach(file => {
    if (file.isDirectory()) {
      if (shelljs.test('-f', `${destinationPath}/${file.name}/.yo-rc.json`)) {
        try {
          const fileData = this.fs.readJSON(`${destinationPath}/${file.name}/.yo-rc.json`);
          if (
            fileData['generator-jhipster'].baseName !== undefined &&
            (deploymentApplicationType === undefined ||
              deploymentApplicationType === fileData['generator-jhipster'].applicationType ||
              (deploymentApplicationType === MICROSERVICE && fileData['generator-jhipster'].applicationType === GATEWAY))
          ) {
            appsFolders.push(file.name.match(/([^/]*)\/*$/)[1]);
          }
        } catch (err) {
          this.log(chalk.red(`${file}: this .yo-rc.json can't be read`));
          this.debug('Error:', err);
        }
      }
    }
  });

  return appsFolders;
}
