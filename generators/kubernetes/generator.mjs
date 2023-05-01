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
/* eslint-disable consistent-return, import/no-named-as-default-member */
import chalk from 'chalk';
import fs from 'fs';

import BaseDockerGenerator from '../base-docker/index.mjs';

import prompts from './prompts.mjs';
import { writeFiles } from './files.mjs';
import { buildToolTypes, messageBrokerTypes, logManagementTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_KUBERNETES } from '../generator-list.mjs';
import statistics from '../statistics.mjs';

import { checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } from '../base-docker/docker-base.mjs';
import {
  checkKubernetes,
  loadConfig,
  saveConfig,
  setupKubernetesConstants,
  derivedKubernetesPlatformProperties,
} from './kubernetes-base.mjs';
import jdlToJsonFieldConverter from '../../jdl/converters/jdl-to-json/jdl-to-json-field-converter.js';

const { KAFKA, RABBITMQ } = messageBrokerTypes; // added rabbitmq option cmi-tic-varun
const { MAVEN } = buildToolTypes;
const { ECK } = logManagementTypes;

/**
 * @class
 * @extends {BaseDockerGenerator}
 */
export default class KubernetesGenerator extends BaseDockerGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_KUBERNETES);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.logger.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Generator ${chalk.bold('⎈')}`));
        this.logger.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      ...super.initializing,
      checkKubernetes,
      loadConfig,
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
      askForClustersMode: prompts.askForClustersMode,
      askForServiceDiscovery: prompts.askForServiceDiscovery,
      askForAdminPassword: prompts.askForAdminPassword,
      askForKubernetesNamespace: prompts.askForKubernetesNamespace,
      askForDockerRepositoryName: prompts.askForDockerRepositoryName,
      askForDockerPushCommand: prompts.askForDockerPushCommand,
      askForIstioSupport: prompts.askForIstioSupport,
      askForKubernetesServiceType: prompts.askForKubernetesServiceType,
      askForIngressType: prompts.askForIngressType,
      askForIngressDomain: prompts.askForIngressDomain,
      askForPersistentStorage: prompts.askForPersistentStorage,
      askForStorageClassName: prompts.askForStorageClassName,
    };
  }

  get [BaseDockerGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_KUBERNETES);
      },

      checkImages,
      generateJwtSecret,
      configureImageNames,
      setAppsFolderPaths,

      setPostPromptProp() {
        this.appConfigs.forEach(element => {
          element.clusteredDb ? (element.dbPeerCount = 3) : (element.dbPeerCount = 1);
          if (element.messageBroker === KAFKA) {
            this.useKafka = true;
          }
          if (element.messageBroker === RABBITMQ) {
            this.useRabbitMQ = true;
          }
          if (element.logManagementType === ECK) {
            this.useECK = true;
          }
        });

       /*  added parameters
        1) usesIngress (default: nginx)
        2) useKeycloak (default: depends on usesIngress or istio) @cmi-tic-craxkumar */
        this.usesOauth2 = this.appConfigs.some(appConfig => appConfig.authenticationTypeOauth2);
        this.usesIngress = this.kubernetesServiceType === 'Ingress'  && this.ingressType === 'nginx';
        this.useKeycloak = (this.usesOauth2 && this.usesIngress) || (this.usesOauth2 && this.istio);
      },
      saveConfig,
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
        derivedKubernetesPlatformProperties(this);
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
      deploy() {
        if (this.hasWarning) {
          this.logger.warn(`${chalk.yellow.bold('WARNING!')} Kubernetes configuration generated, but no Jib cache found`);
          this.logger.warn('If you forgot to generate the Docker image for this application, please run:');
          this.logger.warn(this.warningMessage);
        } else {
          this.logger.info(`\n${chalk.bold.green('Kubernetes configuration successfully generated!')}`);
        }

        this.logger.warn(
          '\nYou will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:'
        );
        for (let i = 0; i < this.appsFolders.length; i++) {
          const originalImageName = this.appConfigs[i].baseName.toLowerCase();
          const targetImageName = this.appConfigs[i].targetImageName;
          if (originalImageName !== targetImageName) {
            this.logger.info(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
          }
          this.logger.info(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }

        if (this.dockerRepositoryName) {
          this.logger.log('\nAlternatively, you can use Jib to build and push image directly to a remote registry:');
          this.appsFolders.forEach((appsFolder, index) => {
            const appConfig = this.appConfigs[index];
            let runCommand = '';
            if (appConfig.buildTool === MAVEN) {
              runCommand = `./mvnw -ntp -Pprod verify jib:build -Djib.to.image=${appConfig.targetImageName}`;
            } else {
              runCommand = `./gradlew bootJar -Pprod jib -Djib.to.image=${appConfig.targetImageName}`;
            }
            this.logger.info(`  ${chalk.cyan(`${runCommand}`)} in ${this.destinationPath(this.directoryPath + appsFolder)}`);
          });
        }
        this.logger.log('\nYou can deploy all your apps by running the following kubectl command:');
        this.logger.info(`  ${chalk.cyan('bash kubectl-apply.sh -f')}`);
        this.logger.log('\n[OR]');
        this.logger.log('\nIf you want to use kustomize configuration, then run the following command:');
        this.logger.info(`  ${chalk.cyan('bash kubectl-apply.sh -k')}`);
        if (this.gatewayNb + this.monolithicNb >= 1) {
          const namespaceSuffix = this.kubernetesNamespace === 'default' ? '' : ` -n ${this.kubernetesNamespace}`;
          this.logger.info("\nUse these commands to find your application's IP addresses:");
          for (let i = 0; i < this.appsFolders.length; i++) {
            if (this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
              this.logger.info(`  ${chalk.cyan(`kubectl get svc ${this.appConfigs[i].baseName.toLowerCase()}${namespaceSuffix}`)}`);
            }
          }
          this.logger.log();
        }
        // Make the apply script executable
        try {
          fs.chmodSync('kubectl-apply.sh', '755');
        } catch (err) {
          this.logger.warn("Failed to make 'kubectl-apply.sh' executable, you may need to run 'chmod +x kubectl-apply.sh'");
        }
      },
    };
  }

  get [BaseDockerGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
  
}