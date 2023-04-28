/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
  logManagementTypes,
  monitoringTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';

const { ELASTICSEARCH } = searchEngineTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT } = authenticationTypes;
const { PROMETHEUS } = monitoringTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { ECK } = logManagementTypes;

const NO_DATABASE = databaseTypes.NO;

export default {
  writeFiles,
};

export function writeFiles() {
  const suffix = 'k8s';
  var addFilebeat = false;
  return {
    writeDeployments() {
      for (let i = 0; i < this.appConfigs.length; i++) {
        const appName = this.appConfigs[i].baseName.toLowerCase();
        const appOut = appName.concat('-', suffix);
        this.app = this.appConfigs[i];
        this.logger.info("app.logManagementType: " + this.app.logManagementType);
        if (this.app.logManagementType === ECK) {
          addFilebeat = true;
        }
        this.writeFile('deployment.yml.ejs', `${appOut}/${appName}-deployment.yml`);
        this.writeFile('service.yml.ejs', `${appOut}/${appName}-service.yml`);
        // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
        if (this.app.databaseType !== NO_DATABASE) {
          const databaseType = this.app.prodDatabaseType ?? this.app.databaseType;
          this.writeFile(`db/${databaseType}.yml.ejs`, `${appOut}/${appName}-${databaseType}.yml`);
        }
        if (this.app.searchEngine === ELASTICSEARCH) {
          this.writeFile('db/elasticsearch.yml.ejs', `${appOut}/${appName}-elasticsearch.yml`);
        }
        if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
          if (this.istio) {
            this.writeFile('istio/gateway.yml.ejs', `${appOut}/${appName}-gateway.yml`);
          } else if (this.kubernetesServiceType === 'Ingress') {
            this.writeFile('ingress.yml.ejs', `${appOut}/${appName}-ingress.yml`);
          }
        }
        if (!this.app.serviceDiscoveryAny && this.app.authenticationType === JWT) {
          this.writeFile('secret/jwt-secret.yml.ejs', `${appOut}/jwt-secret.yml`);
        }
        if (this.app.databaseTypeCouchbase) {
          this.writeFile('secret/couchbase-secret.yml.ejs', `${appOut}/templates/couchbase-secret.yml`);
        }
        if (this.monitoring === PROMETHEUS) {
          this.writeFile('monitoring/jhipster-prometheus-sm.yml.ejs', `${appOut}/${appName}-prometheus-sm.yml`);
        }
        if (this.istio) {
          this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/${appName}-destination-rule.yml`);
          this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/${appName}-virtual-service.yml`);
        }
      }
    },

    writeFilebeat() {
      if (addFilebeat) {
        const filebeatOut = 'filebeat'.concat('-', suffix);
        this.writeFile('eck/filebeat.yml.ejs', `${filebeatOut}/filebeat.yml`);
      }
    },

    writeReadme() {
      this.writeFile('README-KUBERNETES.md.ejs', 'K8S-README.md');
    },

    writeNamespace() {
      if (this.kubernetesNamespace !== 'default') {
        this.writeFile('namespace.yml.ejs', 'namespace.yml');
      }
    },

    // write's storage class file  @cmi-tic-craxkumar
    writeStorageClass() {
      if (this.kubernetesStorageClassName !== '') {
        this.writeFile('storage-class.yml.ejs', 'storage-class.yml');
      }
    },

    writeMessagingBroker() {
      if (!this.useKafka) return;
      this.writeFile('messagebroker/kafka.yml.ejs', `messagebroker-${suffix}/kafka.yml`);
    },

    // write's keycloak files with istio if istio is true  @cmi-tic-craxkumar
    writeKeycloakWithIstio() {
      if (!this.istio) return;
      const keycloakOut = 'keycloak'.concat('-', suffix);
      this.writeFile('keycloak/keycloak-destination-rule.yml.ejs', `${keycloakOut}/keycloak-destination-rule.yml`);
      this.writeFile('keycloak/keycloak-virtual-service.yml.ejs' , `${keycloakOut}/keycloak-virtual-service.yml`);
      this.writeFile('keycloak/keycloak-gateway.yml.ejs', `${keycloakOut}/keycloak-gateway.yml`);
    },

    // write's keycloak files if useKeycloak is true @cmi-tic-craxkumar
    writeKeycloak() {
      if (!this.useKeycloak) return;
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
            "https://localhost:${appConfig.composePort}/*", `;

          if (appConfig.devServerPort !== undefined) {
            this.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
          }

          this.debug(chalk.red.bold(`${appConfig.baseName} has redirect URIs ${this.keycloakRedirectUris}`));
          this.debug(chalk.red.bold(`AppConfig is ${JSON.stringify(appConfig)}`));
        }
      });
      this.writeFile('keycloak/keycloak-configmap.yml.ejs', `${keycloakOut}/keycloak-configmap.yml`);
      this.writeFile('keycloak/keycloak-postgresql.yml.ejs', `${keycloakOut}/keycloak-postgresql.yml`);
      this.writeFile('keycloak/keycloak.yml.ejs', `${keycloakOut}/keycloak.yml`);
      // this.writeFile('cert-manager/letsencrypt-staging-ca-secret.yml.ejs', 'cert-manager/letsencrypt-staging-ca-secret.yml');
      // this.writeFile('cert-manager/letsencrypt-staging-issuer.yml.ejs', 'cert-manager/letsencrypt-staging-issuer.yml');
    },

    writePrometheusGrafanaFiles() {
      const monitOut = 'monitoring'.concat('-', suffix);
      if (this.monitoring === PROMETHEUS) {
        this.writeFile('monitoring/jhipster-prometheus-crd.yml.ejs', `${monitOut}/jhipster-prometheus-crd.yml`);
        this.writeFile('monitoring/jhipster-prometheus-cr.yml.ejs', `${monitOut}/jhipster-prometheus-cr.yml`);
        this.writeFile('monitoring/jhipster-grafana.yml.ejs', `${monitOut}/jhipster-grafana.yml`);
        this.writeFile('monitoring/jhipster-grafana-dashboard.yml.ejs', `${monitOut}/jhipster-grafana-dashboard.yml`);
        if (this.istio) {
          this.writeFile('istio/gateway/jhipster-grafana-gateway.yml.ejs', `${monitOut}/jhipster-grafana-gateway.yml`);
        }
      }
    },

    writeRegistryFiles() {
      const registryOut = 'registry'.concat('-', suffix);
      if (this.serviceDiscoveryType === EUREKA) {
        this.writeFile('registry/jhipster-registry.yml.ejs', `${registryOut}/jhipster-registry.yml`);
        this.writeFile('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
      } else if (this.serviceDiscoveryType === CONSUL) {
        this.writeFile('registry/consul.yml.ejs', `${registryOut}/consul.yml`);
        this.writeFile('registry/consul-config-loader.yml.ejs', `${registryOut}/consul-config-loader.yml`);
        this.writeFile('registry/application-configmap.yml.ejs', `${registryOut}/application-configmap.yml`);
      }
    },

    writeConfigRunFile() {
      this.writeFile('kubectl-apply.sh.ejs', 'kubectl-apply.sh');
    },

    // generating kubectl-delete.sh to delete the created resources @cmi-tic-craxkumar
    writeConfigDestroyFile() {
      this.writeFile('kubectl-delete.sh.ejs', 'kubectl-delete.sh');
    },

    writeObservabilityGatewayFiles() {
      if (!this.istio) return;
      const istioOut = 'istio'.concat('-', suffix);
      this.writeFile('istio/gateway/grafana-gateway.yml.ejs', `${istioOut}/grafana-gateway.yml`);
      this.writeFile('istio/gateway/zipkin-gateway.yml.ejs', `${istioOut}/zipkin-gateway.yml`);
      this.writeFile('istio/gateway/kiali-gateway.yml.ejs', `${istioOut}/kiali-gateway.yml`);
    },

    writeKustomize() {
      const patchOut = 'patch'.concat('-', suffix);
      this.writeFile('kustomize/kustomization.yml.ejs', 'kustomization.yml');
      if (this.istio) {
        this.writeFile('kustomize/patch/istio-label.yml.ejs', `${patchOut}/istio-label.yml`);
        this.writeFile('kustomize/patch/istio-namespace.yml.ejs', `${patchOut}/istio-namespace.yml`);
      }
    },

    writeSkaffold() {
      this.writeFile('skaffold/skaffold.yml.ejs', 'skaffold.yml');
    },
  };
  
}