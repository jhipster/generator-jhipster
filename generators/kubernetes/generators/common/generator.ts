/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import {
  APPLICATION_TYPE_GATEWAY,
  APPLICATION_TYPE_MICROSERVICE,
  APPLICATION_TYPE_MONOLITH,
} from '../../../../lib/core/application-types.ts';
import { databaseTypes, kubernetesPlatformTypes, serviceDiscoveryTypes } from '../../../../lib/jhipster/index.ts';
import type CoreGenerator from '../../../base-core/generator.ts';
import BaseWorkspacesGenerator from '../../../base-workspaces/index.ts';
import { askForMonitoring } from '../../../base-workspaces/internal/docker-prompts.ts';
import { BaseKubernetesGenerator } from '../../generator.ts';

const { GeneratorTypes, IngressTypes, ServiceTypes } = kubernetesPlatformTypes;
const { HELM, K8S } = GeneratorTypes;
const { GKE, NGINX } = IngressTypes;
const { LOAD_BALANCER, INGRESS, NODE_PORT } = ServiceTypes;
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;
const NO_DATABASE = databaseTypes.NO;

export type KubernetesTarget = 'kubernetes' | 'helm' | 'knative';

export default class KubernetesCommonGenerator extends BaseKubernetesGenerator {
  /**
   * The generator the questions are asked for, set by the generator that composes this one.
   */
  target: KubernetesTarget = 'kubernetes';

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:kubernetes:bootstrap');
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForApplicationType({ control }) {
        // Knative only deploys microservices.
        if (this.target === 'knative') return;
        if (!this.shouldAskForPrompts({ control })) return;

        await this.prompt(
          [
            {
              type: 'select',
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
      },
      async askForPath({ control }) {
        if (!this.shouldAskForPrompts({ control })) return;

        const { deploymentApplicationType } = this.jhipsterConfigWithDefaults;
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
                      return deploymentApplicationType === APPLICATION_TYPE_MONOLITH ?
                          `No monolith found in ${path}`
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
      },
      async askForApps({ control }) {
        if (!this.shouldAskForPrompts({ control })) return;

        // The workspaces root holds this deployment folder, it is looked up outside of the destination root.
        const workspacesRoot = this.destinationPath(this.jhipsterConfig.directoryPath, { allowOutsideRoot: true });
        const appsFolders = getAppFolders
          .call(this, workspacesRoot, this.jhipsterConfigWithDefaults.deploymentApplicationType)
          .filter(appFolder => appFolder !== 'jhipster-registry' && appFolder !== 'registry');

        this.log.log(chalk.green(`${appsFolders.length} applications found at ${workspacesRoot}\n`));

        const answers = await this.prompt([
          {
            type: 'checkbox',
            name: 'chosenApps',
            message: 'Which applications do you want to include in your configuration?',
            choices: appsFolders ?? [],
            default: this.jhipsterConfig.appsFolders,
            validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
          },
        ]);
        this.jhipsterConfig.appsFolders = answers.chosenApps;
      },
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get promptingWorkspaces() {
    return this.asPromptingWorkspacesTaskGroup({
      async askForGeneratorType({ control }) {
        if (this.target !== 'knative') return;
        if (!this.options.askAnswered && control.existingProject) return;

        await this.prompt(
          [
            {
              type: 'select',
              name: 'generatorType',
              message: 'Which *type* of generator would you like to base this on?',
              choices: [
                {
                  value: K8S,
                  name: 'Kubernetes generator',
                },
                {
                  value: HELM,
                  name: 'Helm Kubernetes generator',
                },
              ],
              default: K8S,
            },
          ],
          this.config,
        );
      },
      askForMonitoring,
      async askForClustersMode({ control, applications }) {
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
      },
      async askForServiceDiscovery({ control, applications }) {
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
                type: 'select',
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
      },
      async askForAdminPassword({ control }) {
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
      },
      async askForKubernetesNamespace({ control }) {
        if (!this.shouldAskForPrompts({ control })) return;

        await this.prompt(
          [
            {
              type: 'input',
              name: 'kubernetesNamespace',
              message: 'What should we use for the Kubernetes namespace?',
              default: this.jhipsterConfigWithDefaults.kubernetesNamespace,
            },
          ],
          this.config,
        );
      },
      async askForDockerRepositoryName({ control }) {
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
      },
      async askForDockerPushCommand({ control }) {
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
      },
      async askForIstioSupport({ control }) {
        // Knative always runs on Istio and exposes its services through it.
        if (this.target === 'knative') return;
        if (!this.shouldAskForPrompts({ control })) return;
        if (this.jhipsterConfigWithDefaults.deploymentApplicationType === APPLICATION_TYPE_MONOLITH) {
          this.jhipsterConfigWithDefaults.istio = false;
          return;
        }

        await this.prompt(
          [
            {
              type: 'select',
              name: 'istio',
              message: 'Do you want to enable Istio?',
              choices: [
                {
                  value: false,
                  name: 'No',
                },
                {
                  value: true,
                  name: 'Yes',
                },
              ],
              default: this.jhipsterConfigWithDefaults.istio,
            },
          ],
          this.config,
        );
      },
      async askForKubernetesServiceType({ control }) {
        if (this.target === 'knative') return;
        if (!this.shouldAskForPrompts({ control })) return;

        await this.prompt(
          [
            {
              when: () => !this.jhipsterConfigWithDefaults.istio,
              type: 'select',
              name: 'kubernetesServiceType',
              message: 'Choose the Kubernetes service type for your edge services',
              choices: [
                {
                  value: LOAD_BALANCER,
                  name: 'LoadBalancer - Let a Kubernetes cloud provider automatically assign an IP',
                },
                {
                  value: NODE_PORT,
                  name: 'NodePort - expose the services to a random port (30000 - 32767) on all cluster nodes',
                },
                {
                  value: INGRESS,
                  name: 'Ingress - create ingresses for your services. Requires a running ingress controller',
                },
              ],
              default: this.jhipsterConfigWithDefaults.kubernetesServiceType,
            },
          ],
          this.config,
        );
      },
      async askForIngressType({ control }) {
        if (this.target === 'knative') return;
        if (!this.shouldAskForPrompts({ control })) return;

        await this.prompt(
          [
            {
              when: () => this.jhipsterConfigWithDefaults.kubernetesServiceType === INGRESS,
              type: 'select',
              name: 'ingressType',
              message: 'Choose the Kubernetes Ingress type',
              choices: [
                {
                  value: NGINX,
                  name: 'NGINX Ingress - choose this if you are running on Minikube',
                },
                {
                  value: GKE,
                  name: 'Google Kubernetes Engine Ingress - choose this if you are running on GKE',
                },
              ],
              default: this.jhipsterConfigWithDefaults.ingressType,
            },
          ],
          this.config,
        );
      },
      async askForIngressDomain({ control }) {
        if (!this.shouldAskForPrompts({ control })) return;

        const examples = ['example.com', '192.168.99.100.nip.io'];
        if (this.jhipsterConfigWithDefaults.ingressType !== NGINX && !this.jhipsterConfigWithDefaults.istio) {
          examples.push('none');
        }
        let defaultValue = '';
        let istioMessage = '';

        await this.prompt(
          [
            {
              when: () => {
                const when = this.jhipsterConfigWithDefaults.kubernetesServiceType === INGRESS || this.jhipsterConfigWithDefaults.istio;
                if (when) {
                  if (this.jhipsterConfigWithDefaults.istio) {
                    const istioIpCommand =
                      "kubectl -n istio-system get svc istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}'";
                    // If it's Istio, and no previous domain is configured, try to determine the default value
                    try {
                      const { stdout: istioIngressIp } = this.spawnCommandSync(istioIpCommand, { stdio: 'pipe' });
                      defaultValue = `${istioIngressIp}.nip.io`;
                    } catch {
                      istioMessage = `Unable to determine Istio Ingress IP address. You can find the Istio Ingress IP address by running the command line:\n    ${istioIpCommand}`;
                    }
                  } else if (this.jhipsterConfigWithDefaults.ingressType === NGINX) {
                    defaultValue = '192.168.99.100.nip.io';
                  } else {
                    defaultValue = this.jhipsterConfigWithDefaults.ingressDomain;
                  }
                }
                return when;
              },
              type: 'input',
              name: 'ingressDomain',
              message: `${istioMessage}${istioMessage ? '\n' : ''}What is the root FQDN for your ingress services (e.g. ${examples.join(', ')})?`,
              // if Ingress Type is nginx, then default to minikube ip
              // else, default to empty string, because it's mostly not needed.
              default: () => defaultValue,
              validate: input => {
                if (input.length === 0) {
                  if (this.jhipsterConfigWithDefaults.ingressType === NGINX || this.jhipsterConfigWithDefaults.istio) {
                    return 'domain name cannot be empty';
                  }
                  return true;
                }
                if (input.startsWith('.')) {
                  return 'domain name cannot start with a "."';
                }
                if (!input.match(/^\w+[\w.-]+\w+$/)) {
                  return 'domain not valid';
                }

                return true;
              },
            },
          ],
          this.config,
        );
      },
      async askForPersistentStorage({ control, applications }) {
        // Only the plain kubernetes generator offers dynamic storage provisioning.
        if (this.target !== 'kubernetes') return;
        if (!this.shouldAskForPrompts({ control })) return;

        const usingDataBase = applications.some(appConfig => appConfig.databaseType !== NO_DATABASE);
        await this.prompt(
          [
            {
              when: () => usingDataBase,
              type: 'select',
              name: 'kubernetesUseDynamicStorage',
              message: 'Do you want to use dynamic storage provisioning for your stateful services?',
              choices: [
                {
                  value: false,
                  name: 'No',
                },
                {
                  value: true,
                  name: 'Yes',
                },
              ],
              default: this.jhipsterConfigWithDefaults.kubernetesUseDynamicStorage,
            },
          ],
          this.config,
        );
      },
      async askForStorageClassName({ control }) {
        if (this.target !== 'kubernetes') return;
        if (!this.shouldAskForPrompts({ control })) return;

        await this.prompt(
          [
            {
              when: () => this.jhipsterConfigWithDefaults.kubernetesUseDynamicStorage,
              type: 'input',
              name: 'kubernetesStorageClassName',
              message: 'Do you want to use a specific storage class? (leave empty for using the clusters default storage class)',
              default: this.jhipsterConfigWithDefaults.kubernetesStorageClassName,
            },
          ],
          this.config,
        );
      },
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }
}

/**
 * Lists the folders of `directory` holding a JHipster application of the given type.
 * A microservice deployment also accepts gateways.
 */
function getAppFolders(this: CoreGenerator, directory: string, deploymentApplicationType?: string): string[] {
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
