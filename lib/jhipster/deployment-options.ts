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
import type { ValueOf } from 'type-fest';

import kubernetesPlatformTypes from './kubernetes-platform-types.ts';
import monitoringTypes from './monitoring-types.ts';
import serviceDiscoveryTypes from './service-discovery-types.ts';

const { LOAD_BALANCER, NODE_PORT, INGRESS } = kubernetesPlatformTypes.ServiceTypes;
const { NGINX, GKE } = kubernetesPlatformTypes.IngressTypes;

const { EUREKA, CONSUL } = serviceDiscoveryTypes;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

const NO_MONITORING = monitoringTypes.NO;
const { PROMETHEUS } = monitoringTypes;

const DeploymentTypesOptions = {
  DOCKERCOMPOSE: 'docker-compose',
  KUBERNETES: 'kubernetes',
};

export const DeploymentTypes = {
  ...DeploymentTypesOptions,
  exists: (deploymentType?: string): boolean =>
    !!deploymentType && !!(DeploymentTypesOptions as Record<string, string>)[deploymentType.toUpperCase().replace('-', '')],
} as const;

const kubernetesServiceType = {
  loadBalancer: LOAD_BALANCER,
  nodePort: NODE_PORT,
  ingress: INGRESS,
} as const;

const kubernetesRelatedOptions = {
  kubernetesNamespace: 'default',
  kubernetesStorageClassName: '',
  kubernetesServiceType,
  kubernetesUseDynamicStorage: {
    false: false,
    true: true,
  },
  ingressDomain: '',
  ingressType: {
    nginx: NGINX,
    gke: GKE,
  },
  istio: {
    false: false,
    true: true,
  },
} as const;

const dockerComposeRelatedOptions = {
  gatewayType: {
    springCloudGateway: 'SpringCloudGateway',
  },
} as const;

const baseOptions = {
  appsFolders: [],
  clusteredDbApps: [],
  directoryPath: '../',
  monitoring: {
    no: NO_MONITORING,
    prometheus: PROMETHEUS,
  },
  serviceDiscoveryType: {
    eureka: EUREKA,
    consul: CONSUL,
    no: NO_SERVICE_DISCOVERY,
  },
} as const;

const deploymentType = {
  dockerCompose: DeploymentTypes.DOCKERCOMPOSE,
  kubernetes: DeploymentTypes.KUBERNETES,
} as const;

const Options = {
  ...baseOptions,
  dockerPushCommand: 'docker push',
  dockerRepositoryName: '',
  deploymentType,
  ...dockerComposeRelatedOptions,
  ...kubernetesRelatedOptions,

  defaults(deploymentType?: ValueOf<typeof DeploymentTypes>) {
    if (!deploymentType) {
      throw new Error('Deployment type is required');
    }
    if (deploymentType === this.deploymentType.kubernetes) {
      return {
        appsFolders: [] as string[],
        directoryPath: this.directoryPath,
        clusteredDbApps: [] as string[],
        serviceDiscoveryType: this.serviceDiscoveryType.consul,
        dockerRepositoryName: this.dockerRepositoryName,
        dockerPushCommand: this.dockerPushCommand,
        kubernetesNamespace: this.kubernetesNamespace,
        kubernetesServiceType: this.kubernetesServiceType.loadBalancer,
        kubernetesUseDynamicStorage: this.kubernetesUseDynamicStorage.false,
        kubernetesStorageClassName: this.kubernetesStorageClassName,
        ingressDomain: this.ingressDomain,
        monitoring: this.monitoring.no,
        istio: this.istio.false,
        ingressType: NGINX,
      };
    }

    if (deploymentType === this.deploymentType.dockerCompose) {
      return {
        appsFolders: [],
        directoryPath: this.directoryPath,
        gatewayType: this.gatewayType.springCloudGateway,
        clusteredDbApps: [],
        monitoring: this.monitoring.no,
        serviceDiscoveryType: this.serviceDiscoveryType.consul,
      };
    }

    return {
      appsFolders: [],
      directoryPath: './',
    };
  },
} as const;

export { Options };

export default {
  Options,
  DeploymentTypes,
};
