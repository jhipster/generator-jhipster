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
import { applicationTypes, monitoringTypes, serviceDiscoveryTypes } from '../../../lib/jhipster/index.js';
import { convertSecretToBase64 } from '../../../lib/utils/index.js';
import type { WorkspacesApplication } from '../types.js';
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;
const { PROMETHEUS, ELK } = monitoringTypes;

const { GATEWAY, MONOLITH, MICROSERVICE } = applicationTypes;
export const loadDerivedServerAndPlatformProperties = ({ application }: { application: any }) => {
  if (!application.serviceDiscoveryType) {
    application.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
  }
  application.serviceDiscoveryAny = application.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
  application.serviceDiscoveryConsul = application.serviceDiscoveryType === CONSUL;
  application.serviceDiscoveryEureka = application.serviceDiscoveryType === EUREKA;
};

export const loadDerivedPlatformConfig = ({ application }: { application: WorkspacesApplication }) => {
  application.monitoringElk = application.monitoring === ELK;
  application.monitoringPrometheus = application.monitoring === PROMETHEUS;
  loadDerivedServerAndPlatformProperties({ application });
};

export function derivedPlatformProperties(this, { generator = this, deployment, applications }) {
  if (deployment.adminPassword) {
    deployment.adminPasswordBase64 = convertSecretToBase64(deployment.adminPassword);
  }
  deployment.useKafka = applications.some(appConfig => appConfig.messageBrokerKafka);
  deployment.usePulsar = applications.some(appConfig => appConfig.messageBrokerPulsar);
  deployment.useMemcached = applications.some(appConfig => appConfig.cacheProviderMemcached);
  deployment.useRedis = applications.some(appConfig => appConfig.cacheProviderRedis);
  deployment.entryPort = 8080;

  deployment.appConfigs = applications;
  deployment.applications = applications;

  deployment.includesApplicationTypeGateway = applications.some(appConfig => appConfig.applicationTypeGateway);
  deployment.deploymentApplicationTypeMicroservice = deployment.deploymentApplicationType === MICROSERVICE;
  deployment.monitoringPrometheus = deployment.monitoring === PROMETHEUS;
  deployment.serviceDiscoveryTypeEureka = deployment.serviceDiscoveryType === EUREKA;
  deployment.serviceDiscoveryTypeConsul = deployment.serviceDiscoveryType === CONSUL;
  deployment.usesOauth2 = applications.some(appConfig => appConfig.authenticationTypeOauth2);
  deployment.useKeycloak = deployment.usesOauth2 && deployment.usesIngress;
  applications.forEach(element => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    element.clusteredDb ? (element.dbPeerCount = 3) : (element.dbPeerCount = 1);
  });
  deployment.keycloakRedirectUris = deployment.keycloakRedirectUris ?? '';

  applications.forEach(appConfig => {
    // Add application configuration
    if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
      deployment.entryPort = appConfig.composePort;
      if (!deployment.ingressDomain) {
        deployment.keycloakRedirectUris += `"http://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*",
            "https://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*", `;
      }
      deployment.keycloakRedirectUris += `"http://localhost:${appConfig.composePort}/*",
            "https://localhost:${appConfig.composePort}/*",`;

      if (appConfig.devServerPort !== undefined) {
        deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
      }
      if (appConfig.devServerPortProxy !== undefined) {
        deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPortProxy}/*", `;
      }

      generator.debug(chalk.red.bold(`${appConfig.baseName} has redirect URIs ${deployment.keycloakRedirectUris}`));
      generator.debug(chalk.red.bold(`AppConfig is ${JSON.stringify(appConfig)}`));
    }
  });
}
