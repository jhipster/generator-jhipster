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

import chalk from 'chalk';

import BaseWorkspacesGenerator from '../base-workspaces/index.ts';
import { BaseKubernetesGenerator } from '../kubernetes/generator.ts';

import { checkImages, configureImageNames } from '../base-workspaces/internal/docker-base.ts';
import { checkHelm } from '../kubernetes/kubernetes-base.ts';
import { buildToolTypes, kubernetesPlatformTypes } from '../../lib/jhipster/index.ts';
import { getJdbcUrl } from '../spring-data-relational/support/index.ts';
import {
  askForAdminPassword,
  askForApps,
  askForClustersMode,
  askForDockerPushCommand,
  askForDockerRepositoryName,
  askForMonitoring,
  askForPath,
  askForServiceDiscovery,
} from '../base-workspaces/internal/docker-prompts.ts';
import { askForIngressDomain, askForKubernetesNamespace } from '../kubernetes/prompts.ts';
import { askForGeneratorType } from './prompts.ts';

import {
  applicationHelmFiles,
  applicationKnativeFiles,
  applicationKubernetesFiles,
  deploymentHelmFiles,
  deploymentKnativeFiles,
  deploymentKubernetesFiles,
} from './files.ts';

const { GeneratorTypes } = kubernetesPlatformTypes;
const { MAVEN } = buildToolTypes;

const { K8S } = GeneratorTypes;

/**
 * @class
 * @extends {BaseWorkspacesGenerator}
 */
export default class KubernetesKnativeGenerator extends BaseKubernetesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster('jhipster:kubernetes:bootstrap');
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('☸')} Welcome to the JHipster Kubernetes Knative Generator ${chalk.bold('☸')}`));
        this.log.log(chalk.white(`Files will be generated in the folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      checkHelm,
      async checkKnative() {
        if (this.skipChecks) return;
        try {
          await this.spawnCommand(
            'kubectl get deploy -n knative-serving --label-columns=serving.knative.dev/release | grep -E "v0\\.[8-9]{1,3}\\.[0-9]*',
          );
        } catch {
          this.log.warn(
            'Knative 0.8.* or later is not installed on your computer.\n' +
              'Make sure you have Knative and Istio installed. Read https://knative.dev/docs/install/\n',
          );
        }
      },
      defaults() {
        this.jhipsterConfig.istio = true;
        this.jhipsterConfig.deploymentApplicationType = 'microservice';
      },
    });
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForPath,
      askForApps,
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get promptingWorkspaces() {
    return this.asPromptingTaskGroup({
      askForGeneratorType,
      askForMonitoring,
      askForClustersMode,
      askForServiceDiscovery,
      askForAdminPassword,
      askForKubernetesNamespace,
      askForDockerRepositoryName,
      askForDockerPushCommand,
      askForIngressDomain,
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
        const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
        const suffix = 'knative';
        await this.writeFiles({
          sections: deploymentKubernetesFiles(suffix),
          rootTemplatesPath: k8s,
          context: deployment,
        });
        await this.writeFiles({
          sections: deploymentKnativeFiles(),
          context: deployment,
        });
        for (const app of applications) {
          await this.writeFiles({
            sections: applicationKnativeFiles(suffix),
            context: { ...deployment, app },
          });
          await this.writeFiles({
            sections: applicationKubernetesFiles(suffix),
            rootTemplatesPath: k8s,
            context: { ...deployment, app },
          });
        }
        if (!deployment.generatorTypeK8s) {
          const helm = this.fetchFromInstalledJHipster('kubernetes-helm/templates');
          for (const app of applications) {
            await this.writeFiles({
              sections: applicationHelmFiles(suffix),
              rootTemplatesPath: helm,
              context: { ...deployment, app },
            });
          }
          await this.writeFiles({
            sections: deploymentHelmFiles(suffix),
            rootTemplatesPath: helm,
            context: deployment,
          });
        }
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
          this.log.warn('Kubernetes Knative configuration generated, but no Jib cache found');
          this.log.warn('If you forgot to generate the Docker image for this application, please run:');
          this.log.warn(check.warningMessage);
        } else {
          this.log.verboseInfo(`\n${chalk.bold.green('Kubernetes Knative configuration successfully generated!')}`);
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
              runCommand = `./gradlew bootJar -Pprod jibBuild${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''} -Djib.to.image=${
                app.targetImageName
              }`;
            }
            this.log.log(`${chalk.cyan(`${runCommand}`)} in ${this.workspacePath(app.appFolder!)}`);
          }
        }
        this.log.log('\nYou can deploy all your apps by running the following script:');
        if (deployment.generatorType === K8S) {
          this.log.verboseInfo(`  ${chalk.cyan('bash kubectl-knative-apply.sh')}`);
        } else {
          this.log.verboseInfo(`  ${chalk.cyan('bash helm-knative-apply.sh or ./helm-knative-apply.sh')}`);
          this.log.log('\nYou can upgrade (after any changes) all your apps by running the following script:');
          this.log.verboseInfo(`  ${chalk.cyan('bash helm-knative-upgrade.sh or ./helm-knative-upgrade.sh')}`);
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
  getJDBCUrl(...args: Parameters<typeof getJdbcUrl>) {
    return getJdbcUrl(...args);
  }
}
