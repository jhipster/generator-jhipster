/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const _ = require('lodash');

const DeploymentTypes = {
  DOCKERCOMPOSE: 'docker-compose',
  KUBERNETES: 'kubernetes',
  OPENSHIFT: 'openshift',
  exists: deploymentType => !!deploymentType && !!DeploymentTypes[deploymentType.toUpperCase().replace('-', '')],
};

const kubernetesRelatedOptions = {
  kubernetesNamespace: 'default',
  kubernetesServiceType: {
    loadBalancer: 'LoadBalancer',
    nodePort: 'NodePort',
    ingress: 'Ingress',
  },
  kubernetesStorageClassName: '',
  kubernetesUseDynamicStorage: {
    false: false,
    true: true,
  },
  ingressDomain: '',
  ingressType: {
    nginx: 'nginx',
    gke: 'gke',
  },
  istio: {
    false: false,
    true: true,
  },
};

const Options = {
  deploymentType: {
    dockerCompose: DeploymentTypes.DOCKERCOMPOSE,
    kubernetes: DeploymentTypes.KUBERNETES,
    openshift: DeploymentTypes.OPENSHIFT,
  },
  gatewayType: {
    springCloudGateway: 'SpringCloudGateway',
  },
  monitoring: {
    no: 'no',
    prometheus: 'prometheus',
  },
  directoryPath: '../',
  appsFolders: [],
  clusteredDbApps: [],
  // adminPassword: 'admin',
  serviceDiscoveryType: {
    eureka: 'eureka',
    consul: 'consul',
    no: 'no',
  },
  dockerRepositoryName: '',
  dockerPushCommand: 'docker push',
  // Kubernetes specific
  ...kubernetesRelatedOptions,
  // openshift specific
  openshiftNamespace: 'default',
  storageType: {
    ephemeral: 'ephemeral',
    persistent: 'persistent',
  },
};

Options.defaults = (deploymentType = Options.deploymentType.dockerCompose) =>
  _.omitBy(
    {
      deploymentType,
      gatewayType: Options.gatewayType.springCloudGateway,
      monitoring: Options.monitoring.no,
      directoryPath: Options.directoryPath,
      appsFolders: new Set(),
      clusteredDbApps: new Set(),
      adminPassword: Options.adminPassword,
      serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
      dockerRepositoryName: Options.dockerRepositoryName,
      dockerPushCommand: Options.dockerPushCommand,
      kubernetesNamespace: deploymentType === Options.deploymentType.kubernetes ? Options.kubernetesNamespace : undefined,
      kubernetesServiceType: deploymentType === Options.deploymentType.kubernetes ? Options.kubernetesServiceType.loadBalancer : undefined,
      kubernetesStorageClassName: deploymentType === Options.deploymentType.kubernetes ? Options.kubernetesStorageClassName : '',
      kubernetesUseDynamicStorage:
        deploymentType === Options.deploymentType.kubernetes ? deploymentType === Options.deploymentType.kubernetes : false,
      ingressDomain: deploymentType === Options.deploymentType.kubernetes ? Options.ingressDomain : undefined,
      ingressType: deploymentType === Options.deploymentType.kubernetes ? Options.ingressType.nginx : undefined,
      istio: deploymentType === Options.deploymentType.kubernetes ? Options.istio.false : undefined,
      openshiftNamespace: deploymentType === Options.deploymentType.openshift ? Options.openshiftNamespace : undefined,
      storageType: deploymentType === Options.deploymentType.openshift ? Options.storageType.ephemeral : undefined,
    },
    _.isUndefined
  );

module.exports = {
  Options,
  DeploymentTypes,
};
