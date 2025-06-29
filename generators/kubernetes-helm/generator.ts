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
import {
  askForIngressDomain,
  askForIngressType,
  askForIstioSupport,
  askForKubernetesNamespace,
  askForKubernetesServiceType,
} from '../kubernetes/prompts.js';

import { checkImages, configureImageNames, generateJwtSecret, loadFromYoRc } from '../base-workspaces/internal/docker-base.js';
import {
  checkHelm,
  checkKubernetes,
  derivedKubernetesPlatformProperties,
  loadConfig,
  setupHelmConstants,
  setupKubernetesConstants,
} from '../kubernetes/kubernetes-base.js';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.js';
import { loadDeploymentConfig, loadDockerDependenciesTask } from '../base-workspaces/internal/index.js';
import { checkDocker } from '../docker/support/index.js';
import { loadDerivedServerAndPlatformProperties } from '../base-workspaces/support/index.js';
import { loadDerivedAppConfig } from '../app/support/index.js';
import { GENERATOR_BOOTSTRAP_WORKSPACES } from '../generator-list.js';
import { writeFiles } from './files.js';

/**
 * @class
 * @extends {BaseWorkspacesGenerator}
 */
export default class KubernetesHelmGenerator extends BaseWorkspacesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_WORKSPACES);
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Helm Generator ${chalk.bold('⎈')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      loadDockerDependenciesTask,
      checkDocker,
      checkKubernetes,
      checkHelm,
      loadConfig,
      setupKubernetesConstants,
      setupHelmConstants,
    });
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
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuringWorkspaces() {
    return this.asConfiguringWorkspacesTaskGroup({
      generateJwtSecret,
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.configuringWorkspaces);
  }

  get loadingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      loadFromYoRc,
      loadDeploymentConfig,
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asPreparingWorkspacesTaskGroup({
      configureImageNames,
      loadSharedConfig() {
        for (const app of this.appConfigs) {
          loadDerivedAppConfig({ application: app });
          loadDerivedServerAndPlatformProperties({ application: app });
        }
      },
      derivedKubernetesPlatformProperties,
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }

  get writing() {
    return this.asWritingTaskGroup({ writeFiles });
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      checkImages,
      deploy() {
        if (this.hasWarning) {
          this.log.warn('Helm configuration generated, but no Jib cache found');
          this.log.warn('If you forgot to generate the Docker image for this application, please run:');
          this.log.warn(this.warningMessage);
        } else {
          this.log.verboseInfo(`\n${chalk.bold.green('Helm configuration successfully generated!')}`);
        }
        this.log.warn(
          'You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:',
        );
        for (let i = 0; i < this.appsFolders.length; i++) {
          const originalImageName = this.appConfigs[i].baseName.toLowerCase();
          const targetImageName = this.appConfigs[i].targetImageName;
          if (originalImageName !== targetImageName) {
            this.log.verboseInfo(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
          }
          this.log.verboseInfo(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }
        this.log.log('\nYou can deploy all your apps by running the following script:');
        this.log.verboseInfo(`  ${chalk.cyan('bash helm-apply.sh')}`);
        this.log.log('\nYou can upgrade (after any changes) all your apps by running the following script:');
        this.log.verboseInfo(`  ${chalk.cyan('bash helm-upgrade.sh')}`);
        // Make the apply script executable
        try {
          fs.chmodSync('helm-apply.sh', '755');
          fs.chmodSync('helm-upgrade.sh', '755');
        } catch {
          this.log.warn(
            "Failed to make 'helm-apply.sh', 'helm-upgrade.sh' executable, you may need to run 'chmod +x helm-apply.sh helm-upgrade.sh",
          );
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
