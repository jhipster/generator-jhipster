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
import { asWriteFilesSection } from '../../../base-application/support/index.ts';

export const applicationKubernetesFiles = (suffix: string) =>
  asWriteFilesSection<any>({
    common: [
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-deployment.yml`,
        templates: ['deployment.yml'],
      },
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-service.yml`,
        templates: ['service.yml'],
      },
    ],
    searchEngine: [
      {
        condition: data => data.app.searchEngineElasticsearch,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-elasticsearch.yml`,
        templates: ['db/elasticsearch.yml'],
      },
    ],
    gateway: [
      {
        condition: data => (data.app.applicationTypeGateway || data.app.applicationTypeMonolith) && data.istio,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-gateway.yml`,
        templates: ['istio/gateway.yml'],
      },
      {
        condition: data =>
          (data.app.applicationTypeGateway || data.app.applicationTypeMonolith) && !data.istio && data.kubernetesServiceTypeIngress,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-ingress.yml`,
        templates: ['ingress.yml'],
      },
    ],
    authenticationType: [
      {
        condition: data => !data.app.serviceDiscoveryAny && data.app.authenticationTypeJwt,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/jwt-secret.yml`,
        templates: ['secret/jwt-secret.yml'],
      },
    ],
    databaseType: [
      {
        condition: data => data.app.databaseTypeCouchbase,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/couchbase-secret.yml`,
        templates: ['secret/couchbase-secret.yml'],
      },
    ],
    istio: [
      {
        condition: data => data.istio,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-destination-rule.yml`,
        templates: ['istio/destination-rule.yml'],
      },
      {
        condition: data => data.istio,
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-virtual-service.yml`,
        templates: ['istio/virtual-service.yml'],
      },
    ],
  });

export const applicationHelmFiles = (suffix: string) =>
  asWriteFilesSection<any>({
    common: [
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/values.yaml`,
        templates: ['app/values.yml'],
      },
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/Chart.yaml`,
        templates: ['app/Chart.yml'],
      },
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/requirements.yaml`,
        templates: ['app/requirements.yml'],
      },
      {
        renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/_helpers.tpl`,
        templates: ['app/helpers.tpl'],
      },
    ],
  });

export const deploymentKubernetesFiles = (suffix = '') =>
  asWriteFilesSection<any>({
    namespace: [
      {
        condition: data => data.kubernetesNamespace !== 'default',
        templates: ['namespace.yml'],
      },
    ],
    monitoring: [
      {
        condition: data => data.monitoringPrometheus && data.istio && data.kubernetesServiceTypeIngress,
        renameTo: () => `csvc-${suffix}/templates/jhipster-grafana-gateway.yml`,
        templates: ['istio/gateway/jhipster-grafana-gateway.yml'],
      },
    ],
    serviceDiscovery: [
      {
        condition: data => data.serviceDiscoveryTypeEureka,
        renameTo: () => `csvc-${suffix}/templates/jhipster-registry.yml`,
        templates: ['registry/jhipster-registry.yml'],
      },
      {
        condition: data => data.serviceDiscoveryTypeEureka,
        renameTo: () => `csvc-${suffix}/templates/application-configmap.yml`,
        templates: ['registry/application-configmap.yml'],
      },
      {
        condition: data => data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/templates/consul.yml`,
        templates: ['registry/consul.yml'],
      },
      {
        condition: data => data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/templates/consul-config-loader.yml`,
        templates: ['registry/consul-config-loader.yml'],
      },
      {
        condition: data => data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/templates/application-configmap.yml`,
        templates: ['registry/application-configmap.yml'],
      },
    ],
    istio: [
      {
        condition: data => data.istio,
        renameTo: () => `csvc-${suffix}/templates/grafana-gateway.yml`,
        templates: ['istio/gateway/grafana-gateway.yml'],
      },
      {
        condition: data => data.istio,
        renameTo: () => `csvc-${suffix}/templates/zipkin-gateway.yml`,
        templates: ['istio/gateway/zipkin-gateway.yml'],
      },
      {
        condition: data => data.istio,
        renameTo: () => `csvc-${suffix}/templates/kiali-gateway.yml`,
        templates: ['istio/gateway/kiali-gateway.yml'],
      },
    ],
  });

export const deploymentHelmFiles = (suffix = '') =>
  asWriteFilesSection<any>({
    common: [
      {
        templates: [{ sourceFile: 'README-KUBERNETES-HELM.md.ejs', destinationFile: 'HELM-README.md' }, 'helm-apply.sh', 'helm-upgrade.sh'],
      },
    ],
    values: [
      {
        condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/values.yaml`,
        templates: ['csvc/values.yml'],
      },
      {
        condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/Chart.yaml`,
        templates: ['csvc/Chart.yml'],
      },
      {
        condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/requirements.yaml`,
        templates: ['csvc/requirements.yml'],
      },
      {
        condition: data => data.useKafka || data.monitoringPrometheus || data.serviceDiscoveryTypeEureka || data.serviceDiscoveryTypeConsul,
        renameTo: () => `csvc-${suffix}/templates/_helpers.tpl`,
        templates: ['csvc/helpers.tpl'],
      },
    ],
  });
