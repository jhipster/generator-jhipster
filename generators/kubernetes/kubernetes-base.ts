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
import chalk from 'chalk';
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
import {
  applicationTypes,
  kubernetesPlatformTypes,
  messageBrokerTypes,
  monitoringTypes,
  serviceDiscoveryTypes,
} from '../../lib/jhipster/index.js';
import { defaultKubernetesConfig } from './kubernetes-constants.js';
import type { BaseKubernetesGenerator } from './generator.ts';
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { PROMETHEUS } = monitoringTypes;
const { KAFKA } = messageBrokerTypes;

const { MICROSERVICE, GATEWAY, MONOLITH } = applicationTypes;
const { GeneratorTypes, IngressTypes, ServiceTypes } = kubernetesPlatformTypes;

const { INGRESS } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;
const { K8S, HELM } = GeneratorTypes;

export const checkKubernetes = async function (this: BaseKubernetesGenerator) {
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

export const checkHelm = async function (this: BaseKubernetesGenerator) {
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

export function loadConfig(this: BaseKubernetesGenerator) {
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

export function setupKubernetesConstants(this: BaseKubernetesGenerator) {
  // Make constants available in templates
  this.KUBERNETES_CORE_API_VERSION = KUBERNETES_CORE_API_VERSION;
  this.KUBERNETES_BATCH_API_VERSION = KUBERNETES_BATCH_API_VERSION;
  this.KUBERNETES_DEPLOYMENT_API_VERSION = KUBERNETES_DEPLOYMENT_API_VERSION;
  this.KUBERNETES_STATEFULSET_API_VERSION = KUBERNETES_STATEFULSET_API_VERSION;
  this.KUBERNETES_INGRESS_API_VERSION = KUBERNETES_INGRESS_API_VERSION;
  this.KUBERNETES_ISTIO_NETWORKING_API_VERSION = KUBERNETES_ISTIO_NETWORKING_API_VERSION;
  this.KUBERNETES_RBAC_API_VERSION = KUBERNETES_RBAC_API_VERSION;
}

export function derivedKubernetesPlatformProperties(this: BaseKubernetesGenerator) {
  this.deploymentApplicationTypeMicroservice = this.deploymentApplicationType === MICROSERVICE;
  this.ingressTypeNginx = this.ingressType === NGINX;
  this.ingressTypeGke = this.ingressType === GKE;
  this.kubernetesServiceTypeIngress = this.kubernetesServiceType === INGRESS;
  this.kubernetesNamespaceDefault = this.kubernetesNamespace === 'default';
  this.generatorTypeK8s = this.generatorType === K8S;
  this.generatorTypeHelm = this.generatorType === HELM;
  this.monitoringPrometheus = this.monitoring === PROMETHEUS;
  this.serviceDiscoveryTypeEureka = this.serviceDiscoveryType === EUREKA;
  this.serviceDiscoveryTypeConsul = this.serviceDiscoveryType === CONSUL;
  this.usesOauth2 = this.appConfigs.some(appConfig => appConfig.authenticationTypeOauth2);
  this.usesIngress = this.kubernetesServiceType === 'Ingress';
  this.useKeycloak = this.usesOauth2 && this.usesIngress;
  this.appConfigs.forEach(element => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    element.clusteredDb ? (element.dbPeerCount = 3) : (element.dbPeerCount = 1);
    if (element.messageBroker === KAFKA) {
      this.useKafka = true;
    }
  });
  this.keycloakRedirectUris = '';
  this.entryPort = '8080';

  this.appConfigs.forEach(appConfig => {
    // Add application configuration
    if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
      this.entryPort = appConfig.composePort;
      if (this.ingressDomain) {
        this.keycloakRedirectUris += `"http://${appConfig.baseName.toLowerCase()}.${this.kubernetesNamespace}.${this.ingressDomain}/*",
            "https://${appConfig.baseName.toLowerCase()}.${this.kubernetesNamespace}.${this.ingressDomain}/*", `;
      } else {
        this.keycloakRedirectUris += `"http://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*",
            "https://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*", `;
      }

      this.keycloakRedirectUris += `"http://localhost:${appConfig.composePort}/*",
            "https://localhost:${appConfig.composePort}/*",`;

      if (appConfig.devServerPort !== undefined) {
        this.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
      }
      if (appConfig.devServerPortProxy !== undefined) {
        this.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPortProxy}/*", `;
      }

      this.debug(chalk.red.bold(`${appConfig.baseName} has redirect URIs ${this.keycloakRedirectUris}`));
      this.debug(chalk.red.bold(`AppConfig is ${JSON.stringify(appConfig)}`));
    }
  });
}

export function setupHelmConstants(this: BaseKubernetesGenerator) {
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
  setupKubernetesConstants,
  setupHelmConstants,
  derivedKubernetesPlatformProperties,
};
