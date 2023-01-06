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

import prompts from '../kubernetes/prompts.mjs';
import { writeFiles } from './files.mjs';
import { GENERATOR_KUBERNETES_HELM } from '../generator-list.mjs';
import { checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } from '../base-docker/docker-base.mjs';
import {
  checkKubernetes,
  checkHelm,
  loadConfig,
  saveConfig,
  setupKubernetesConstants,
  setupHelmConstants,
  derivedKubernetesPlatformProperties,
} from '../kubernetes/kubernetes-base.mjs';
import statistics from '../statistics.cjs';
import { messageBrokerTypes } from '../../jdl/jhipster/index.mjs';

const { KAFKA } = messageBrokerTypes;

/**
 * @class
 * @extends {BaseDockerGenerator}
 */
export default class KubernetesHelmGenerator extends BaseDockerGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_KUBERNETES_HELM);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Helm Generator ${chalk.bold('⎈')}`));
        this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      ...super.initializing,
      checkKubernetes,
      checkHelm,
      loadConfig,
      setupKubernetesConstants,
      setupHelmConstants,
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
    };
  }

  get [BaseDockerGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_KUBERNETES_HELM);
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
          this.log(`\n${chalk.yellow.bold('WARNING!')} Helm configuration generated, but no Jib cache found`);
          this.log('If you forgot to generate the Docker image for this application, please run:');
          this.log(this.warningMessage);
        } else {
          this.log(`\n${chalk.bold.green('Helm configuration successfully generated!')}`);
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
        this.log('\nYou can deploy all your apps by running the following script:');
        this.log(`  ${chalk.cyan('bash helm-apply.sh')}`);
        this.log('\nYou can upgrade (after any changes) all your apps by running the following script:');
        this.log(`  ${chalk.cyan('bash helm-upgrade.sh')}`);
        // Make the apply script executable
        try {
          fs.chmodSync('helm-apply.sh', '755');
          fs.chmodSync('helm-upgrade.sh', '755');
        } catch (err) {
          this.log(
            `${chalk.yellow.bold(
              'WARNING!'
            )}Failed to make 'helm-apply.sh', 'helm-upgrade.sh' executable, you may need to run 'chmod +x helm-apply.sh helm-upgrade.sh`
          );
        }
      },
    };
  }

  get [BaseDockerGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
