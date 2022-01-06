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

const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { GATEWAY, MONOLITH } = require('../../jdl/jhipster/application-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { PROMETHEUS } = require('../../jdl/jhipster/monitoring-types');
const { CONSUL, EUREKA } = require('../../jdl/jhipster/service-discovery-types');
const databaseTypes = require('../../jdl/jhipster/database-types');

const NO_DATABASE = databaseTypes.NO;

module.exports = {
  writeFiles,
};

function writeFiles() {
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
        if (!this.app.serviceDiscoveryType && this.app.authenticationType === JWT) {
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
