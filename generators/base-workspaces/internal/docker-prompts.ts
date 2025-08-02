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

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { monitoringTypes, serviceDiscoveryTypes } from '../../../lib/jhipster/index.ts';
import { asPromptingTask } from '../../base-application/support/index.ts';
import { asPromptingWorkspacesTask } from '../support/task-type-inference.ts';
import type { BaseKubernetesGenerator } from '../../kubernetes/generator.ts';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../../lib/core/application-types.ts';
import type CoreGenerator from '../../base-core/generator.ts';

const { PROMETHEUS } = monitoringTypes;
const monitoring = monitoringTypes;

const NO_MONITORING = monitoring.NO;
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;

/**
 * Ask For Application Type
 */
export const askForApplicationType = asPromptingTask(async function askForApplicationType({ control }) {
  if (!this.shouldAskForPrompts({ control })) return;

  await this.prompt(
    [
      {
        type: 'list',
        name: 'deploymentApplicationType',
        message: 'Which *type* of application would you like to deploy?',
        choices: [
          {
            value: APPLICATION_TYPE_MONOLITH,
            name: 'Monolithic application',
          },
          {
            value: APPLICATION_TYPE_MICROSERVICE,
            name: 'Microservice application',
          },
        ],
        default: APPLICATION_TYPE_MONOLITH,
      },
    ],
    this.config,
  );
});

/**
 * Ask For Gateway Type
 */
export const askForGatewayType = asPromptingTask(async function askForGatewayType(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;
  if (this.jhipsterConfigWithDefaults.deploymentApplicationType !== APPLICATION_TYPE_MICROSERVICE) return;

  await this.prompt(
    [
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
    ],
    this.config,
  );
});

/**
 * Ask For Path
 */
export const askForPath = asPromptingTask(async function askForPath(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;

  const deploymentApplicationType = this.jhipsterConfigWithDefaults.deploymentApplicationType;
  let messageAskForPath;
  if (deploymentApplicationType === APPLICATION_TYPE_MONOLITH) {
    messageAskForPath = 'Enter the root directory where your applications are located';
  } else {
    messageAskForPath = 'Enter the root directory where your gateway(s) and microservices are located';
  }

  await this.prompt(
    [
      {
        type: 'input',
        name: 'directoryPath',
        message: messageAskForPath,
        default: '../',
        validate: async input => {
          const path = this.destinationPath(input);
          try {
            if (statSync(path).isDirectory()) {
              const appsFolders = getAppFolders.call(this, path, deploymentApplicationType);

              if (appsFolders.length === 0) {
                return deploymentApplicationType === APPLICATION_TYPE_MONOLITH
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
    ],
    this.config,
  );
});

/**
 * Ask For Apps
 */
export const askForApps = asPromptingTask(async function askForApps(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;

  const workspacesRoot = this.destinationPath(this.jhipsterConfig.directoryPath);
  const appsFolders = getAppFolders
    .call(this, workspacesRoot, this.jhipsterConfigWithDefaults.deploymentApplicationType)
    .filter(appFolder => appFolder !== 'jhipster-registry' && appFolder !== 'registry');

  this.log.log(chalk.green(`${appsFolders.length} applications found at ${workspacesRoot}\n`));

  const messageAskForApps = 'Which applications do you want to include in your configuration?';

  const answers = await this.prompt([
    {
      type: 'checkbox',
      name: 'chosenApps',
      message: messageAskForApps,
      choices: appsFolders ?? [],
      default: this.jhipsterConfig.appsFolders,
      validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
    },
  ]);
  this.jhipsterConfig.appsFolders = answers.chosenApps;
});

/**
 * Ask For Clusters Mode
 */
export const askForClustersMode: any = asPromptingWorkspacesTask(async function askForClustersMode({ control, applications }) {
  if (!this.shouldAskForPrompts({ control })) return;

  const clusteredDbApps = applications.filter(app => app.databaseTypeMongodb || app.databaseTypeCouchbase).map(app => app.appFolder!);
  if (clusteredDbApps.length === 0) return;

  await this.prompt(
    [
      {
        type: 'checkbox',
        name: 'clusteredDbApps',
        message: 'Which applications do you want to use with clustered databases (only available with MongoDB and Couchbase)?',
        choices: clusteredDbApps,
      },
    ],
    this.config,
  );
});

/**
 * Ask For Monitoring
 */
export const askForMonitoring = asPromptingTask(async function askForMonitoring({ control }) {
  if (!this.shouldAskForPrompts({ control })) return;

  await this.prompt(
    [
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
        default: NO_MONITORING,
      },
    ],
    this.config,
  );
});

/**
 * Ask For Service Discovery
 */
export const askForServiceDiscovery: any = asPromptingWorkspacesTask(async function askForServiceDiscovery({ control, applications }) {
  if (!this.shouldAskForPrompts({ control })) return;

  const serviceDiscoveryEnabledApps = applications
    .filter(app => app.serviceDiscoveryAny)
    .map(app => ({
      baseName: app.baseName,
      serviceDiscoveryType: app.serviceDiscoveryType,
    }));

  if (serviceDiscoveryEnabledApps.length === 0) {
    this.jhipsterConfig.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
    return;
  }

  if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === CONSUL)) {
    this.jhipsterConfig.serviceDiscoveryType = CONSUL;
    this.log.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
  } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryType === EUREKA)) {
    this.jhipsterConfig.serviceDiscoveryType = EUREKA;
    this.log.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
  } else {
    this.log.warn(
      chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'),
    );
    this.log.verboseInfo('Your service discovery enabled apps:');
    serviceDiscoveryEnabledApps.forEach(app => {
      this.log.verboseInfo(` -${app.baseName} (${app.serviceDiscoveryType})`);
    });

    await this.prompt(
      [
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
      ],
      this.config,
    );
  }
});

