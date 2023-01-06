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
import { buildToolTypes, messageBrokerTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_KUBERNETES } from '../generator-list.mjs';
import statistics from '../statistics.cjs';

import { checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } from '../base-docker/docker-base.mjs';
import {
  checkKubernetes,
  loadConfig,
  saveConfig,
  setupKubernetesConstants,
  derivedKubernetesPlatformProperties,
} from './kubernetes-base.mjs';

const { KAFKA } = messageBrokerTypes;
const { MAVEN } = buildToolTypes;

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
        this.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Generator ${chalk.bold('⎈')}`));
        this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
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
        });
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
          this.log(`\n${chalk.yellow.bold('WARNING!')} Kubernetes configuration generated, but no Jib cache found`);
          this.log('If you forgot to generate the Docker image for this application, please run:');
          this.log(this.warningMessage);
        } else {
          this.log(`\n${chalk.bold.green('Kubernetes configuration successfully generated!')}`);
        }

        this.log(
          `\n${chalk.yellow.bold(
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

        if (this.dockerRepositoryName) {
          this.log(`\n${chalk.green.bold('INFO!')} Alternatively, you can use Jib to build and push image directly to a remote registry:`);
          this.appsFolders.forEach((appsFolder, index) => {
            const appConfig = this.appConfigs[index];
            let runCommand = '';
            if (appConfig.buildTool === MAVEN) {
              runCommand = `./mvnw -ntp -Pprod verify jib:build -Djib.to.image=${appConfig.targetImageName}`;
            } else {
              runCommand = `./gradlew bootJar -Pprod jib -Djib.to.image=${appConfig.targetImageName}`;
            }
            this.log(`  ${chalk.cyan(`${runCommand}`)} in ${this.destinationPath(this.directoryPath + appsFolder)}`);
          });
        }
        this.log('\nYou can deploy all your apps by running the following kubectl command:');
        this.log(`  ${chalk.cyan('bash kubectl-apply.sh -f')}`);
        this.log('\n[OR]');
        this.log('\nIf you want to use kustomize configuration, then run the following command:');
        this.log(`  ${chalk.cyan('bash kubectl-apply.sh -k')}`);
        if (this.gatewayNb + this.monolithicNb >= 1) {
          const namespaceSuffix = this.kubernetesNamespace === 'default' ? '' : ` -n ${this.kubernetesNamespace}`;
          this.log("\nUse these commands to find your application's IP addresses:");
          for (let i = 0; i < this.appsFolders.length; i++) {
            if (this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
              this.log(`  ${chalk.cyan(`kubectl get svc ${this.appConfigs[i].baseName.toLowerCase()}${namespaceSuffix}`)}`);
            }
          }
          this.log();
        }
        // Make the apply script executable
        try {
          fs.chmodSync('kubectl-apply.sh', '755');
        } catch (err) {
          this.log(
            `${chalk.yellow.bold('WARNING!')}Failed to make 'kubectl-apply.sh' executable, you may need to run 'chmod +x kubectl-apply.sh'`
          );
        }
      },
    };
  }

  get [BaseDockerGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
