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
const { ServiceTypes } = require('../../jdl/jhipster/kubernetes-platform-types');

const { INGRESS } = ServiceTypes;

module.exports = {
  writeFiles,
};

function writeFiles() {
  const suffix = 'helm';
  return {
    writeAppChart() {
      const kubernetesSubgenPath = this.fetchFromInstalledJHipster('kubernetes/templates');
      if (this.kubernetesNamespace !== 'default') {
        this.template(`${kubernetesSubgenPath}/namespace.yml.ejs`, 'namespace.yml');
      }
      for (let i = 0; i < this.appConfigs.length; i++) {
        const appName = this.appConfigs[i].baseName.toLowerCase();
        const appOut = appName.concat('-', suffix);
        this.app = this.appConfigs[i];

        this.template(`${kubernetesSubgenPath}/deployment.yml.ejs`, `${appOut}/templates/${appName}-deployment.yml`);
        this.template(`${kubernetesSubgenPath}/service.yml.ejs`, `${appOut}/templates/${appName}-service.yml`);
        this.template('app/values.yml.ejs', `${appOut}/values.yaml`);
        this.template('app/Chart.yml.ejs', `${appOut}/Chart.yaml`);
        this.template('app/requirements.yml.ejs', `${appOut}/requirements.yaml`);
        this.template('app/helpers.tpl.ejs', `${appOut}/templates/_helpers.tpl`);

        if (this.app.searchEngine === ELASTICSEARCH) {
          this.template(`${kubernetesSubgenPath}/db/elasticsearch.yml.ejs`, `${appOut}/templates/${appName}-elasticsearch.yml`);
        }
        if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
          if (this.istio) {
            this.template(`${kubernetesSubgenPath}/istio/gateway.yml.ejs`, `${appOut}/templates/${appName}-gateway.yml`);
          } else if (this.kubernetesServiceType === INGRESS) {
            this.template(`${kubernetesSubgenPath}/ingress.yml.ejs`, `${appOut}/templates/${appName}-ingress.yml`);
          }
        }
        if (!this.app.serviceDiscoveryType && this.app.authenticationType === JWT) {
          this.template(`${kubernetesSubgenPath}/secret/jwt-secret.yml.ejs`, `${appOut}/templates/jwt-secret.yml`);
        }
        if (this.app.prodDatabaseTypeCouchbase) {
          this.template(`${kubernetesSubgenPath}/secret/couchbase-secret.yml.ejs`, `${appOut}/templates/couchbase-secret.yml`);
        }
        if (this.istio) {
          this.template(`${kubernetesSubgenPath}/istio/destination-rule.yml.ejs`, `${appOut}/templates/${appName}-destination-rule.yml`);
          this.template(`${kubernetesSubgenPath}/istio/virtual-service.yml.ejs`, `${appOut}/templates/${appName}-virtual-service.yml`);
        }
      }
    },

    writeCommonServiceChart() {
      const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
      const csOut = 'csvc'.concat('-', suffix);
      if (this.useKafka || this.monitoring === PROMETHEUS || this.serviceDiscoveryType === EUREKA || this.serviceDiscoveryType === CONSUL) {
        this.template('csvc/values.yml.ejs', `${csOut}/values.yaml`);
        this.template('csvc/Chart.yml.ejs', `${csOut}/Chart.yaml`);
        this.template('csvc/requirements.yml.ejs', `${csOut}/requirements.yaml`);
        this.template('csvc/helpers.tpl.ejs', `${csOut}/templates/_helpers.tpl`);
      }
      if (this.monitoring === PROMETHEUS) {
        if (this.istio && this.kubernetesServiceType === INGRESS) {
          this.template(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${csOut}/templates/jhipster-grafana-gateway.yml`);
        }
      }
      if (this.serviceDiscoveryType === EUREKA) {
        this.template(`${k8s}/registry/jhipster-registry.yml.ejs`, `${csOut}/templates/jhipster-registry.yml`);
        this.template(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
      }
      if (this.serviceDiscoveryType === CONSUL) {
        this.template(`${k8s}/registry/consul.yml.ejs`, `${csOut}/templates/consul.yml`);
        this.template(`${k8s}/registry/consul-config-loader.yml.ejs`, `${csOut}/templates/consul-config-loader.yml`);
        this.template(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
      }
      if (this.istio) {
        this.template(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${csOut}/templates/grafana-gateway.yml`);
        this.template(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${csOut}/templates/zipkin-gateway.yml`);
        this.template(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${csOut}/templates/kiali-gateway.yml`);
      }
    },

    writeReadme() {
      this.template('README-KUBERNETES-HELM.md.ejs', 'HELM-README.md');
    },

    writeConfigRunFile() {
      this.template('helm-apply.sh.ejs', 'helm-apply.sh');
      this.template('helm-upgrade.sh.ejs', 'helm-upgrade.sh');
    },
  };
}
