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
/* eslint-disable import/no-named-as-default-member */
import chalk from 'chalk';
import shelljs from 'shelljs';

import BaseDockerGenerator from '../base-docker/index.mjs';

import prompts from './prompts.mjs';
import { GENERATOR_OPENSHIFT } from '../generator-list.mjs';
import { loadFromYoRc, checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } from '../base-docker/docker-base.mjs';
import { setupKubernetesConstants } from '../kubernetes/kubernetes-base.mjs';
import statistics from '../statistics.cjs';

import {
  applicationTypes,
  databaseTypes,
  messageBrokerTypes,
  monitoringTypes,
  openshiftPlatformTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';
import { writeFiles } from './files.mjs';

const { KAFKA } = messageBrokerTypes;
const { PROMETHEUS } = monitoringTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { EUREKA } = serviceDiscoveryTypes;
const { StorageTypes } = openshiftPlatformTypes;

const NO_DATABASE = databaseTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const { EPHEMERAL, PERSISTENT } = StorageTypes;

/* eslint-disable consistent-return */
/**
 * @class
 * @extends {BaseDockerGenerator}
 */
export default class OpenshiftGenerator extends BaseDockerGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_OPENSHIFT);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log(chalk.white(`${chalk.bold('⭕')} [*BETA*] Welcome to the JHipster OpenShift Generator ${chalk.bold('⭕')}`));
        this.log(
          chalk.white(
            `Files will be generated in folder: ${chalk.yellow(
              this.destinationRoot()
            )} or in the root directory path that you select in the subsequent step`
          )
        );
      },

      ...super.initializing,

      checkOpenShift() {
        if (this.skipChecks) return;
        const done = this.async();

        shelljs.exec('oc version', { silent: true }, (code, stdout, stderr) => {
          if (stderr) {
            this.log(
              `${chalk.yellow.bold('WARNING!')} oc 1.3 or later is not installed on your computer.\n` +
                'Make sure you have OpenShift Origin / OpenShift Container Platform and CLI installed. Read' +
                ' https://github.com/openshift/origin/\n'
            );
          }
          done();
        });
      },

      loadConfig() {
        loadFromYoRc.call(this);
        this.openshiftNamespace = this.config.get('openshiftNamespace');
        this.storageType = this.config.get('storageType');
        this.registryReplicas = this.config.get('registryReplicas');
      },

      setupKubernetesConstants,
    };
  }

  get [BaseDockerGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askForApplicationType: prompts.askForApplicationType,
      askForPath: prompts.askForPath,
      askForApps: prompts.askForApps,
      askForMonitoring: prompts.askForMonitoring,
      askForServiceDiscovery: prompts.askForServiceDiscovery,
      askForAdminPassword: prompts.askForAdminPassword,
      askForOpenShiftNamespace: prompts.askForOpenShiftNamespace,
      askForStorageType: prompts.askForStorageType,
      askForDockerRepositoryName: prompts.askForDockerRepositoryName,
      askForDockerPushCommand: prompts.askForDockerPushCommand,
    };
  }

  get [BaseDockerGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_OPENSHIFT);
      },

      checkImages,
      generateJwtSecret,
      configureImageNames,
      setAppsFolderPaths,

      // place holder for future changes (may be prompt or something else)
      setRegistryReplicas() {
        this.registryReplicas = 2;
      },

      setPostPromptProp() {
        this.appConfigs.some(element => {
          if (element.messageBroker === KAFKA) {
            this.useKafka = true;
            return true;
          }
          return false;
        });
      },

      saveConfig() {
        this.config.set({
          appsFolders: this.appsFolders,
          directoryPath: this.directoryPath,
          clusteredDbApps: this.clusteredDbApps,
          serviceDiscoveryType: this.serviceDiscoveryType,
          monitoring: this.monitoring,
          jwtSecretKey: this.jwtSecretKey,
          dockerRepositoryName: this.dockerRepositoryName,
          dockerPushCommand: this.dockerPushCommand,
          openshiftNamespace: this.openshiftNamespace,
          storageType: this.storageType,
          registryReplicas: this.registryReplicas,
        });
      },
    };
  }

  get [BaseDockerGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return {
      loadSharedConfig() {
        this.appConfigs.forEach(element => {
          this.loadAppConfig(element, element);
          this.loadServerConfig(element, element);

          this.loadDerivedAppConfig(element);
          this.loadDerivedServerConfig(element);
        });
        this.loadDeploymentConfig(this);
        this._loadDerivedOpenshiftConfig(this);
      },
    };
  }

  get [BaseDockerGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get writing() {
    return writeFiles();
  }

  get [BaseDockerGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      displayOpenshiftDeploymentProcedure() {
        if (this.hasWarning) {
          this.log(`\n${chalk.yellow.bold('WARNING!')} OpenShift configuration generated, but no Jib cache found`);
          this.log('If you forgot to generate the Docker image for this application, please run:');
          this.log(this.warningMessage);
        } else {
          this.log(`\n${chalk.bold.green('OpenShift configuration successfully generated!')}`);
        }

        this.log(
          `${chalk.yellow.bold(
            'WARNING!'
          )} You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:`
        );
        for (let i = 0; i < this.appsFolders.length; i++) {
          const originalImageName = this.appConfigs[i].baseName.toLowerCase();
          const targetImageName = this.appConfigs[i].targetImageName;
          if (originalImageName !== targetImageName) {
            this.log(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
          }
          this.log(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }

        this.log('\nYou can deploy all your apps by running: ');
        this.log(`  ${chalk.cyan(`${this.directoryPath}ocp/ocp-apply.sh`)}`);
        this.log('OR');
        this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/scc-config.yml | oc apply -f -`)}`);
        if (this.monitoring === PROMETHEUS) {
          this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/monitoring/jhipster-metrics.yml | oc apply -f -`)}`);
        }
        if (this.useKafka) {
          this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/messagebroker/kafka.yml | oc apply -f -`)}`);
        }
        for (let i = 0, regIndex = 0; i < this.appsFolders.length; i++) {
          const app = this.appConfigs[i];
          const appName = app.baseName.toLowerCase();
          if (app.searchEngine === ELASTICSEARCH) {
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/${appName}/${appName}-elasticsearch.yml | oc apply -f -`)}`);
          }
          if (app.serviceDiscoveryType !== NO_SERVICE_DISCOVERY && regIndex++ === 0) {
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/application-configmap.yml | oc apply -f -`)}`);
            if (app.serviceDiscoveryType === EUREKA) {
              this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/jhipster-registry.yml | oc apply -f -`)}`);
            } else {
              this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/consul.yml | oc apply -f -`)}`);
            }
          }
          if (app.prodDatabaseType !== NO_DATABASE) {
            this.log(
              `  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/${appName}/${appName}-${app.prodDatabaseType}.yml | oc apply -f -`)}`
            );
          }
          this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/${appName}/${appName}-deployment.yml | oc apply -f -`)}`);
        }

        if (this.gatewayNb + this.monolithicNb >= 1) {
          this.log("\nUse these commands to find your application's IP addresses:");
          for (let i = 0; i < this.appsFolders.length; i++) {
            if (this.appConfigs[i].applicationType === GATEWAY || this.appConfigs[i].applicationType === MONOLITH) {
              this.log(`  ${chalk.cyan(`oc get svc ${this.appConfigs[i].baseName}`)}`);
            }
          }
          this.log();
        }
      },
    };
  }

  get [BaseDockerGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  _loadDerivedOpenshiftConfig(dest = this) {
    dest.storageTypeEphemeral = dest.storageType === EPHEMERAL;
    dest.storageTypePersistent = dest.storageType === PERSISTENT;
  }
}
