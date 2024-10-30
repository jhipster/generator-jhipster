// @ts-nocheck
/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { applicationTypes, monitoringTypes, serviceDiscoveryTypes } from '../../../lib/jhipster/index.js';
import { convertSecretToBase64 } from '../../base/support/index.js';
import { loadConfigs } from './docker-base.js';

const { MICROSERVICE, MONOLITH, GATEWAY } = applicationTypes;
const { PROMETHEUS } = monitoringTypes;
const monitoring = monitoringTypes;

const NO_MONITORING = monitoring.NO;
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;

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
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

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

  const props = await this.prompt(prompts, this.config);
  this.deploymentApplicationType = props.deploymentApplicationType;
}

/**
 * Ask For Gateway Type
 */
async function askForGatewayType() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
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

  const props = await this.prompt(prompts, this.config);
  this.gatewayType = props.gatewayType;
}

/**
 * Ask For Path
 */
async function askForPath() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

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
      validate: async input => {
        const path = this.destinationPath(input);
        try {
          if (statSync(path).isDirectory) {
            const appsFolders = getAppFolders.call(this, path, deploymentApplicationType);

            if (appsFolders.length === 0) {
              return deploymentApplicationType === MONOLITH
                ? `No monolith found in ${path}`
                : `No microservice or gateway found in ${path}`;
            }
            return true;
          }
        } catch {
          // Ignore error
        }
        return `${path} is not a directory or doesn't exist`;
      },
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.directoryPath = props.directoryPath;
  // Patch the path if there is no trailing "/"
  if (!this.directoryPath.endsWith('/')) {
    this.log.log(chalk.yellow(`The path "${this.directoryPath}" does not end with a trailing "/", adding it anyway.`));
    this.directoryPath += '/';
  }

  this.appsFolders = getAppFolders.call(this, this.destinationPath(this.directoryPath), deploymentApplicationType);

  // Removing registry from appsFolders, using reverse for loop
  for (let i = this.appsFolders.length - 1; i >= 0; i--) {
    if (this.appsFolders[i] === 'jhipster-registry' || this.appsFolders[i] === 'registry') {
      this.appsFolders.splice(i, 1);
    }
  }

  this.log.log(chalk.green(`${this.appsFolders.length} applications found at ${this.destinationPath(this.directoryPath)}\n`));
}

/**
 * Ask For Apps
 */
async function askForApps() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const messageAskForApps = 'Which applications do you want to include in your configuration?';

  const prompts = [
    {
      type: 'checkbox',
      name: 'chosenApps',
      message: messageAskForApps,
      choices: this.appsFolders ?? [],
      default: this.jhipsterConfig.appsFolders,
      validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
    },
  ];

  const props = await this.prompt(prompts);
  this.appsFolders = this.jhipsterConfig.appsFolders = props.chosenApps;
  await loadConfigs.call(this);
}

/**
 * Ask For Clusters Mode
 */
async function askForClustersMode() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

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

  const props = await this.prompt(prompts, this.config);
  this.clusteredDbApps = props.clusteredDbApps;
}

/**
 * Ask For Monitoring
 */
async function askForMonitoring() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

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

  const props = await this.prompt(prompts, this.config);
  this.monitoring = props.monitoring;
}

/**
 * Ask For Service Discovery
 */
async function askForServiceDiscovery() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const serviceDiscoveryEnabledApps = [];
  this.appConfigs.forEach(appConfig => {
    if (appConfig.serviceDiscoveryAny) {
      serviceDiscoveryEnabledApps.push({
        baseName: appConfig.baseName,
        serviceDiscoveryType: appConfig.serviceDiscoveryType,
      });
    }
  });

  if (serviceDiscoveryEnabledApps.length === 0) {
    this.serviceDiscoveryType = this.jhipsterConfig.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
    return;
  }

  if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === CONSUL)) {
    this.serviceDiscoveryType = this.jhipsterConfig.serviceDiscoveryType = CONSUL;
    this.log.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
  } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === EUREKA)) {
    this.serviceDiscoveryType = this.jhipsterConfig.serviceDiscoveryType = EUREKA;
    this.log.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
  } else {
    this.log.warn(
      chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'),
    );
    this.log.verboseInfo('Your service discovery enabled apps:');
    serviceDiscoveryEnabledApps.forEach(app => {
      this.log.verboseInfo(` -${app.baseName} (${app.serviceDiscoveryType})`);
    });

    const prompts = [
      {
        type: 'list',
        name: 'serviceDiscoveryType',
        message: 'Which Service Discovery registry and Configuration server would you like to use ?',
        choices: [
          {
            value: CONSUL,
            name: 'Consul',
          },
          {
            value: EUREKA,
            name: 'JHipster Registry',
          },
          {
            value: NO_SERVICE_DISCOVERY,
            name: 'No Service Discovery and Configuration',
          },
        ],
        default: CONSUL,
      },
    ];

    const props = await this.prompt(prompts, this.config);
    this.serviceDiscoveryType = props.serviceDiscoveryType;
  }
}

/**
 * Ask For Admin Password
 */
async function askForAdminPassword() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  if (this.serviceDiscoveryType !== EUREKA) return;

  const prompts = [
    {
      type: 'input',
      name: 'adminPassword',
      message: 'Enter the admin password used to secure the JHipster Registry',
      default: 'admin',
      validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.adminPassword = props.adminPassword;
  this.adminPasswordBase64 = convertSecretToBase64(this.adminPassword);
}

/**
 * Ask For Docker Repository Name
 */
async function askForDockerRepositoryName() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const prompts = [
    {
      type: 'input',
      name: 'dockerRepositoryName',
      message: 'What should we use for the base Docker repository name?',
      default: this.dockerRepositoryName,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.dockerRepositoryName = props.dockerRepositoryName;
}

/**
 * Ask For Docker Push Command
 */
async function askForDockerPushCommand() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const prompts = [
    {
      type: 'input',
      name: 'dockerPushCommand',
      message: 'What command should we use for push Docker image to repository?',
      default: this.dockerPushCommand ? this.dockerPushCommand : 'docker push',
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.dockerPushCommand = props.dockerPushCommand;
}

/**
 * Get App Folders
 * @param input path to join to destination path
 * @param deploymentApplicationType type of application being composed
 * @returns {Array} array of string representing app folders
 */
export function getAppFolders(directory, deploymentApplicationType) {
  const files = readdirSync(directory);
  const appsFolders = [];

  files.forEach(file => {
    try {
      if (statSync(join(directory, file)).isDirectory()) {
        const yoRcFile = join(directory, file, '.yo-rc.json');
        if (statSync(yoRcFile).isFile()) {
          try {
            const fileData = JSON.parse(readFileSync(yoRcFile).toString());
            if (
              fileData['generator-jhipster'].baseName !== undefined &&
              (deploymentApplicationType === undefined ||
                deploymentApplicationType === (fileData['generator-jhipster'].applicationType ?? MONOLITH) ||
                (deploymentApplicationType === MICROSERVICE && fileData['generator-jhipster'].applicationType === GATEWAY))
            ) {
              appsFolders.push(/([^/]*)\/*$/.exec(file)[1]);
            }
          } catch (err) {
            this.log.error(chalk.red(`${yoRcFile}: this .yo-rc.json can't be read`));
            this.log.debug('Error:', err);
          }
        }
      }
    } catch {
      // Not a file or directory
    }
  });

  return appsFolders;
}
