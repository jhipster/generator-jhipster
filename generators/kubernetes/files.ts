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

import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.js';
import type { WriteFileSection } from '../base-core/api.js';

const applicationFiles: WriteFileSection = asWriteFilesSection((suffix: string) => ({
  common: [
    {
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-deployment.yml`,
      templates: ['deployment.yml'],
    },
    {
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-service.yml`,
      templates: ['service.yml'],
    },
  ],
  database: [
    {
      // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
      condition: data => !data.app.databaseTypeNo,
      renameTo: data =>
        `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-${data.app.prodDatabaseType ?? data.app.databaseType}.yml`,
      templates: [{ sourceFile: data => `db/${data.app.prodDatabaseType ?? data.app.databaseType}.yml` }],
    },
    {
      condition: data => data.app.databaseTypeCouchbase,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/couchbase-secret.yml`,
      templates: ['secret/couchbase-secret.yml'],
    },
  ],
  searchEngine: [
    {
      condition: data => data.app.searchEngineElasticsearch,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-elasticsearch.yml`,
      templates: ['db/elasticsearch.yml'],
    },
  ],
  gateway: [
    {
      condition: data => (data.app.applicationTypeGateway || data.app.applicationTypeMonolith) && data.istio,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-gateway.yml`,
      templates: ['istio/gateway.yml'],
    },
    {
      condition: data =>
        (data.app.applicationTypeGateway || data.app.applicationTypeMonolith) && !data.istio && data.kubernetesServiceTypeIngress,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-ingress.yml`,
      templates: ['ingress.yml'],
    },
  ],
  serviceDiscovery: [
    {
      condition: data => !data.app.serviceDiscoveryAny && data.app.authenticationTypeJwt,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-jwt-secret.yml`,
      templates: ['secret/jwt-secret.yml'],
    },
  ],
  monitoring: [
    {
      condition: data => data.monitoringPrometheus,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-prometheus-sm.yml`,
      templates: ['monitoring/jhipster-prometheus-sm.yml'],
    },
  ],
  istio: [
    {
      condition: data => data.istio,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-destination-rule.yml`,
      templates: ['istio/destination-rule.yml'],
    },
    {
      condition: data => data.istio,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/${data.app.baseName.toLowerCase()}-virtual-service.yml`,
      templates: ['istio/virtual-service.yml'],
    },
  ],
}));

const writeDeploymentFiles = asWriteFilesSection((suffix = '') => ({
  common: [
    {
      templates: [
        { sourceFile: 'README-KUBERNETES.md', destinationFile: 'K8S-README.md' },
        'kubectl-apply.sh',
        { sourceFile: 'kustomize/kustomization.yml.ejs', destinationFile: 'kustomization.yml' },
        { sourceFile: 'skaffold/skaffold.yml.ejs', destinationFile: 'skaffold.yml' },
      ],
    },
  ],
  namespace: [
    {
      condition: data => !data.kubernetesNamespaceDefault,
      templates: ['namespace.yml'],
    },
  ],
  messageBroker: [
    {
      condition: data => data.useKafka,
      templates: [{ sourceFile: 'messagebroker/kafka.yml', destinationFile: `messagebroker-${suffix}/kafka.yml` }],
    },
  ],
  authentication: [
    {
      condition: data => data.useKeycloak,
      templates: [
        { sourceFile: 'keycloak/keycloak-configmap.yml.ejs', destinationFile: `keycloak-${suffix}/keycloak-configmap.yml` },
        { sourceFile: 'keycloak/keycloak-postgresql.yml.ejs', destinationFile: `keycloak-${suffix}/keycloak-postgresql.yml` },
        { sourceFile: 'keycloak/keycloak.yml.ejs', destinationFile: `keycloak-${suffix}/keycloak.yml` },
      ],
    },
    {
      condition: data => data.useKeycloak && data.ingressTypeGke,
      templates: [
        {
          sourceFile: 'cert-manager/letsencrypt-staging-ca-secret.yml.ejs',
          destinationFile: 'cert-manager/letsencrypt-staging-ca-secret.yml',
        },
        {
          sourceFile: 'cert-manager/letsencrypt-staging-issuer.yml.ejs',
          destinationFile: 'cert-manager/letsencrypt-staging-issuer.yml',
        },
      ],
    },
  ],
  monitoring: [
    {
      condition: data => data.monitoringPrometheus,
      templates: [
        {
          sourceFile: 'monitoring/jhipster-prometheus-crd.yml.ejs',
          destinationFile: 'monitoring-k8s/jhipster-prometheus-crd.yml',
        },
        {
          sourceFile: 'monitoring/jhipster-prometheus-cr.yml.ejs',
          destinationFile: 'monitoring-k8s/jhipster-prometheus-cr.yml',
        },
        {
          sourceFile: 'monitoring/jhipster-grafana.yml.ejs',
          destinationFile: 'monitoring-k8s/jhipster-grafana.yml',
        },
        {
          sourceFile: 'monitoring/jhipster-grafana-dashboard.yml.ejs',
          destinationFile: 'monitoring-k8s/jhipster-grafana-dashboard.yml',
        },
      ],
    },
    {
      condition: data => data.monitoringPrometheus && data.istio,
      templates: [
        {
          sourceFile: 'istio/gateway/jhipster-grafana-gateway.yml.ejs',
          destinationFile: 'monitoring-k8s/jhipster-grafana-gateway.yml',
        },
      ],
    },
  ],
  serviceDiscovery: [
    {
      condition: data => data.serviceDiscoveryTypeEureka,
      templates: [
        { sourceFile: 'registry/jhipster-registry.yml.ejs', destinationFile: `registry-${suffix}/jhipster-registry.yml` },
        { sourceFile: 'registry/application-configmap.yml.ejs', destinationFile: `registry-${suffix}/application-configmap.yml` },
      ],
    },
    {
      condition: data => data.serviceDiscoveryTypeConsul,
      templates: [
        { sourceFile: 'registry/consul.yml.ejs', destinationFile: `registry-${suffix}/consul.yml` },
        { sourceFile: 'registry/consul-config-loader.yml.ejs', destinationFile: `registry-${suffix}/consul-config-loader.yml` },
        { sourceFile: 'registry/application-configmap.yml.ejs', destinationFile: `registry-${suffix}/application-configmap.yml` },
      ],
    },
  ],
  serviceMesh: [
    {
      condition: data => data.istio,
      templates: [
        { sourceFile: 'istio/gateway/grafana-gateway.yml.ejs', destinationFile: `istio-${suffix}/grafana-gateway.yml` },
        { sourceFile: 'istio/gateway/zipkin-gateway.yml.ejs', destinationFile: `istio-${suffix}/zipkin-gateway.yml` },
        { sourceFile: 'istio/gateway/kiali-gateway.yml.ejs', destinationFile: `istio-${suffix}/kiali-gateway.yml` },
        { sourceFile: 'kustomize/patch/istio-label.yml.ejs', destinationFile: `patch-${suffix}/istio-label.yml` },
        { sourceFile: 'kustomize/patch/istio-namespace.yml.ejs', destinationFile: `patch-${suffix}/istio-namespace.yml` },
      ],
    },
  ],
}));
export const writeFiles = asWritingTask(async function writeFiles() {
  for (let i = 0; i < this.appConfigs.length; i++) {
    this.app = this.appConfigs[i];
    await this.writeFiles({
      sections: applicationFiles('k8s'),
      context: this,
    });
  }
  await this.writeFiles({
    sections: writeDeploymentFiles('k8s'),
    context: this,
  });
});
