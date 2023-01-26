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
import {
  applicationTypes,
  authenticationTypes,
  databaseTypes,
  kubernetesPlatformTypes,
  monitoringTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';

const { ELASTICSEARCH } = searchEngineTypes;
const { GATEWAY, MONOLITH } = applicationTypes;
const { JWT } = authenticationTypes;
const { PROMETHEUS } = monitoringTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { COUCHBASE } = databaseTypes;
const NO_DATABASE_TYPE = databaseTypes.NO;
const { GeneratorTypes } = kubernetesPlatformTypes;

const { K8S } = GeneratorTypes;

// eslint-disable-next-line import/prefer-default-export
export function writeFiles() {
  const suffix = 'knative';
  return {
    writeGeneratorFiles() {
      const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
      const helm = this.fetchFromInstalledJHipster('kubernetes-helm/templates');
      if (this.kubernetesNamespace !== 'default') {
        this.writeFile(`${k8s}/namespace.yml.ejs`, 'namespace.yml');
      }
      this.writeFile('README-KUBERNETES-KNATIVE.md.ejs', 'KNATIVE-README.md');
      if (this.generatorType === K8S) {
        for (let i = 0; i < this.appConfigs.length; i++) {
          this.app = this.appConfigs[i];
          const appName = this.app.baseName.toLowerCase();
          const appOut = appName.concat('-', suffix);

          this.writeFile('service.yml.ejs', `${appOut}/${appName}-service.yml`);
          // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
          if (this.app.prodDatabaseType !== NO_DATABASE_TYPE) {
            this.writeFile(`${k8s}/db/${this.app.prodDatabaseType}.yml.ejs`, `${appOut}/${appName}-${this.app.prodDatabaseType}.yml`);
          }
          if (this.app.searchEngine === ELASTICSEARCH) {
            this.writeFile(`${k8s}/db/elasticsearch.yml.ejs`, `${appOut}/${appName}-elasticsearch.yml`);
          }
          if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
            this.writeFile('istio/gateway.yml.ejs', `${appOut}/${appName}-gateway.yml`);
          }
          if (!this.app.serviceDiscoveryType && this.app.authenticationType === JWT) {
            this.writeFile(`${k8s}/secret/jwt-secret.yml.ejs`, `${appOut}/jwt-secret.yml`);
          }
          if (this.monitoring === PROMETHEUS) {
            this.writeFile(`${k8s}/monitoring/jhipster-prometheus-sm.yml.ejs`, `${appOut}/${appName}-prometheus-sm.yml`);
          }
          this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/${appName}-destination-rule.yml`);
          this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/${appName}-virtual-service.yml`);
        }

        if (this.useKafka) {
          this.writeFile(`${k8s}/messagebroker/kafka.yml.ejs`, `messagebroker-${suffix}/kafka.yml`);
        }

        if (this.monitoring === PROMETHEUS) {
          const monitOut = 'monitoring'.concat('-', suffix);
          this.writeFile(`${k8s}/monitoring/jhipster-prometheus-crd.yml.ejs`, `${monitOut}/jhipster-prometheus-crd.yml`);
          this.writeFile(`${k8s}/monitoring/jhipster-prometheus-cr.yml.ejs`, `${monitOut}/jhipster-prometheus-cr.yml`);
          this.writeFile(`${k8s}/monitoring/jhipster-grafana.yml.ejs`, `${monitOut}/jhipster-grafana.yml`);
          this.writeFile(`${k8s}/monitoring/jhipster-grafana-dashboard.yml.ejs`, `${monitOut}/jhipster-grafana-dashboard.yml`);
          this.writeFile(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${monitOut}/jhipster-grafana-gateway.yml`);
        }

        const registryOut = 'registry'.concat('-', suffix);
        if (this.serviceDiscoveryType === EUREKA) {
          this.writeFile(`${k8s}/registry/jhipster-registry.yml.ejs`, `${registryOut}/jhipster-registry.yml`);
          this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${registryOut}/application-configmap.yml`);
        } else if (this.serviceDiscoveryType === CONSUL) {
          this.writeFile(`${k8s}/registry/consul.yml.ejs`, `${registryOut}/consul.yml`);
          this.writeFile(`${k8s}/registry/consul-config-loader.yml.ejs`, `${registryOut}/consul-config-loader.yml`);
          this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${registryOut}/application-configmap.yml`);
        }

        const istioOut = 'istio'.concat('-', suffix);
        this.writeFile(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${istioOut}/grafana-gateway.yml`);
        this.writeFile(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${istioOut}/zipkin-gateway.yml`);
        this.writeFile(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${istioOut}/kiali-gateway.yml`);
        this.writeFile('kubectl-apply.sh.ejs', 'kubectl-knative-apply.sh');
      } else {
        for (let i = 0; i < this.appConfigs.length; i++) {
          this.app = this.appConfigs[i];
          const appName = this.app.baseName.toLowerCase();
          const appOut = appName.concat('-', suffix);

          this.writeFile('service.yml.ejs', `${appOut}/templates/${appName}-service.yml`);
          this.writeFile(`${helm}/app/values.yml.ejs`, `${appOut}/values.yml`);
          this.writeFile(`${helm}/app/Chart.yml.ejs`, `${appOut}/Chart.yaml`);
          this.writeFile(`${helm}/app/requirements.yml.ejs`, `${appOut}/requirements.yml`);
          this.writeFile(`${helm}/app/helpers.tpl.ejs`, `${appOut}/templates/_helpers.tpl`);

          if (this.app.prodDatabaseType === COUCHBASE) {
            this.writeFile(
              `${k8s}/db/${this.app.prodDatabaseType}.yml.ejs`,
              `${appOut}/templates/${appName}-${this.app.prodDatabaseType}.yml`
            );
          }

          if (this.app.searchEngine === ELASTICSEARCH) {
            this.writeFile(`${k8s}/db/elasticsearch.yml.ejs`, `${appOut}/templates/${appName}-elasticsearch.yml`);
          }
          if (this.app.applicationType === GATEWAY || this.app.applicationType === MONOLITH) {
            this.writeFile('istio/gateway.yml.ejs', `${appOut}/templates/${appName}-gateway.yml`);
          }
          if (!this.app.serviceDiscoveryType && this.app.authenticationType === JWT) {
            this.writeFile(`${k8s}/secret/jwt-secret.yml.ejs`, `${appOut}/templates/jwt-secret.yml`);
          }
          this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/templates/${appName}-destination-rule.yml`);
          this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/templates/${appName}-virtual-service.yml`);
        }

        const csOut = 'csvc'.concat('-', suffix);
        if (
          this.useKafka ||
          this.monitoring === PROMETHEUS ||
          this.serviceDiscoveryType === EUREKA ||
          this.serviceDiscoveryType === CONSUL
        ) {
          this.writeFile(`${helm}/csvc/values.yml.ejs`, `${csOut}/values.yml`);
          this.writeFile(`${helm}/csvc/Chart.yml.ejs`, `${csOut}/Chart.yaml`);
          this.writeFile(`${helm}/csvc/requirements.yml.ejs`, `${csOut}/requirements.yml`);
          this.writeFile(`${helm}/csvc/helpers.tpl.ejs`, `${csOut}/templates/_helpers.tpl`);
        }
        if (this.monitoring === PROMETHEUS) {
          this.writeFile(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${csOut}/templates/jhipster-grafana-gateway.yml`);
        }
        if (this.serviceDiscoveryType === EUREKA) {
          this.writeFile(`${k8s}/registry/jhipster-registry.yml.ejs`, `${csOut}/templates/jhipster-registry.yml`);
          this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
        }
        if (this.serviceDiscoveryType === CONSUL) {
          this.writeFile(`${k8s}/registry/consul.yml.ejs`, `${csOut}/templates/consul.yml`);
          this.writeFile(`${k8s}/registry/consul-config-loader.yml.ejs`, `${csOut}/templates/consul-config-loader.yml`);
          this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
        }
        this.writeFile(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${csOut}/templates/grafana-gateway.yml`);
        this.writeFile(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${csOut}/templates/zipkin-gateway.yml`);
        this.writeFile(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${csOut}/templates/kiali-gateway.yml`);
        this.writeFile('helm-apply.sh.ejs', 'helm-knative-apply.sh');
        this.writeFile('helm-upgrade.sh.ejs', 'helm-knative-upgrade.sh');
      }
    },
  };
}
