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
import dockerPrompts from '../base-workspaces/internal/docker-prompts.js';
import { applicationTypes, databaseTypes, kubernetesPlatformTypes } from '../../lib/jhipster/index.js';
import { defaultKubernetesConfig, ingressDefaultConfig } from './kubernetes-constants.js';

const { MONOLITH } = applicationTypes;
const { IngressTypes, ServiceTypes } = kubernetesPlatformTypes;

const NO_DATABASE = databaseTypes.NO;
const { LOAD_BALANCER, INGRESS, NODE_PORT } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;

export default {
  askForKubernetesNamespace,
  askForKubernetesServiceType,
  askForIngressType,
  askForIngressDomain,
  askForIstioSupport,
  askForPersistentStorage,
  askForStorageClassName,
  ...dockerPrompts,
};

export async function askForKubernetesNamespace() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const prompts = [
    {
      type: 'input',
      name: 'kubernetesNamespace',
      message: 'What should we use for the Kubernetes namespace?',
      default: this.kubernetesNamespace ? this.kubernetesNamespace : defaultKubernetesConfig.kubernetesNamespace,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.kubernetesNamespace = props.kubernetesNamespace;
}

export async function askForKubernetesServiceType() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;

  const istio = this.istio;

  const prompts = [
    {
      when: () => !istio,
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
      default: this.kubernetesServiceType ? this.kubernetesServiceType : defaultKubernetesConfig.kubernetesServiceType,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.kubernetesServiceType = props.kubernetesServiceType;
}

export async function askForIngressType() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  const kubernetesServiceType = this.kubernetesServiceType;

  const prompts = [
    {
      when: () => kubernetesServiceType === INGRESS,
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
      default: this.ingressType ? this.ingressType : ingressDefaultConfig.ingressType,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.ingressType = props.ingressType;
}

export async function askForIngressDomain() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  const kubernetesServiceType = this.kubernetesServiceType;
  const istio = this.istio;
  this.ingressDomain = this.ingressDomain?.startsWith('.') ? this.ingressDomain.substring(1) : this.ingressDomain;

  const istioIpCommand = "kubectl -n istio-system get svc istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}'";
  let istioMessage = '';

  let defaultValue = '';
  if (this.ingressDomain) {
    defaultValue = this.ingressDomain;
  } else if (istio) {
    // If it's Istio, and no previous domain is configured, try to determine the default value
    try {
      const { stdout: istioIngressIp } = this.spawnCommandSync(istioIpCommand, { stdio: 'pipe' });
      defaultValue = `${istioIngressIp}.nip.io`;
    } catch {
      istioMessage = `Unable to determine Istio Ingress IP address. You can find the Istio Ingress IP address by running the command line:\n    ${istioIpCommand}`;
    }
  } else if (this.ingressType === NGINX) {
    defaultValue = '192.168.99.100.nip.io';
  } else {
    defaultValue = 'none';
  }

  const examples = ['example.com', '192.168.99.100.nip.io'];
  if (this.ingressType !== NGINX && !istio) {
    examples.push('none');
  }

  const prompts = [
    {
      when: () => kubernetesServiceType === INGRESS || istio === true,
      type: 'input',
      name: 'ingressDomain',
      message: `${istioMessage}${istioMessage ? '\n' : ''}What is the root FQDN for your ingress services (e.g. ${examples.join(', ')})?`,
      // if Ingress Type is nginx, then default to minikube ip
      // else, default to empty string, because it's mostly not needed.
      default: defaultValue,
      validate: input => {
        if (input.length === 0) {
          if (this.ingressType === NGINX || istio) {
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
  ];

  const props = await this.prompt(prompts, this.config);
  if (props.ingressDomain === 'none') {
    this.ingressDomain = '';
  } else {
    this.ingressDomain = props.ingressDomain ? props.ingressDomain : '';
  }
}

export async function askForIstioSupport() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  if (this.deploymentApplicationType === MONOLITH) {
    this.istio = false;
    return;
  }

  const prompts = [
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
      default: this.istio,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.istio = props.istio;
}

export async function askForPersistentStorage() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  let usingDataBase = false;
  this.appConfigs.forEach(appConfig => {
    if (appConfig.prodDatabaseType !== NO_DATABASE) {
      usingDataBase = true;
    }
  });

  const prompts = [
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
      default: this.kubernetesUseDynamicStorage,
    },
  ];

  const props = await this.prompt(prompts, this.config);
  this.kubernetesUseDynamicStorage = props.kubernetesUseDynamicStorage;
}

export async function askForStorageClassName() {
  if (!this.options.askAnswered && (this.regenerate || this.config.existed)) return;
  const kubernetesUseDynamicStorage = this.kubernetesUseDynamicStorage;

  const prompts = [
    {
      when: () => kubernetesUseDynamicStorage,
      type: 'input',
      name: 'kubernetesStorageClassName',
      message: 'Do you want to use a specific storage class? (leave empty for using the clusters default storage class)',
      default: this.kubernetesStorageClassName ? this.kubernetesStorageClassName : '',
    },
  ];

  const props = await this.prompt(prompts, this.config);
  // Add the StorageClass value only if dynamic storage is enabled
  if (kubernetesUseDynamicStorage) {
    this.kubernetesStorageClassName = props.kubernetesStorageClassName.trim();
  }
}
