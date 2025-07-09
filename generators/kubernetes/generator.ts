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
import type { Deployment } from '../base-workspaces/types.d.ts';

import { buildToolTypes } from '../../lib/jhipster/index.js';

import { checkImages, configureImageNames } from '../base-workspaces/internal/docker-base.js';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.js';
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
  askForPersistentStorage,
  askForStorageClassName,
} from './prompts.js';
import { applicationFiles, writeDeploymentFiles } from './files.ts';

const { MAVEN } = buildToolTypes;

/**
 * Temporary base class for Kubernetes generators.
 */
export class BaseKubernetesGenerator extends BaseWorkspacesGenerator<Deployment> {}

export default class KubernetesGenerator extends BaseKubernetesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster('jhipster:kubernetes:bootstrap');
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Generator ${chalk.bold('⎈')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
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
    return this.asPromptingWorkspacesTaskGroup({
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

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asPreparingWorkspacesTaskGroup({
      configureImageNames,
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ deployment, applications }) {
        for (const app of applications) {
          await this.writeFiles({
            sections: applicationFiles('k8s'),
            context: { ...deployment, app },
          });
        }
        await this.writeFiles({
          sections: writeDeploymentFiles('k8s'),
          context: deployment,
        });
      },
    });
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return this.asEndTaskGroup({
      deploy({ applications, deployment }) {
        const check = checkImages.call(this, { applications });
        if (check.hasWarning) {
          this.log.warn(`${chalk.yellow.bold('WARNING!')} Kubernetes configuration generated, but no Jib cache found`);
          this.log.warn('If you forgot to generate the Docker image for this application, please run:');
          this.log.warn(check.warningMessage);
        } else {
          this.log.verboseInfo(`\n${chalk.bold.green('Kubernetes configuration successfully generated!')}`);
        }

        this.log.warn(
          '\nYou will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:',
        );
        for (const app of applications) {
          const originalImageName = app.baseName.toLowerCase();
          const targetImageName = app.targetImageName;
          if (originalImageName !== targetImageName) {
            this.log.verboseInfo(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
          }
          this.log.verboseInfo(`  ${chalk.cyan(`${deployment.dockerPushCommand} ${targetImageName}`)}`);
        }

        if (deployment.dockerRepositoryName) {
          this.log.log('\nAlternatively, you can use Jib to build and push image directly to a remote registry:');
          for (const app of applications) {
            let runCommand = '';
            if (app.buildTool === MAVEN) {
              runCommand = `./mvnw -ntp -Pprod verify jib:build${
                process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''
              } -Djib.to.image=${app.targetImageName}`;
            } else {
              runCommand = `./gradlew bootJar -Pprod jib${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''} -Djib.to.image=${
                app.targetImageName
              }`;
            }
            this.log.verboseInfo(`  ${chalk.cyan(`${runCommand}`)} in ${this.workspacePath(app.appFolder!)}`);
          }
        }
        this.log.log('\nYou can deploy all your apps by running the following kubectl command:');
        this.log.verboseInfo(`  ${chalk.cyan('bash kubectl-apply.sh -f')}`);
        this.log.log('\n[OR]');
        this.log.log('\nIf you want to use kustomize configuration, then run the following command:');
        this.log.verboseInfo(`  ${chalk.cyan('bash kubectl-apply.sh -k')}`);
        if (deployment.gatewayNb! + deployment.monolithicNb! >= 1) {
          const namespaceSuffix = deployment.kubernetesNamespace === 'default' ? '' : ` -n ${deployment.kubernetesNamespace}`;
          this.log.verboseInfo("\nUse these commands to find your application's IP addresses:");
          for (const app of applications) {
            if (app.applicationType === 'gateway' || app.applicationType === 'monolith') {
              this.log.verboseInfo(`  ${chalk.cyan(`kubectl get svc ${app.baseName.toLowerCase()}${namespaceSuffix}`)}`);
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
