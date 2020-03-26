/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    writeFiles,
};

function writeFiles() {
    const packSuffix = 'pack';
    return {
        writeAppChart() {
            const kubernetesSubgenPath = this.fetchFromInstalledJHipster('kubernetes/templates');
            if (this.kubernetesNamespace !== 'default') {
                this.template(`${kubernetesSubgenPath}/namespace.yml.ejs`, 'namespace.yaml');
            }
            for (let i = 0; i < this.appConfigs.length; i++) {
                const appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];

                this.template(
                    `${kubernetesSubgenPath}/deployment.yml.ejs`,
                    `${appName}-${packSuffix}/templates/${appName}-deployment.yaml`
                );
                this.template(`${kubernetesSubgenPath}/service.yml.ejs`, `${appName}-${packSuffix}/templates/${appName}-service.yaml`);
                this.template('app/values.yml.ejs', `${appName}-${packSuffix}/values.yaml`);
                this.template('app/Chart.yml.ejs', `${appName}-${packSuffix}/Chart.yaml`);
                this.template('app/requirements.yml.ejs', `${appName}-${packSuffix}/requirements.yaml`);
                this.template('app/helpers.tpl.ejs', `${appName}-${packSuffix}/templates/_helpers.tpl`);

                if (this.app.prodDatabaseType === 'couchbase') {
                    this.template(
                        `${kubernetesSubgenPath}/db/${this.app.prodDatabaseType}.yml.ejs`,
                        `${appName}-${packSuffix}/templates/${appName}-${this.app.prodDatabaseType}.yaml`
                    );
                }

                if (this.app.searchEngine === 'elasticsearch') {
                    this.template(
                        `${kubernetesSubgenPath}/db/elasticsearch.yml.ejs`,
                        `${appName}-${packSuffix}/templates/${appName}-elasticsearch.yaml`
                    );
                }
                if (this.app.applicationType === 'gateway' || this.app.applicationType === 'monolith') {
                    if (this.istio) {
                        this.template(
                            `${kubernetesSubgenPath}/istio/gateway.yml.ejs`,
                            `${appName}-${packSuffix}/templates/${appName}-gateway.yaml`
                        );
                    } else if (this.kubernetesServiceType === 'Ingress') {
                        this.template(
                            `${kubernetesSubgenPath}/ingress.yml.ejs`,
                            `${appName}-${packSuffix}/templates/${appName}-ingress.yaml`
                        );
                    }
                }
                if (!this.app.serviceDiscoveryType && this.app.authenticationType === 'jwt') {
                    this.template(
                        `${kubernetesSubgenPath}/secret/jwt-secret.yml.ejs`,
                        `${appName}-${packSuffix}/templates/jwt-secret.yaml`
                    );
                }
                if (this.istio) {
                    this.template(
                        `${kubernetesSubgenPath}/istio/destination-rule.yml.ejs`,
                        `${appName}-${packSuffix}/templates/${appName}-destination-rule.yaml`
                    );
                    this.template(
                        `${kubernetesSubgenPath}/istio/virtual-service.yml.ejs`,
                        `${appName}-${packSuffix}/templates/${appName}-virtual-service.yaml`
                    );
                }
            }
        },

        writeCommonServiceChart() {
            const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
            const cs = 'csvc';
            if (
                this.useKafka ||
                this.monitoring === 'elk' ||
                this.monitoring === 'prometheus' ||
                this.serviceDiscoveryType === 'eureka' ||
                this.serviceDiscoveryType === 'consul'
            ) {
                this.template('csvc/values.yml.ejs', `${cs}-${packSuffix}/values.yaml`);
                this.template('csvc/Chart.yml.ejs', `${cs}-${packSuffix}/Chart.yaml`);
                this.template('csvc/requirements.yml.ejs', `${cs}-${packSuffix}/requirements.yaml`);
                this.template('csvc/helpers.tpl.ejs', `${cs}-${packSuffix}/templates/_helpers.tpl`);
            }
            if (this.monitoring === 'elk') {
                this.template(`${k8s}/console/jhipster-logstash.yml.ejs`, `${cs}-${packSuffix}/templates/jhipster-logstash.yaml`);
                this.template(`${k8s}/console/jhipster-console.yml.ejs`, `${cs}-${packSuffix}/templates/jhipster-console.yaml`);
                this.template(
                    `${k8s}/console/jhipster-dashboard-console.yml.ejs`,
                    `${cs}-${packSuffix}/templates/jhipster-dashboard-console.yaml`
                );
                if (this.deploymentApplicationType === 'microservice') {
                    this.template(`${k8s}/console/jhipster-zipkin.yml.ejs`, `${cs}-${packSuffix}/templates/jhipster-zipkin.yaml`);
                }
                if (this.istio) {
                    this.template(
                        `${k8s}/istio/gateway/jhipster-console-gateway.yml.ejs`,
                        `${cs}-${packSuffix}/templates/jhipster-console-gateway.yaml`
                    );
                }
            }
            if (this.monitoring === 'prometheus') {
                if (this.istio && this.kubernetesServiceType === 'Ingress') {
                    this.template(
                        `${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`,
                        `${cs}-${packSuffix}/templates/jhipster-grafana-gateway.yaml`
                    );
                }
            }
            if (this.serviceDiscoveryType === 'eureka') {
                this.template(`${k8s}/registry/jhipster-registry.yml.ejs`, `${cs}-${packSuffix}/templates/jhipster-registry.yaml`);
                this.template(`${k8s}/registry/application-configmap.yml.ejs`, `${cs}-${packSuffix}/templates/application-configmap.yaml`);
            }
            if (this.serviceDiscoveryType === 'consul') {
                this.template(`${k8s}/registry/consul.yml.ejs`, `${cs}-${packSuffix}/templates/consul.yaml`);
                this.template(`${k8s}/registry/consul-config-loader.yml.ejs`, `${cs}-${packSuffix}/templates/consul-config-loader.yaml`);
                this.template(`${k8s}/registry/application-configmap.yml.ejs`, `${cs}-${packSuffix}/templates/application-configmap.yaml`);
            }
        },

        writeReadme() {
            this.template('README-KUBERNETES-HELM.md.ejs', 'HELM-README.md');
        },

        writeConfigRunFile() {
            this.template('helm-apply.sh.ejs', 'helm-apply.sh');
            this.template('helm-upgrade.sh.ejs', 'helm-upgrade.sh');
        },

        writeObservabilityGatewayFiles() {
            if (!this.istio) return;
            const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
            this.template(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, `istio-${packSuffix}/grafana-gateway.yaml`);
            this.template(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, `istio-${packSuffix}/zipkin-gateway.yaml`);
            this.template(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, `istio-${packSuffix}/kiali-gateway.yaml`);
        }
    };
}