export const askForClustersModeWorkspace = asPromptingWorkspacesTask(async function askForClustersMode({ control, applications }) {
  if (!this.shouldAskForPrompts({ control })) return;
  const clusteredDbApps = applications.filter(app => app.databaseTypeMongodb || app.databaseTypeCouchbase).map(app => app.appFolder!);
  if (clusteredDbApps.length === 0) return;

  await this.prompt(
    [
      {
        type: 'checkbox',
        name: 'clusteredDbApps',
        message: 'Which applications do you want to use with clustered databases (only available with MongoDB and Couchbase)?',
        choices: clusteredDbApps,
        default: clusteredDbApps,
      },
    ],
    this.config,
  );
});

export const askForServiceDiscoveryWorkspace = asPromptingWorkspacesTask(async function askForServiceDiscovery({ control, applications }) {
  if (!this.shouldAskForPrompts({ control })) return;
  const serviceDiscoveryEnabledApps = applications.filter(app => app.serviceDiscoveryAny);
  if (serviceDiscoveryEnabledApps.length === 0) {
    this.jhipsterConfig.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
    return;
  }

  if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryConsul)) {
    this.jhipsterConfig.serviceDiscoveryType = CONSUL;
    this.log.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
  } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryTypeEureka)) {
    this.jhipsterConfig.serviceDiscoveryType = EUREKA;
    this.log.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
  } else {
    this.log.warn(
      chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'),
    );
    this.log.verboseInfo('Your service discovery enabled apps:');
    serviceDiscoveryEnabledApps.forEach(app => {
      this.log.verboseInfo(` -${app.baseName} (${app.serviceDiscoveryType})`);
    });

    await this.prompt(
      [
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
      ],
      this.config,
    );
  }
  if (this.jhipsterConfig.serviceDiscoveryType === EUREKA) {
    await this.prompt(
      [
        {
          type: 'input',
          name: 'adminPassword',
          message: 'Enter the admin password used to secure the JHipster Registry',
          default: 'admin',
          validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
        },
      ],
      this.config,
    );
  }
});

/**
 * Ask For Admin Password
 */
export const askForAdminPassword = asPromptingTask(async function askForAdminPassword(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;
  if (this.jhipsterConfigWithDefaults.serviceDiscoveryType !== (EUREKA as string)) return;

  await this.prompt(
    [
      {
        type: 'input',
        name: 'adminPassword',
        message: 'Enter the admin password used to secure the JHipster Registry',
        default: 'admin',
        validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
      },
    ],
    this.config,
  );
});

/**
 * Ask For Docker Repository Name
 */
export const askForDockerRepositoryName = asPromptingTask(async function askForDockerRepositoryName(
  this: BaseKubernetesGenerator,
  { control },
) {
  if (!this.shouldAskForPrompts({ control })) return;

  await this.prompt(
    [
      {
        type: 'input',
        name: 'dockerRepositoryName',
        message: 'What should we use for the base Docker repository name?',
        default: this.jhipsterConfigWithDefaults.dockerRepositoryName,
      },
    ],
    this.config,
  );
});

/**
 * Ask For Docker Push Command
 */
export const askForDockerPushCommand = asPromptingTask(async function askForDockerPushCommand(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;

  await this.prompt(
    [
      {
        type: 'input',
        name: 'dockerPushCommand',
        message: 'What command should we use for push Docker image to repository?',
        default: this.jhipsterConfigWithDefaults.dockerPushCommand,
      },
    ],
    this.config,
  );
});

/**
 * Get App Folders
 * @param directory path to join to destination path
 * @param deploymentApplicationType type of application being composed
 * @returns {Array} array of string representing app folders
 */
export function getAppFolders(this: CoreGenerator, directory: string, deploymentApplicationType?: string): string[] {
  const files = readdirSync(directory);
  const appsFolders: string[] = [];

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
                deploymentApplicationType === (fileData['generator-jhipster'].applicationType ?? APPLICATION_TYPE_MONOLITH) ||
                (deploymentApplicationType === APPLICATION_TYPE_MICROSERVICE &&
                  fileData['generator-jhipster'].applicationType === APPLICATION_TYPE_GATEWAY))
            ) {
              appsFolders.push(/([^/]*)\/*$/.exec(file)![1]);
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
