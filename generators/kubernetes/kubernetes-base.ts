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
import crypto from 'crypto';
import { defaults } from 'lodash-es';

import {
  HELM_COUCHBASE_OPERATOR,
  HELM_ELASTICSEARCH,
  HELM_GRAFANA,
  HELM_KAFKA,
  HELM_MARIADB,
  HELM_MONGODB_REPLICASET,
  HELM_MYSQL,
  HELM_POSTGRESQL,
  HELM_PROMETHEUS,
  KUBERNETES_BATCH_API_VERSION,
  KUBERNETES_CORE_API_VERSION,
  KUBERNETES_DEPLOYMENT_API_VERSION,
  KUBERNETES_INGRESS_API_VERSION,
  KUBERNETES_ISTIO_NETWORKING_API_VERSION,
  KUBERNETES_RBAC_API_VERSION,
  KUBERNETES_STATEFULSET_API_VERSION,
} from '../generator-constants.js';
import { applicationTypes, kubernetesPlatformTypes } from '../../lib/jhipster/index.js';
import { defaultKubernetesConfig } from './kubernetes-constants.js';

const { MICROSERVICE } = applicationTypes;
const { GeneratorTypes, IngressTypes, ServiceTypes } = kubernetesPlatformTypes;

const { INGRESS } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;
const { K8S, HELM } = GeneratorTypes;

export const checkKubernetes = async function () {
  if (this.skipChecks) return;

  try {
    await this.spawnCommand('kubectl version');
  } catch {
    this.log.warn(
      'kubectl 1.2 or later is not installed on your computer.\n' +
        'Make sure you have Kubernetes installed. Read https://kubernetes.io/docs/setup/\n',
    );
  }
};

export const checkHelm = async function () {
  if (this.skipChecks) return;

  try {
    await this.spawnCommand('helm version --client | grep -E "(v2\\.1[2-9]{1,2}\\.[0-9]{1,3})|(v3\\.[0-9]{1,2}\\.[0-9]{1,3})"');
  } catch {
    this.log.warn(
      'helm 2.12.x or later is not installed on your computer.\n' +
        'Make sure you have helm installed. Read https://github.com/helm/helm/\n',
    );
  }
};

export function loadConfig() {
  if (!this.jhipsterConfig.dbRandomPassword) {
    this.jhipsterConfig.dbRandomPassword = this.options.reproducibleTests ? 'SECRET-PASSWORD' : crypto.randomBytes(30).toString('hex');
  }

  const kubernetesWithDefaults = defaults({}, this.jhipsterConfig, defaultKubernetesConfig);
  this.kubernetesNamespace = kubernetesWithDefaults.kubernetesNamespace;
  this.kubernetesServiceType = kubernetesWithDefaults.kubernetesServiceType;
  this.ingressType = kubernetesWithDefaults.ingressType;
  this.ingressDomain = kubernetesWithDefaults.ingressDomain;
  this.istio = kubernetesWithDefaults.istio;
  this.dbRandomPassword = kubernetesWithDefaults.dbRandomPassword;
  this.kubernetesUseDynamicStorage = kubernetesWithDefaults.kubernetesUseDynamicStorage;
  this.kubernetesStorageClassName = kubernetesWithDefaults.kubernetesStorageClassName;
  this.generatorType = kubernetesWithDefaults.generatorType;
}

export function saveConfig() {
  this.config.set(
    defaults(
      {
        appsFolders: this.appsFolders,
        directoryPath: this.directoryPath,
        clusteredDbApps: this.clusteredDbApps,
        serviceDiscoveryType: this.serviceDiscoveryType,
        jwtSecretKey: this.jwtSecretKey,
        dockerRepositoryName: this.dockerRepositoryName,
        dockerPushCommand: this.dockerPushCommand,
        kubernetesNamespace: this.kubernetesNamespace,
        kubernetesServiceType: this.kubernetesServiceType,
        kubernetesUseDynamicStorage: this.kubernetesUseDynamicStorage,
        kubernetesStorageClassName: this.kubernetesStorageClassName,
        generatorType: this.generatorType,
        ingressType: this.ingressType,
        ingressDomain: this.ingressDomain,
        monitoring: this.monitoring,
        istio: this.istio,
      },
      defaultKubernetesConfig,
    ),
  );
}

export function setupKubernetesConstants() {
  // Make constants available in templates
  this.KUBERNETES_CORE_API_VERSION = KUBERNETES_CORE_API_VERSION;
  this.KUBERNETES_BATCH_API_VERSION = KUBERNETES_BATCH_API_VERSION;
  this.KUBERNETES_DEPLOYMENT_API_VERSION = KUBERNETES_DEPLOYMENT_API_VERSION;
  this.KUBERNETES_STATEFULSET_API_VERSION = KUBERNETES_STATEFULSET_API_VERSION;
  this.KUBERNETES_INGRESS_API_VERSION = KUBERNETES_INGRESS_API_VERSION;
  this.KUBERNETES_ISTIO_NETWORKING_API_VERSION = KUBERNETES_ISTIO_NETWORKING_API_VERSION;
  this.KUBERNETES_RBAC_API_VERSION = KUBERNETES_RBAC_API_VERSION;
}

export function derivedKubernetesPlatformProperties(dest = this) {
  dest.deploymentApplicationTypeMicroservice = dest.deploymentApplicationType === MICROSERVICE;
  dest.ingressTypeNginx = dest.ingressType === NGINX;
  dest.ingressTypeGke = dest.ingressType === GKE;
  dest.kubernetesServiceTypeIngress = dest.kubernetesServiceType === INGRESS;
  dest.kubernetesNamespaceDefault = dest.kubernetesNamespace === 'default';
  dest.generatorTypeK8s = dest.generatorType === K8S;
  dest.generatorTypeHelm = dest.generatorType === HELM;
}

export function setupHelmConstants() {
  this.HELM_KAFKA = HELM_KAFKA;
  this.HELM_ELASTICSEARCH = HELM_ELASTICSEARCH;
  this.HELM_PROMETHEUS = HELM_PROMETHEUS;
  this.HELM_GRAFANA = HELM_GRAFANA;
  this.HELM_MARIADB = HELM_MARIADB;
  this.HELM_MYSQL = HELM_MYSQL;
  this.HELM_POSTGRESQL = HELM_POSTGRESQL;
  this.HELM_MONGODB_REPLICASET = HELM_MONGODB_REPLICASET;
  this.HELM_COUCHBASE_OPERATOR = HELM_COUCHBASE_OPERATOR;
}

export default {
  checkKubernetes,
  checkHelm,
  loadConfig,
  saveConfig,
  setupKubernetesConstants,
  setupHelmConstants,
  derivedKubernetesPlatformProperties,
};
