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
        this.writeFile('deployment.yml.ejs', `${appOut}/${appName}-deployment.yml`);
        this.writeFile('service.yml.ejs', `${appOut}/${appName}-service.yml`);
        // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
        if (this.app.prodDatabaseType !== NO_DATABASE) {
          this.writeFile(`db/${this.app.prodDatabaseType}.yml.ejs`, `${appOut}/${appName}-${this.app.prodDatabaseType}.yml`);
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
        if (this.app.prodDatabaseTypeCouchbase) {
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

    writeReadme() {
      this.writeFile('README-KUBERNETES.md.ejs', 'K8S-README.md');
    },

    writeNamespace() {
      if (this.kubernetesNamespace !== 'default') {
        this.writeFile('namespace.yml.ejs', 'namespace.yml');
      }
    },

    writeMessagingBroker() {
      if (!this.useKafka) return;
      this.writeFile('messagebroker/kafka.yml.ejs', `messagebroker-${suffix}/kafka.yml`);
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
