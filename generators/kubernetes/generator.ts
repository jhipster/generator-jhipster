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

import fs from 'fs';
import chalk from 'chalk';

import BaseWorkspacesGenerator from '../base-workspaces/index.js';

import { buildToolTypes, messageBrokerTypes } from '../../lib/jhipster/index.js';

import { checkImages, configureImageNames, generateJwtSecret, loadFromYoRc } from '../base-workspaces/internal/docker-base.js';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.js';
import { loadDeploymentConfig, loadDockerDependenciesTask } from '../base-workspaces/internal/index.js';
import { checkDocker } from '../docker/support/index.js';
import { loadDerivedServerAndPlatformProperties } from '../base-workspaces/support/index.js';
import { loadDerivedAppConfig } from '../app/support/index.js';
import { GENERATOR_BOOTSTRAP_WORKSPACES } from '../generator-list.js';
import {
  askForAdminPassword,
  askForApplicationType,
  askForApps,
  askForClustersMode,
  askForDockerPushCommand,
  askForDockerRepositoryName,
  askForMonitoring,
  askForPath,
  askForServiceDiscovery,
} from '../base-workspaces/internal/docker-prompts.js';
import { checkKubernetes, derivedKubernetesPlatformProperties, loadConfig, setupKubernetesConstants } from './kubernetes-base.js';
import { writeFiles } from './files.js';
import {
  askForIngressDomain,
  askForIngressType,
  askForIstioSupport,
  askForKubernetesNamespace,
  askForKubernetesServiceType,
  askForPersistentStorage,
  askForStorageClassName,
} from './prompts.js';

const { KAFKA } = messageBrokerTypes;
const { MAVEN } = buildToolTypes;

/**
 * @class
 * @extends {BaseWorkspacesGenerator}
 */
export default class KubernetesGenerator extends BaseWorkspacesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_WORKSPACES);
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Generator ${chalk.bold('⎈')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      existingDeployment() {
        this.regenerate = this.regenerate || this.config.existed;
      },
      loadDockerDependenciesTask,
      checkDocker,
      checkKubernetes,
      loadConfig,
      setupKubernetesConstants,
    };
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForApplicationType,
      askForPath,
      askForApps,
      askForMonitoring,
      askForClustersMode,
      askForServiceDiscovery,
      askForAdminPassword,
      askForKubernetesNamespace,
      askForDockerRepositoryName,
      askForDockerPushCommand,
      askForIstioSupport,
      askForKubernetesServiceType,
      askForIngressType,
      askForIngressDomain,
      askForPersistentStorage,
      askForStorageClassName,
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      generateJwtSecret,
    };
  }

  get [BaseWorkspacesGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return {
      loadFromYoRc,
      loadSharedConfig() {
        for (const app of this.appConfigs) {
          loadDerivedAppConfig({ application: app });
          loadDerivedServerAndPlatformProperties({ application: app });
        }
        loadDeploymentConfig.call(this);
        derivedKubernetesPlatformProperties(this);
      },
    };
  }

  get [BaseWorkspacesGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return {
      configureImageNames,

      setPostPromptProp() {
        this.appConfigs.forEach(element => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          element.clusteredDb ? (element.dbPeerCount = 3) : (element.dbPeerCount = 1);
          if (element.messageBroker === KAFKA) {
            this.useKafka = true;
          }
        });
        this.usesOauth2 = this.appConfigs.some(appConfig => appConfig.authenticationTypeOauth2);
        this.usesIngress = this.kubernetesServiceType === 'Ingress';
        this.useKeycloak = this.usesOauth2 && this.usesIngress;
      },
    };
  }

  get [BaseWorkspacesGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return writeFiles();
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      checkImages,
      deploy() {
        if (this.hasWarning) {
          this.log.warn(`${chalk.yellow.bold('WARNING!')} Kubernetes configuration generated, but no Jib cache found`);
          this.log.warn('If you forgot to generate the Docker image for this application, please run:');
          this.log.warn(this.warningMessage);
        } else {
          this.log.verboseInfo(`\n${chalk.bold.green('Kubernetes configuration successfully generated!')}`);
        }

        this.log.warn(
          '\nYou will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:',
        );
        for (let i = 0; i < this.appsFolders.length; i++) {
          const originalImageName = this.appConfigs[i].baseName.toLowerCase();
          const targetImageName = this.appConfigs[i].targetImageName;
          if (originalImageName !== targetImageName) {
            this.log.verboseInfo(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
          }
          this.log.verboseInfo(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }

        if (this.dockerRepositoryName) {
          this.log.log('\nAlternatively, you can use Jib to build and push image directly to a remote registry:');
          this.appsFolders.forEach((appsFolder, index) => {
            const appConfig = this.appConfigs[index];
            let runCommand = '';
            if (appConfig.buildTool === MAVEN) {
              runCommand = `./mvnw -ntp -Pprod verify jib:build${
                process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''
              } -Djib.to.image=${appConfig.targetImageName}`;
            } else {
              runCommand = `./gradlew bootJar -Pprod jib${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''} -Djib.to.image=${
                appConfig.targetImageName
              }`;
            }
            this.log.verboseInfo(`  ${chalk.cyan(`${runCommand}`)} in ${this.destinationPath(this.directoryPath + appsFolder)}`);
          });
        }
        this.log.log('\nYou can deploy all your apps by running the following kubectl command:');
        this.log.verboseInfo(`  ${chalk.cyan('bash kubectl-apply.sh -f')}`);
        this.log.log('\n[OR]');
        this.log.log('\nIf you want to use kustomize configuration, then run the following command:');
        this.log.verboseInfo(`  ${chalk.cyan('bash kubectl-apply.sh -k')}`);
        if (this.gatewayNb + this.monolithicNb >= 1) {
          const namespaceSuffix = this.kubernetesNamespace === 'default' ? '' : ` -n ${this.kubernetesNamespace}`;
          this.log.verboseInfo("\nUse these commands to find your application's IP addresses:");
          for (let i = 0; i < this.appsFolders.length; i++) {
            if (this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
              this.log.verboseInfo(`  ${chalk.cyan(`kubectl get svc ${this.appConfigs[i].baseName.toLowerCase()}${namespaceSuffix}`)}`);
            }
          }
          this.log.log();
        }
        // Make the apply script executable
        try {
          fs.chmodSync('kubectl-apply.sh', '755');
        } catch {
          this.log.warn("Failed to make 'kubectl-apply.sh' executable, you may need to run 'chmod +x kubectl-apply.sh'");
        }
      },
    };
  }

  get [BaseWorkspacesGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return getJdbcUrl(databaseType, options);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return getR2dbcUrl(databaseType, options);
  }
}
