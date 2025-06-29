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
import { authenticationTypes, kubernetesPlatformTypes, monitoringTypes, serviceDiscoveryTypes } from '../../lib/jhipster/index.js';
import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.js';
import type { WriteFileSection } from '../base-core/api.js';

const { JWT } = authenticationTypes;
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
  elasticsearch: [
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
        (data.app.applicationTypeGateway || data.app.applicationTypeMonolith) && !data.istio && data.kubernetesServiceType === INGRESS,
      renameTo: data => `${data.app.baseName.toLowerCase()}-${suffix}/templates/${data.app.baseName.toLowerCase()}-ingress.yml`,
      templates: ['ingress.yml'],
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
const writeDeploymentFiles = (suffix = '') => ({
  namespace: [
    {
      condition: data => data.kubernetesNamespace !== 'default',
      templates: ['namespace.yml'],
    },
  ],
});

export const writeFiles = asWritingTask(async function writeFiles() {
  const suffix = 'helm';

  await this.writeFiles({
    sections: writeDeploymentFiles(suffix),
    context: this,
    rootTemplatesPath: this.fetchFromInstalledJHipster('kubernetes/templates'),
  });

  const kubernetesSubgenPath = this.fetchFromInstalledJHipster('kubernetes/templates');
  for (let i = 0; i < this.appConfigs.length; i++) {
    const appName = this.appConfigs[i].baseName.toLowerCase();
    const appOut = appName.concat('-', suffix);
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
    if (!this.app.serviceDiscoveryAny && this.app.authenticationType === JWT) {
      await this.writeFile(`${kubernetesSubgenPath}/secret/jwt-secret.yml.ejs`, `${appOut}/templates/jwt-secret.yml`);
    }
    if (this.app.databaseTypeCouchbase) {
      await this.writeFile(`${kubernetesSubgenPath}/secret/couchbase-secret.yml.ejs`, `${appOut}/templates/couchbase-secret.yml`);
    }
    if (this.istio) {
      await this.writeFile(`${kubernetesSubgenPath}/istio/destination-rule.yml.ejs`, `${appOut}/templates/${appName}-destination-rule.yml`);
      await this.writeFile(`${kubernetesSubgenPath}/istio/virtual-service.yml.ejs`, `${appOut}/templates/${appName}-virtual-service.yml`);
    }
  }
  // common services
  const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
  const csOut = 'csvc'.concat('-', suffix);
  if (this.useKafka || this.monitoring === PROMETHEUS || this.serviceDiscoveryType === EUREKA || this.serviceDiscoveryType === CONSUL) {
    await this.writeFile('csvc/values.yml.ejs', `${csOut}/values.yaml`);
    await this.writeFile('csvc/Chart.yml.ejs', `${csOut}/Chart.yaml`);
    await this.writeFile('csvc/requirements.yml.ejs', `${csOut}/requirements.yaml`);
    await this.writeFile('csvc/helpers.tpl.ejs', `${csOut}/templates/_helpers.tpl`);
  }
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
