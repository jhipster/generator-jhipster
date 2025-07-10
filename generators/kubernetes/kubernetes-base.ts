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
import {
  applicationTypes,
  kubernetesPlatformTypes,
  messageBrokerTypes,
  monitoringTypes,
  serviceDiscoveryTypes,
} from '../../lib/jhipster/index.js';
import type { WorkspacesApplication } from '../base-workspaces/types.js';
import type { BaseKubernetesGenerator } from './generator.ts';
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { PROMETHEUS } = monitoringTypes;
const { KAFKA } = messageBrokerTypes;

const { MICROSERVICE, GATEWAY, MONOLITH } = applicationTypes;
const { GeneratorTypes, IngressTypes, ServiceTypes } = kubernetesPlatformTypes;

const { INGRESS } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;
const { K8S, HELM } = GeneratorTypes;

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
  const kubernetesWithDefaults = this.jhipsterConfigWithDefaults;
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

export function derivedKubernetesPlatformProperties(
  this: BaseKubernetesGenerator,
  { applications }: { applications: WorkspacesApplication[] },
) {
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
  this.usesOauth2 = applications.some(appConfig => appConfig.authenticationTypeOauth2);
  this.useKafka = applications.some(appConfig => appConfig.messageBroker === KAFKA);
  this.usesIngress = this.kubernetesServiceType === 'Ingress';
  this.useKeycloak = this.usesOauth2 && this.usesIngress;
  this.keycloakRedirectUris = '';
  this.entryPort = 8080;

  applications.forEach(appConfig => {
    // Add application configuration
    if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
      this.entryPort = appConfig.composePort!;
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
    }
  });
}
