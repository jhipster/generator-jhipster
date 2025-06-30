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

const applicationKubernetesFiles = (suffix = '') => ({
  database: [
    {
      // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
      condition: data => !data.app.databaseTypeNo && data.generatorTypeK8s,
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-${data.app.prodDatabaseType ?? data.app.databaseType}.yml`,
      templates: [{ sourceFile: data => `db/${data.app.prodDatabaseType ?? data.app.databaseType}.yml` }],
    },
    {
      // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
      condition: data => data.app.databaseTypeCouchbase && !data.generatorTypeK8s,
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-${data.app.prodDatabaseType ?? data.app.databaseType}.yml`,
      templates: [{ sourceFile: data => `db/${data.app.prodDatabaseType ?? data.app.databaseType}.yml` }],
    },
  ],
  searchEngine: [
    {
      condition: data => data.app.searchEngineElasticsearch,
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}${data.app.baseName.toLowerCase()}-elasticsearch.yml`,
      templates: ['db/elasticsearch.yml'],
    },
  ],
  authentication: [
    {
      condition: data => !data.app.serviceDiscoveryType && data.app.authenticationTypeJwt,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}jwt-secret.yml`,
      templates: ['secret/jwt-secret.yml'],
    },
  ],
  monitoring: [
    {
      condition: data => data.monitoringPrometheus && data.generatorTypeK8s,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-prometheus-sm.yml`,
      templates: ['monitoring/jhipster-prometheus-sm.yml'],
    },
  ],
});
const applicationHelmFiles = (suffix = '') => ({
  chart: [
    {
      condition: data => !data.generatorTypeK8s,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/values.yml`,
      templates: ['app/values.yml'],
    },
    {
      condition: data => !data.generatorTypeK8s,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/Chart.yaml`,
      templates: ['app/Chart.yml'],
    },
    {
      condition: data => !data.generatorTypeK8s,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/requirements.yml`,
      templates: ['app/requirements.yml'],
    },
    {
      condition: data => !data.generatorTypeK8s,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/_helpers.tpl`,
      templates: ['app/helpers.tpl.ejs'],
    },
  ],
});
const applicationKnativeFiles = (suffix = '') => ({
  deployment: [
    {
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}${data.app.baseName.toLowerCase()}-service.yml`,
      templates: ['service.yml'],
    },
  ],
  gateway: [
    {
      condition: data => data.app.applicationTypeGateway || data.app.applicationTypeMonolith,
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}${data.app.baseName.toLowerCase()}-gateway.yml`,
      templates: ['istio/gateway.yml'],
    },
  ],
  istio: [
    {
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}${data.app.baseName.toLowerCase()}-virtual-service.yml`,
      templates: ['istio/virtual-service.yml'],
    },
    {
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}${data.app.baseName.toLowerCase()}-destination-rule.yml`,
      templates: ['istio/destination-rule.yml'],
    },
  ],
});

const deploymentKubernetesFiles = (suffix = '') => ({
  namespace: [
    {
      condition: generator => !generator.kubernetesNamespaceDefault,
      templates: [{ sourceFile: 'namespace.yml.ejs', destinationFile: 'namespace.yml' }],
    },
  ],
  messageBroker: [
    {
      condition: generator => generator.useKafka && generator.generatorTypeK8s,
      templates: [{ sourceFile: 'messagebroker/kafka.yml.ejs', destinationFile: `messagebroker-${suffix}/kafka.yml` }],
    },
  ],
  monitoring: [
    {
      condition: generator => generator.monitoringPrometheus && generator.generatorTypeK8s,
      templates: [
        { sourceFile: 'monitoring/jhipster-prometheus-crd.yml.ejs', destinationFile: `monitoring-${suffix}/jhipster-prometheus-crd.yml` },
        { sourceFile: 'monitoring/jhipster-prometheus-cr.yml.ejs', destinationFile: `monitoring-${suffix}/jhipster-prometheus-cr.yml` },
        { sourceFile: 'monitoring/jhipster-grafana.yml.ejs', destinationFile: `monitoring-${suffix}/jhipster-grafana.yml` },
        {
          sourceFile: 'monitoring/jhipster-grafana-dashboard.yml.ejs',
          destinationFile: `monitoring-${suffix}/jhipster-grafana-dashboard.yml`,
        },
        {
          sourceFile: 'istio/gateway/jhipster-grafana-gateway.yml.ejs',
          destinationFile: `monitoring-${suffix}/jhipster-grafana-gateway.yml`,
        },
      ],
    },
    {
      condition: generator => generator.monitoringPrometheus && !generator.generatorTypeK8s,
      templates: [
        {
          sourceFile: 'istio/gateway/jhipster-grafana-gateway.yml.ejs',
          destinationFile: `csvc-${suffix}/templates/jhipster-grafana-gateway.yml`,
        },
      ],
    },
  ],
  serviceDiscovery: [
    {
      condition: generator => generator.serviceDiscoveryTypeEureka,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'registry' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}jhipster-registry.yml`,
      templates: ['registry/jhipster-registry.yml'],
    },
    {
      condition: generator => generator.serviceDiscoveryTypeEureka,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'registry' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}application-configmap.yml`,
      templates: ['registry/application-configmap.yml'],
    },

    {
      condition: generator => generator.serviceDiscoveryTypeConsul,
      renameTo: data => `${data.generatorTypeK8s ? 'registry' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}consul.yml`,
      templates: ['registry/consul.yml'],
    },
    {
      condition: generator => generator.serviceDiscoveryTypeConsul,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'registry' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}consul-config-loader.yml`,
      templates: ['registry/consul-config-loader.yml'],
    },
    {
      condition: generator => generator.serviceDiscoveryTypeConsul,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'registry' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}application-configmap.yml`,
      templates: ['registry/application-configmap.yml'],
    },
  ],
  istio: [
    {
      condition: generator => generator.istio,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'istio' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}grafana-gateway.yml`,
      templates: ['istio/gateway/grafana-gateway.yml'],
    },
    {
      condition: generator => generator.istio,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'istio' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}zipkin-gateway.yml`,
      templates: ['istio/gateway/zipkin-gateway.yml'],
    },
    {
      condition: generator => generator.istio,
      renameTo: data =>
        `${data.generatorTypeK8s ? 'istio' : 'csvc'}-${suffix}/${data.generatorTypeK8s ? '' : 'templates/'}kiali-gateway.yml`,
      templates: ['istio/gateway/kiali-gateway.yml'],
    },
  ],
});
const deploymentHelmFiles = (suffix = '') => ({
  chart: [
    {
      condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
      templates: [{ sourceFile: 'csvc/values.yml', destinationFile: `csvc-${suffix}/values.yml` }],
    },
    {
      condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
      templates: [{ sourceFile: 'csvc/Chart.yml', destinationFile: `csvc-${suffix}/Chart.yaml` }],
    },
    {
      condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
      templates: [{ sourceFile: 'csvc/requirements.yml', destinationFile: `csvc-${suffix}/requirements.yml` }],
    },
    {
      condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
      templates: [{ sourceFile: 'csvc/helpers.tpl.ejs', destinationFile: `csvc-${suffix}/templates/_helpers.tpl` }],
    },
  ],
});
const deploymentKnativeFiles = {
  common: [
    {
      templates: [{ sourceFile: 'README-KUBERNETES-KNATIVE.md.ejs', destinationFile: 'KNATIVE-README.md' }],
    },
    {
      condition: generator => generator.generatorTypeK8s,
      templates: [{ sourceFile: 'kubectl-apply.sh.ejs', destinationFile: 'kubectl-knative-apply.sh' }],
    },
    {
      condition: generator => !generator.generatorTypeK8s,
      templates: [
        { sourceFile: 'helm-apply.sh.ejs', destinationFile: 'helm-knative-apply.sh' },
        { sourceFile: 'helm-upgrade.sh.ejs', destinationFile: 'helm-knative-upgrade.sh' },
      ],
    },
  ],
};

export const writeFiles = asWritingTask(async function writeFiles() {
  const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
  const suffix = 'knative';
  await this.writeFiles({
    sections: deploymentKubernetesFiles(suffix),
    rootTemplatesPath: k8s,
    context: this,
  });
  await this.writeFiles({
    sections: deploymentKnativeFiles,
    context: this,
  });
  for (let i = 0; i < this.appConfigs.length; i++) {
    this.app = this.appConfigs[i];
    await this.writeFiles({
      sections: applicationKnativeFiles(suffix),
      context: this,
    });
    await this.writeFiles({
      sections: applicationKubernetesFiles(suffix),
      rootTemplatesPath: k8s,
      context: this,
    });
  }
  if (this.generatorTypeHelm) {
    const helm = this.fetchFromInstalledJHipster('kubernetes-helm/templates');
    for (let i = 0; i < this.appConfigs.length; i++) {
      this.app = this.appConfigs[i];
      await this.writeFiles({
        sections: applicationHelmFiles(suffix),
        rootTemplatesPath: helm,
        context: this,
      });
    }
    await this.writeFiles({
      sections: deploymentHelmFiles(suffix),
      rootTemplatesPath: helm,
      context: this,
    });
  }
});
