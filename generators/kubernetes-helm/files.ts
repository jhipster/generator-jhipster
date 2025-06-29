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
import { kubernetesPlatformTypes, monitoringTypes, serviceDiscoveryTypes } from '../../lib/jhipster/index.js';
import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.js';
import type { WriteFileSection } from '../base-core/api.js';

const { PROMETHEUS } = monitoringTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { ServiceTypes } = kubernetesPlatformTypes;

const { INGRESS } = ServiceTypes;

const applicationFiles: WriteFileSection = asWriteFilesSection((suffix: string) => ({
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
}));
const helmApplicationFiles: WriteFileSection = asWriteFilesSection((suffix: string) => ({
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
}));

const writeKubernetesDeploymenFiles = (suffix = '') => ({
  namespace: [
    {
      condition: data => data.kubernetesNamespace !== 'default',
      templates: ['namespace.yml'],
    },
  ],
});
const writeDeploymentFiles = (suffix = '') => ({
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

export const writeFiles = asWritingTask(async function writeFiles() {
  const suffix = 'helm';

  await this.writeFiles({
    sections: writeKubernetesDeploymenFiles(suffix),
    context: this,
    rootTemplatesPath: this.fetchFromInstalledJHipster('kubernetes/templates'),
  });
  for (let i = 0; i < this.appConfigs.length; i++) {
    this.app = this.appConfigs[i];
    await this.writeFiles({
      sections: applicationFiles(suffix),
      context: this,
      rootTemplatesPath: this.fetchFromInstalledJHipster('kubernetes/templates'),
    });
    await this.writeFiles({
      sections: helmApplicationFiles(suffix),
      context: this,
    });
  }
  await this.writeFiles({
    sections: writeDeploymentFiles(suffix),
    context: this,
  });

  // common services
  const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
  const csOut = 'csvc'.concat('-', suffix);
  if (this.monitoring === PROMETHEUS) {
    if (this.istio && this.kubernetesServiceType === INGRESS) {
      await this.writeFile(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, `${csOut}/templates/jhipster-grafana-gateway.yml`);
    }
  }
  if (this.serviceDiscoveryType === EUREKA) {
    await this.writeFile(`${k8s}/registry/jhipster-registry.yml.ejs`, `${csOut}/templates/jhipster-registry.yml`);
    await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
  }
  if (this.serviceDiscoveryType === CONSUL) {
    await this.writeFile(`${k8s}/registry/consul.yml.ejs`, `${csOut}/templates/consul.yml`);
    await this.writeFile(`${k8s}/registry/consul-config-loader.yml.ejs`, `${csOut}/templates/consul-config-loader.yml`);
    await this.writeFile(`${k8s}/registry/application-configmap.yml.ejs`, `${csOut}/templates/application-configmap.yml`);
  }
  if (this.istio) {
    await this.writeFile(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `${csOut}/templates/grafana-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `${csOut}/templates/zipkin-gateway.yml`);
    await this.writeFile(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `${csOut}/templates/kiali-gateway.yml`);
  }
  // Readme
  await this.writeFile('README-KUBERNETES-HELM.md.ejs', 'HELM-README.md');
  // run files
  await this.writeFile('helm-apply.sh.ejs', 'helm-apply.sh');
  await this.writeFile('helm-upgrade.sh.ejs', 'helm-upgrade.sh');
});
