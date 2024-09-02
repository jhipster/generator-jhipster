/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import kubernetesPlatformTypes from './kubernetes-platform-types.js';
import monitoringTypes from './monitoring-types.js';
import serviceDiscoveryTypes from './service-discovery-types.js';

const { LOAD_BALANCER, NODE_PORT, INGRESS } = kubernetesPlatformTypes.ServiceTypes;
const { NGINX, GKE } = kubernetesPlatformTypes.IngressTypes;

const { EUREKA, CONSUL } = serviceDiscoveryTypes;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;

const NO_MONITORING = monitoringTypes.NO;
const { PROMETHEUS } = monitoringTypes;

export const DeploymentTypes = {
  DOCKERCOMPOSE: 'docker-compose',
  KUBERNETES: 'kubernetes',
  exists: (deploymentType?: any) => !!deploymentType && !!DeploymentTypes[deploymentType.toUpperCase().replace('-', '')],
};

export const DOCKERCOMPOSE = DeploymentTypes.DOCKERCOMPOSE;
export const KUBERNETES = DeploymentTypes.KUBERNETES;

const kubernetesRelatedOptions = {
  kubernetesNamespace: 'default',
  kubernetesServiceType: {
    loadBalancer: LOAD_BALANCER,
    nodePort: NODE_PORT,
    ingress: INGRESS,
  },
  kubernetesStorageClassName: '',
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
};

const dockerComposeRelatedOptions = {
  gatewayType: {
    springCloudGateway: 'SpringCloudGateway',
  },
};

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
};

const Options: any = {
  ...baseOptions,
  deploymentType: {
    dockerCompose: DeploymentTypes.DOCKERCOMPOSE,
    kubernetes: DeploymentTypes.KUBERNETES,
  },
  dockerPushCommand: 'docker push',
  dockerRepositoryName: '',
  ...dockerComposeRelatedOptions,
  ...kubernetesRelatedOptions,
};

Options.defaults = (deploymentType = Options.deploymentType.dockerCompose) => {
  if (deploymentType === Options.deploymentType.kubernetes) {
    return {
      appsFolders: [],
      directoryPath: Options.directoryPath,
      clusteredDbApps: [],
      serviceDiscoveryType: Options.serviceDiscoveryType.consul,
      dockerRepositoryName: Options.dockerRepositoryName,
      dockerPushCommand: Options.dockerPushCommand,
      kubernetesNamespace: Options.kubernetesNamespace,
      kubernetesServiceType: Options.kubernetesServiceType.loadBalancer,
      kubernetesUseDynamicStorage: Options.kubernetesUseDynamicStorage.false,
      kubernetesStorageClassName: Options.kubernetesStorageClassName,
      ingressDomain: Options.ingressDomain,
      monitoring: Options.monitoring.no,
      istio: Options.istio.false,
    };
  }

  if (deploymentType === Options.deploymentType.dockerCompose) {
    return {
      appsFolders: [],
      directoryPath: Options.directoryPath,
      gatewayType: Options.gatewayType.springCloudGateway,
      clusteredDbApps: [],
      monitoring: Options.monitoring.no,
      serviceDiscoveryType: Options.serviceDiscoveryType.consul,
    };
  }

  return {
    appsFolders: [],
    directoryPath: Options.directoryPath,
    clusteredDbApps: [],
    serviceDiscoveryType: Options.serviceDiscoveryType.consul,
    monitoring: Options.monitoring.no,
    dockerRepositoryName: Options.dockerRepositoryName,
    dockerPushCommand: Options.dockerPushCommand,
    storageType: Options.storageType.ephemeral,
    registryReplicas: Options.registryReplicas.two,
  };
};

export { Options };

export default {
  Options,
  DeploymentTypes,
};
