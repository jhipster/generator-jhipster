/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
  exists: deploymentType => !!deploymentType && !!DeploymentTypes[deploymentType.toUpperCase().replace('-', '')]
};

const Options = {
  deploymentType: {
    dockerCompose: DeploymentTypes.DOCKERCOMPOSE,
    rancherCompose: DeploymentTypes.RANCHERCOMPOSE,
    kubernetes: DeploymentTypes.KUBERNETES,
    openshift: DeploymentTypes.OPENSHIFT
  },
  gatewayType: {
    zuul: 'zuul',
    traefik: 'traefik'
  },
  monitoring: {
    no: 'no',
    elk: 'elk',
    prometheus: 'prometheus'
  },
  directoryPath: '../',
  appsFolders: [],
  clusteredDbApps: [],
  consoleOptions: {
    curator: 'curator',
    zipkin: 'zipkin'
  },
  // adminPassword: 'admin',
  serviceDiscoveryType: {
    eureka: 'eureka',
    consul: 'consul',
    no: 'no'
  },
  dockerRepositoryName: '',
  dockerPushCommand: 'docker push',
  // Kubernetes specific
  kubernetesNamespace: 'default',
  kubernetesServiceType: {
    loadBalancer: 'LoadBalancer',
    nodePort: 'NodePort',
    ingress: 'Ingress'
  },
  ingressDomain: '',
  istio: {
    false: false,
    true: true
  },
  // openshift specific
  openshiftNamespace: 'default',
  storageType: {
    ephemeral: 'ephemeral',
    persistent: 'persistent'
  }
};

Options.defaults = (deploymentType = Options.deploymentType.dockerCompose) =>
  _.omitBy(
    {
      deploymentType,
      gatewayType: Options.gatewayType.zuul,
      monitoring: Options.monitoring.no,
      directoryPath: Options.directoryPath,
      appsFolders: new Set(),
      clusteredDbApps: new Set(),
      consoleOptions: new Set(),
      adminPassword: Options.adminPassword,
      serviceDiscoveryType: Options.serviceDiscoveryType.eureka,
      dockerRepositoryName: Options.dockerRepositoryName,
      dockerPushCommand: Options.dockerPushCommand,
      kubernetesNamespace:
        deploymentType === Options.deploymentType.kubernetes ? Options.kubernetesNamespace : undefined,
      kubernetesServiceType:
        deploymentType === Options.deploymentType.kubernetes ? Options.kubernetesServiceType.loadBalancer : undefined,
      ingressDomain: deploymentType === Options.deploymentType.kubernetes ? Options.ingressDomain : undefined,
      istio: deploymentType === Options.deploymentType.kubernetes ? Options.istio.false : undefined,
      openshiftNamespace: deploymentType === Options.deploymentType.openshift ? Options.openshiftNamespace : undefined,
      storageType: deploymentType === Options.deploymentType.openshift ? Options.storageType.ephemeral : undefined
    },
    _.isUndefined
  );

module.exports = {
  Options,
  DeploymentTypes
};
