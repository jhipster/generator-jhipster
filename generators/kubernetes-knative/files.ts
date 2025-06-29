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
import { asWritingTask } from '../base-application/support/index.js';

export const kubernetesFiles = {
  namespace: [
    {
      condition: generator => generator.kubernetesNamespace !== 'default',
      templates: [{ sourceFile: 'namespace.yml.ejs', destinationFile: 'namespace.yml' }],
    },
  ],
};
export const knativeFiles = {
  readme: [{ templates: [{ sourceFile: 'README-KUBERNETES-KNATIVE.md.ejs', destinationFile: 'KNATIVE-README.md' }] }],
};

export const writeFiles = asWritingTask(async function writeFiles() {
  const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
  await this.writeFiles({
    sections: kubernetesFiles,
    rootTemplatesPath: k8s,
    context: this,
  });
  await this.writeFiles({
    sections: knativeFiles,
    context: this,
  });
  const helm = this.fetchFromInstalledJHipster('kubernetes-helm/templates');

  const suffix = 'knative';
  if (this.generatorTypeK8s) {
    for (let i = 0; i < this.appConfigs.length; i++) {
      this.app = this.appConfigs[i];
      const appName = this.app.baseName.toLowerCase();
      const appOut = appName.concat('-', suffix);

      await this.writeFile('service.yml.ejs', `${appOut}/${appName}-service.yml`);
      // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
      if (!this.app.databaseTypeNo) {
        const databaseType = this.app.prodDatabaseType ?? this.app.databaseType;
        await this.writeFile(`${k8s}/db/${databaseType}.yml.ejs`, `${appOut}/${appName}-${databaseType}.yml`);
      }
      if (this.app.searchEngineElasticsearch) {
        await this.writeFile(`${k8s}/db/elasticsearch.yml.ejs`, `${appOut}/${appName}-elasticsearch.yml`);
      }
      if (this.app.applicationTypeGateway || this.app.applicationTypeMonolith) {
        await this.writeFile('istio/gateway.yml.ejs', `${appOut}/${appName}-gateway.yml`);
      }
      if (!this.app.serviceDiscoveryType && this.app.authenticationTypeJwt) {
        await this.writeFile(`${k8s}/secret/jwt-secret.yml.ejs`, `${appOut}/jwt-secret.yml`);
      }
      if (this.monitoringPrometheus) {
        await this.writeFile(`${k8s}/monitoring/jhipster-prometheus-sm.yml.ejs`, `${appOut}/${appName}-prometheus-sm.yml`);
      }
      await this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/${appName}-destination-rule.yml`);
      await this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/${appName}-virtual-service.yml`);
    }

    if (this.useKafka) {
      await this.writeFile(`${k8s}/messagebroker/kafka.yml.ejs`, `messagebroker-${suffix}/kafka.yml`);
    }

    if (this.monitoringPrometheus) {
      const monitOut = 'monitoring'.concat('-', suffix);
      await this.writeFile(`${k8s}/monitoring/jhipster-prometheus-crd.yml.ejs`, `${monitOut}/jhipster-prometheus-crd.yml`);
      await this.writeFile(`${k8s}/monitoring/jhipster-prometheus-cr.yml.ejs`, `${monitOut}/jhipster-prometheus-cr.yml`);
      await this.writeFile(`${k8s}/monitoring/jhipster-grafana.yml.ejs`, `${monitOut}/jhipster-grafana.yml`);
      await this.writeFile(`${k8s}/monitoring/jhipster-grafana-dashboard.yml.ejs`, `${monitOut}/jhipster-grafana-dashboard.yml`);
      await this.writeFile(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${monitOut}/jhipster-grafana-gateway.yml`);
    }

    const registryOut = 'registry'.concat('-', suffix);
    if (this.serviceDiscoveryTypeEureka) {
      await this.writeFile(`${k8s}/registry/jhipster-registry.yml.ejs`, `${registryOut}/jhipster-registry.yml`);
      await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${registryOut}/application-configmap.yml`);
    } else if (this.serviceDiscoveryTypeConsul) {
      await this.writeFile(`${k8s}/registry/consul.yml.ejs`, `${registryOut}/consul.yml`);
      await this.writeFile(`${k8s}/registry/consul-config-loader.yml.ejs`, `${registryOut}/consul-config-loader.yml`);
      await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${registryOut}/application-configmap.yml`);
    }

    const istioOut = 'istio'.concat('-', suffix);
    await this.writeFile(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${istioOut}/grafana-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${istioOut}/zipkin-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${istioOut}/kiali-gateway.yml`);
    await this.writeFile('kubectl-apply.sh.ejs', 'kubectl-knative-apply.sh');
  } else {
    for (let i = 0; i < this.appConfigs.length; i++) {
      this.app = this.appConfigs[i];
      const appName = this.app.baseName.toLowerCase();
      const appOut = appName.concat('-', suffix);

      await this.writeFile('service.yml.ejs', `${appOut}/templates/${appName}-service.yml`);
      await this.writeFile(`${helm}/app/values.yml.ejs`, `${appOut}/values.yml`);
      await this.writeFile(`${helm}/app/Chart.yml.ejs`, `${appOut}/Chart.yaml`);
      await this.writeFile(`${helm}/app/requirements.yml.ejs`, `${appOut}/requirements.yml`);
      await this.writeFile(`${helm}/app/helpers.tpl.ejs`, `${appOut}/templates/_helpers.tpl`);

      if (this.app.databaseTypeCouchbase) {
        await this.writeFile(`${k8s}/db/${this.app.databaseType}.yml.ejs`, `${appOut}/templates/${appName}-${this.app.databaseType}.yml`);
      }

      if (this.app.searchEngineElasticsearch) {
        await this.writeFile(`${k8s}/db/elasticsearch.yml.ejs`, `${appOut}/templates/${appName}-elasticsearch.yml`);
      }
      if (this.app.applicationTypeGateway || this.app.applicationTypeMonolith) {
        await this.writeFile('istio/gateway.yml.ejs', `${appOut}/templates/${appName}-gateway.yml`);
      }
      if (!this.app.serviceDiscoveryType && this.app.authenticationTypeJwt) {
        await this.writeFile(`${k8s}/secret/jwt-secret.yml.ejs`, `${appOut}/templates/jwt-secret.yml`);
      }
      await this.writeFile('istio/destination-rule.yml.ejs', `${appOut}/templates/${appName}-destination-rule.yml`);
      await this.writeFile('istio/virtual-service.yml.ejs', `${appOut}/templates/${appName}-virtual-service.yml`);
    }

    const csOut = 'csvc'.concat('-', suffix);
    if (this.useKafka || this.monitoringPrometheus || this.serviceDiscoveryTypeEureka || this.serviceDiscoveryTypeConsul) {
      await this.writeFile(`${helm}/csvc/values.yml.ejs`, `${csOut}/values.yml`);
      await this.writeFile(`${helm}/csvc/Chart.yml.ejs`, `${csOut}/Chart.yaml`);
      await this.writeFile(`${helm}/csvc/requirements.yml.ejs`, `${csOut}/requirements.yml`);
      await this.writeFile(`${helm}/csvc/helpers.tpl.ejs`, `${csOut}/templates/_helpers.tpl`);
    }
    if (this.monitoringPrometheus) {
      await this.writeFile(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${csOut}/templates/jhipster-grafana-gateway.yml`);
    }
    if (this.serviceDiscoveryTypeEureka) {
      await this.writeFile(`${k8s}/registry/jhipster-registry.yml.ejs`, `${csOut}/templates/jhipster-registry.yml`);
      await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
    }
    if (this.serviceDiscoveryTypeConsul) {
      await this.writeFile(`${k8s}/registry/consul.yml.ejs`, `${csOut}/templates/consul.yml`);
      await this.writeFile(`${k8s}/registry/consul-config-loader.yml.ejs`, `${csOut}/templates/consul-config-loader.yml`);
      await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
    }
    await this.writeFile(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${csOut}/templates/grafana-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${csOut}/templates/zipkin-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${csOut}/templates/kiali-gateway.yml`);
    await this.writeFile('helm-apply.sh.ejs', 'helm-knative-apply.sh');
    await this.writeFile('helm-upgrade.sh.ejs', 'helm-knative-upgrade.sh');
  }
});
