/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
  monitoringTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';

const { ELASTICSEARCH } = searchEngineTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT } = authenticationTypes;
const { PROMETHEUS } = monitoringTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;

const NO_DATABASE = databaseTypes.NO;

export default {
  writeFiles,
};

export function writeFiles() {
  const suffix = 'k8s';
  return {
    writeDeployments() {
      for (let i = 0; i < this.appConfigs.length; i++) {
        const appName = this.appConfigs[i].baseName.toLowerCase();
        const appOut = appName.concat('-', suffix);
        this.app = this.appConfigs[i];
        this.template('deployment.yml.ejs', `${appOut}/${appName}-deployment.yml`);
        this.template('service.yml.ejs', `${appOut}/${appName}-service.yml`);
        // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
        if (this.app.prodDatabaseType !== NO_DATABASE) {
          this.template(`db/${this.app.prodDatabaseType}.yml.ejs`, `${appOut}/${appName}-${this.app.prodDatabaseType}.yml`);
        }
        if (this.app.searchEngine === ELASTICSEARCH) {
          this.template('db/elasticsearch.yml.ejs', `${appOut}/${appName}-elasticsearch.yml`);
        }
        if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
          if (this.istio) {
            this.template('istio/gateway.yml.ejs', `${appOut}/${appName}-gateway.yml`);
          } else if (this.kubernetesServiceType === 'Ingress') {
            this.template('ingress.yml.ejs', `${appOut}/${appName}-ingress.yml`);
          }
        }
        if (!this.app.serviceDiscoveryAny && this.app.authenticationType === JWT) {
          this.template('secret/jwt-secret.yml.ejs', `${appOut}/jwt-secret.yml`);
        }
        if (this.app.prodDatabaseTypeCouchbase) {
          this.template('secret/couchbase-secret.yml.ejs', `${appOut}/templates/couchbase-secret.yml`);
        }
        if (this.monitoring === PROMETHEUS) {
          this.template('monitoring/jhipster-prometheus-sm.yml.ejs', `${appOut}/${appName}-prometheus-sm.yml`);
        }
        if (this.istio) {
          this.template('istio/destination-rule.yml.ejs', `${appOut}/${appName}-destination-rule.yml`);
          this.template('istio/virtual-service.yml.ejs', `${appOut}/${appName}-virtual-service.yml`);
        }
      }
    },

    writeReadme() {
      this.template('README-KUBERNETES.md.ejs', 'K8S-README.md');
    },

    writeNamespace() {
      if (this.kubernetesNamespace !== 'default') {
        this.template('namespace.yml.ejs', 'namespace.yml');
      }
    },

    writeMessagingBroker() {
      if (!this.useKafka) return;
      this.template('messagebroker/kafka.yml.ejs', `messagebroker-${suffix}/kafka.yml`);
    },

    writeKeycloak() {
      const keycloakOut = 'keycloak'.concat('-', suffix);
      this.entryPort ='8080';
      this.keycloakRedirectUris = '';
      this.appConfigs.forEach(appConfig => {
        // Add application configuration
        if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
          this.entryPort = appConfig.composePort;
          if (this.ingressDomain) {
            this.keycloakRedirectUris += 
            `"http://${appConfig.baseName.toLowerCase()}.${this.kubernetesNamespace}.${this.ingressDomain}/*", 
            "https://${appConfig.baseName.toLowerCase()}.${this.kubernetesNamespace}.${this.ingressDomain}/*", `;
          } else {
            this.keycloakRedirectUris += 
            `"http://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*", 
            "https://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*", `;
          }

          this.keycloakRedirectUris += 
            `"http://localhost:${appConfig.composePort}/*", 
            "https://localhost:${appConfig.composePort}/*", `;

          if (appConfig.devServerPort !== undefined) {
            this.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
          }

          this.debug(chalk.red.bold(`${appConfig.baseName} has redirect URIs ${this.keycloakRedirectUris}`));
          this.debug(chalk.red.bold(`AppConfig is ${JSON.stringify(appConfig)}`));
        }
      });
      this.template('keycloak/keycloak-configmap.yml.ejs', `${keycloakOut}/keycloak-configmap.yml`);
      this.template('keycloak/keycloak.yml.ejs', `${keycloakOut}/keycloak.yml`);

      if (this.kubernetesServiceType === 'Ingress') {
        this.template('keycloak/keycloak-ingress.yml.ejs', `${keycloakOut}/keycloak-ingress.yml`);
      }
      if (this.istio) {
        this.template('istio/gateway/keycloak-gateway.yml.ejs', `${keycloakOut}/keycloak-gateway.yml`);
      }

      this.template('cert-manager/cluster-issuer.yml.ejs', 'cert-manager/cluster-issuer.yml');
      this.template('cert-manager/ca-secret.yml.ejs', 'cert-manager/ca-secret.yml');
      this.template('keycloak/keycloak-cert.yml.ejs', `${keycloakOut}/keycloak-cert.yml`);
    },

    writePrometheusGrafanaFiles() {
      const monitOut = 'monitoring'.concat('-', suffix);
      if (this.monitoring === PROMETHEUS) {
        this.template('monitoring/jhipster-prometheus-crd.yml.ejs', `${monitOut}/jhipster-prometheus-crd.yml`);
        this.template('monitoring/jhipster-prometheus-cr.yml.ejs', `${monitOut}/jhipster-prometheus-cr.yml`);
        this.template('monitoring/jhipster-grafana.yml.ejs', `${monitOut}/jhipster-grafana.yml`);
        this.template('monitoring/jhipster-grafana-dashboard.yml.ejs', `${monitOut}/jhipster-grafana-dashboard.yml`);
        if (this.istio) {
          this.template('istio/gateway/jhipster-grafana-gateway.yml.ejs', `${monitOut}/jhipster-grafana-gateway.yml`);
        }
      }
    },

    writeRegistryFiles() {
      const registryOut = 'registry'.concat('-', suffix);
      if (this.serviceDiscoveryType === EUREKA) {
        this.template('registry/jhipster-registry.yml.ejs', `${registryOut}/jhipster-registry.yml`);
        this.template('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
      } else if (this.serviceDiscoveryType === CONSUL) {
        this.template('registry/consul.yml.ejs', `${registryOut}/consul.yml`);
        this.template('registry/consul-config-loader.yml.ejs', `${registryOut}/consul-config-loader.yml`);
        this.template('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
      }
    },

    writeConfigRunFile() {
      this.template('kubectl-apply.sh.ejs', 'kubectl-apply.sh');
    },

    writeObservabilityGatewayFiles() {
      if (!this.istio) return;
      const istioOut = 'istio'.concat('-', suffix);
      this.template('istio/gateway/grafana-gateway.yml.ejs', `${istioOut}/grafana-gateway.yml`);
      this.template('istio/gateway/zipkin-gateway.yml.ejs', `${istioOut}/zipkin-gateway.yml`);
      this.template('istio/gateway/kiali-gateway.yml.ejs', `${istioOut}/kiali-gateway.yml`);
    },

    writeKustomize() {
      const patchOut = 'patch'.concat('-', suffix);
      this.template('kustomize/kustomization.yml.ejs', 'kustomization.yml');
      if (this.istio) {
        this.template('kustomize/patch/istio-label.yml.ejs', `${patchOut}/istio-label.yml`);
        this.template('kustomize/patch/istio-namespace.yml.ejs', `${patchOut}/istio-namespace.yml`);
      }
    },

    writeSkaffold() {
      this.template('skaffold/skaffold.yml.ejs', 'skaffold.yml');
    },
  };
}
