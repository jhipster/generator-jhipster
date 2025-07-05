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
import { BaseKubernetesGenerator } from '../kubernetes/generator.ts';

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

import { checkImages, configureImageNames, loadFromYoRc } from '../base-workspaces/internal/docker-base.js';
import { checkHelm, derivedKubernetesPlatformProperties, loadConfig } from '../kubernetes/kubernetes-base.js';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.js';
import { loadDeploymentConfig } from '../base-workspaces/internal/index.js';
import { applicationHelmFiles, applicationKubernetesFiles, deploymentHelmFiles, deploymentKubernetesFiles } from './files.ts';

export default class KubernetesHelmGenerator extends BaseKubernetesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster('jhipster:kubernetes:bootstrap');
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Helm Generator ${chalk.bold('⎈')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      checkHelm,
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
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get promptingWorkspaces() {
    return this.asPromptingTaskGroup({
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

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }

  get loadingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      loadConfig,
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
      derivedKubernetesPlatformProperties,
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ deployment, applications }) {
        const suffix = 'helm';

        await this.writeFiles({
          sections: deploymentKubernetesFiles(suffix),
          context: { ...this, ...deployment },
          rootTemplatesPath: this.fetchFromInstalledJHipster('kubernetes/templates'),
        });
        for (const app of applications) {
          await this.writeFiles({
            sections: applicationKubernetesFiles(suffix),
            context: { ...this, ...deployment, app },
            rootTemplatesPath: this.fetchFromInstalledJHipster('kubernetes/templates'),
          });
          await this.writeFiles({
            sections: applicationHelmFiles(suffix),
            context: { ...this, ...deployment, app },
          });
        }
        await this.writeFiles({
          sections: deploymentHelmFiles(suffix),
          context: { ...this, ...deployment },
        });
      },
    });
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return this.asEndTaskGroup({
      checkImages,
      deploy({ applications }) {
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
        for (const app of applications) {
          const originalImageName = app.baseName.toLowerCase();
          const targetImageName = app.targetImageName;
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
    });
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
