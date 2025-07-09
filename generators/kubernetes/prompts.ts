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
import { applicationTypes, databaseTypes, kubernetesPlatformTypes } from '../../lib/jhipster/index.js';
import { asPromptingTask } from '../base-application/support/index.js';
import { asPromptingWorkspacesTask } from '../base-workspaces/support/task-type-inference.ts';
import type { BaseKubernetesGenerator } from './generator.ts';

const { MONOLITH } = applicationTypes;
const { IngressTypes, ServiceTypes } = kubernetesPlatformTypes;

const NO_DATABASE = databaseTypes.NO;
const { LOAD_BALANCER, INGRESS, NODE_PORT } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;

export const askForKubernetesNamespace = asPromptingTask(async function askForKubernetesNamespace(
  this: BaseKubernetesGenerator,
  { control },
) {
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
});

export const askForKubernetesServiceType = asPromptingTask(async function askForKubernetesServiceType(
  this: BaseKubernetesGenerator,
  { control },
) {
  if (!this.shouldAskForPrompts({ control })) return;

  await this.prompt(
    [
      {
        when: () => !this.jhipsterConfigWithDefaults.istio,
        type: 'list',
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
});

export const askForIngressType = asPromptingTask(async function askForIngressType(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;
  await this.prompt(
    [
      {
        when: () => this.jhipsterConfigWithDefaults.kubernetesServiceType === INGRESS,
        type: 'list',
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
});

export const askForIngressDomain = asPromptingTask(async function askForIngressDomain(this: BaseKubernetesGenerator, { control }) {
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
          if (input.charAt(0) === '.') {
            return 'domain name cannot start with a "."';
          }
          if (!input.match(/^[\w]+[\w.-]+[\w]{1,}$/)) {
            return 'domain not valid';
          }

          return true;
        },
      },
    ],
    this.config,
  );
});

export const askForIstioSupport = asPromptingTask(async function askForIstioSupport(this: BaseKubernetesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;
  if (this.jhipsterConfigWithDefaults.deploymentApplicationType === MONOLITH) {
    this.jhipsterConfigWithDefaults.istio = false;
    return;
  }

  await this.prompt(
    [
      {
        type: 'list',
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
});

export const askForPersistentStorage = asPromptingWorkspacesTask(async function askForPersistentStorage(
  this: BaseKubernetesGenerator,
  { control, applications },
) {
  if (!this.shouldAskForPrompts({ control })) return;
  const usingDataBase = applications.some(appConfig => appConfig.prodDatabaseType !== NO_DATABASE);
  await this.prompt(
    [
      {
        when: () => usingDataBase,
        type: 'list',
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
});

export const askForStorageClassName = asPromptingTask(async function askForStorageClassName(this: BaseKubernetesGenerator, { control }) {
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
});
