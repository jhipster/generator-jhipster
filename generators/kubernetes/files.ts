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
import chalk from 'chalk';

import {
  applicationTypes,
  authenticationTypes,
  databaseTypes,
  ingressTypes,
  monitoringTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../lib/jhipster/index.js';
import { asWritingTask } from '../base-application/support/index.js';

const { ELASTICSEARCH } = searchEngineTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT } = authenticationTypes;
const { PROMETHEUS } = monitoringTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { GKE } = ingressTypes;

const NO_DATABASE = databaseTypes.NO;

export const writeFiles = asWritingTask(async function writeFiles() {
  const suffix = 'k8s';
  // Deployments
  for (let i = 0; i < this.appConfigs.length; i++) {
    const appName = this.appConfigs[i].baseName.toLowerCase();
    const appOut = appName.concat('-', suffix);
    this.app = this.appConfigs[i];
    await this.writeFile('deployment.yml.ejs', `${appOut}/${appName}-deployment.yml`);
    await this.writeFile('service.yml.ejs', `${appOut}/${appName}-service.yml`);
    // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
    if (this.app.databaseType !== NO_DATABASE) {
      const databaseType = this.app.prodDatabaseType ?? this.app.databaseType;
      await this.writeFile(`db/${databaseType}.yml.ejs`, `${appOut}/${appName}-${databaseType}.yml`);
    }
    if (this.app.searchEngine === ELASTICSEARCH) {
      await this.writeFile('db/elasticsearch.yml.ejs', `${appOut}/${appName}-elasticsearch.yml`);
    }
    if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
      if (this.istio) {
        await this.writeFile('istio/gateway.yml.ejs', `${appOut}/${appName}-gateway.yml`);
      } else if (this.kubernetesServiceType === 'Ingress') {
        await this.writeFile('ingress.yml.ejs', `${appOut}/${appName}-ingress.yml`);
      }
    }
    if (!this.app.serviceDiscoveryAny && this.app.authenticationType === JWT) {
      await this.writeFile('secret/jwt-secret.yml.ejs', `${appOut}/jwt-secret.yml`);
    }
    if (this.app.databaseTypeCouchbase) {
      await this.writeFile('secret/couchbase-secret.yml.ejs', `${appOut}/templates/couchbase-secret.yml`);
    }
    if (this.monitoring === PROMETHEUS) {
      await this.writeFile('monitoring/jhipster-prometheus-sm.yml.ejs', `${appOut}/${appName}-prometheus-sm.yml`);
    }
    if (this.istio) {
      await this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/${appName}-destination-rule.yml`);
      await this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/${appName}-virtual-service.yml`);
    }
  }
  // Readme
  await this.writeFile('README-KUBERNETES.md.ejs', 'K8S-README.md');
  // Namespace
  if (this.kubernetesNamespace !== 'default') {
    await this.writeFile('namespace.yml.ejs', 'namespace.yml');
  }
  // message broker
  if (this.useKafka) {
    await this.writeFile('messagebroker/kafka.yml.ejs', `messagebroker-${suffix}/kafka.yml`);
  }
  // Keycloak
  if (this.useKeycloak) {
    const keycloakOut = 'keycloak'.concat('-', suffix);
    this.entryPort = '8080';
    this.keycloakRedirectUris = '';
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
    await this.writeFile('keycloak/keycloak-configmap.yml.ejs', `${keycloakOut}/keycloak-configmap.yml`);
    await this.writeFile('keycloak/keycloak-postgresql.yml.ejs', `${keycloakOut}/keycloak-postgresql.yml`);
    await this.writeFile('keycloak/keycloak.yml.ejs', `${keycloakOut}/keycloak.yml`);
    if (this.ingressType === GKE) {
      await this.writeFile('cert-manager/letsencrypt-staging-ca-secret.yml.ejs', 'cert-manager/letsencrypt-staging-ca-secret.yml');
      await this.writeFile('cert-manager/letsencrypt-staging-issuer.yml.ejs', 'cert-manager/letsencrypt-staging-issuer.yml');
    }
  }
  // Prometheus and Grafana
  const monitOut = 'monitoring'.concat('-', suffix);
  if (this.monitoring === PROMETHEUS) {
    await this.writeFile('monitoring/jhipster-prometheus-crd.yml.ejs', `${monitOut}/jhipster-prometheus-crd.yml`);
    await this.writeFile('monitoring/jhipster-prometheus-cr.yml.ejs', `${monitOut}/jhipster-prometheus-cr.yml`);
    await this.writeFile('monitoring/jhipster-grafana.yml.ejs', `${monitOut}/jhipster-grafana.yml`);
    await this.writeFile('monitoring/jhipster-grafana-dashboard.yml.ejs', `${monitOut}/jhipster-grafana-dashboard.yml`);
    if (this.istio) {
      await this.writeFile('istio/gateway/jhipster-grafana-gateway.yml.ejs', `${monitOut}/jhipster-grafana-gateway.yml`);
    }
  }
  // Registry
  const registryOut = 'registry'.concat('-', suffix);
  if (this.serviceDiscoveryType === EUREKA) {
    await this.writeFile('registry/jhipster-registry.yml.ejs', `${registryOut}/jhipster-registry.yml`);
    await this.writeFile('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
  } else if (this.serviceDiscoveryType === CONSUL) {
    await this.writeFile('registry/consul.yml.ejs', `${registryOut}/consul.yml`);
    await this.writeFile('registry/consul-config-loader.yml.ejs', `${registryOut}/consul-config-loader.yml`);
    await this.writeFile('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
  }
  // ConfigRun
  await this.writeFile('kubectl-apply.sh.ejs', 'kubectl-apply.sh');
  // Observability Gateway
  if (this.istio) {
    const istioOut = 'istio'.concat('-', suffix);
    await this.writeFile('istio/gateway/grafana-gateway.yml.ejs', `${istioOut}/grafana-gateway.yml`);
    await this.writeFile('istio/gateway/zipkin-gateway.yml.ejs', `${istioOut}/zipkin-gateway.yml`);
    await this.writeFile('istio/gateway/kiali-gateway.yml.ejs', `${istioOut}/kiali-gateway.yml`);
  }
  // Kustomize
  const patchOut = 'patch'.concat('-', suffix);
  await this.writeFile('kustomize/kustomization.yml.ejs', 'kustomization.yml');
  if (this.istio) {
    await this.writeFile('kustomize/patch/istio-label.yml.ejs', `${patchOut}/istio-label.yml`);
    await this.writeFile('kustomize/patch/istio-namespace.yml.ejs', `${patchOut}/istio-namespace.yml`);
  }
  // Skaffold
  await this.writeFile('skaffold/skaffold.yml.ejs', 'skaffold.yml');
});
