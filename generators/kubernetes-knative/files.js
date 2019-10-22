/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
    writeFiles
};

function writeFiles() {
    return {
        writeDeployments() {
            const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
            if (this.kubernetesNamespace !== 'default') {
                this.template(`${k8s}/namespace.yml.ejs`, 'namespace.yml');
            }
            for (let i = 0; i < this.appConfigs.length; i++) {
                const appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('service.yml.ejs', `${appName}/${appName}-service.yml`);
                // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
                if (this.app.prodDatabaseType !== 'no') {
                    this.template(
                        `${k8s}/db/${this.app.prodDatabaseType}.yml.ejs`,
                        `${appName}/${appName}-${this.app.prodDatabaseType}.yml`
                    );
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template(`${k8s}/db/elasticsearch.yml.ejs`, `${appName}/${appName}-elasticsearch.yml`);
                }
                if (this.app.applicationType === 'gateway' || this.app.applicationType === 'monolith') {
                    if (this.istio) {
                        this.template('istio/gateway.yml.ejs', `${appName}/${appName}-gateway.yml`);
                    } else if (this.kubernetesServiceType === 'Ingress') {
                        this.template(`${k8s}/ingress.yml.ejs`, `${appName}/${appName}-ingress.yml`);
                    }
                }
                if (!this.app.serviceDiscoveryType && this.app.authenticationType === 'jwt') {
                    this.template(`${k8s}/secret/jwt-secret.yml.ejs`, `${appName}/jwt-secret.yml`);
                }
                if (this.monitoring === 'prometheus') {
                    this.template(`${k8s}/monitoring/jhipster-prometheus-sm.yml.ejs`, `${appName}/${appName}-prometheus-sm.yml`);
                }
                if (this.istio) {
                    this.template('istio/destination-rule.yml.ejs', `${appName}/${appName}-destination-rule.yml`);
                    this.template('istio/virtual-service.yml.ejs', `${appName}/${appName}-virtual-service.yml`);
                }
            }
        },

        writeServiceFiles() {
            const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
            if (this.useKafka) {
                this.template(`${k8s}/messagebroker/kafka.yml.ejs`, 'messagebroker/kafka.yml');
            }

            if (this.monitoring === 'elk') {
                this.template(`${k8s}/console/jhipster-elasticsearch.yml.ejs`, 'console/jhipster-elasticsearch.yml');
                this.template(`${k8s}/console/jhipster-logstash.yml.ejs`, 'console/jhipster-logstash.yml');
                this.template(`${k8s}/console/jhipster-console.yml.ejs`, 'console/jhipster-console.yml');
                this.template(`${k8s}/console/jhipster-dashboard-console.yml.ejs`, 'console/jhipster-dashboard-console.yml');
                if (this.deploymentApplicationType === 'microservice') {
                    this.template(`${k8s}/console/jhipster-zipkin.yml.ejs`, 'console/jhipster-zipkin.yml');
                }
                if (this.istio) {
                    this.template(`${k8s}/istio/gateway/jhipster-console-gateway.yml.ejs`, 'console/jhipster-console-gateway.yml');
                }
            }

            if (this.monitoring === 'prometheus') {
                this.template(`${k8s}/monitoring/jhipster-prometheus-crd.yml.ejs`, 'monitoring/jhipster-prometheus-crd.yml');
                this.template(`${k8s}/monitoring/jhipster-prometheus-cr.yml.ejs`, 'monitoring/jhipster-prometheus-cr.yml');
                this.template(`${k8s}/monitoring/jhipster-grafana.yml.ejs`, 'monitoring/jhipster-grafana.yml');
                this.template(`${k8s}/monitoring/jhipster-grafana-dashboard.yml.ejs`, 'monitoring/jhipster-grafana-dashboard.yml');
                if (this.istio) {
                    this.template(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, 'monitoring/jhipster-grafana-gateway.yml');
                }
            }

            if (this.serviceDiscoveryType === 'eureka') {
                this.template(`${k8s}/registry/jhipster-registry.yml.ejs`, 'registry/jhipster-registry.yml');
                this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'registry/application-configmap.yml');
            } else if (this.serviceDiscoveryType === 'consul') {
                this.template(`${k8s}/registry/consul.yml.ejs`, 'registry/consul.yml');
                this.template(`${k8s}/registry/consul-config-loader.yml.ejs`, 'registry/consul-config-loader.yml');
                this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'registry/application-configmap.yml');
            }

            if (this.istio) {
                this.template(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, 'istio/grafana-gateway.yml');
                this.template(`${k8s}/istio/gateway/jaeger-gateway.yml.ejs`, 'istio/jaeger-gateway.yml');
                this.template(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, 'istio/kiali-gateway.yml');
            }
        },

        writeReadme() {
            this.template('README-KUBERNETES-KNATIVE.md.ejs', 'README.md');
        },

        writeConfigRunFile() {
            this.template('kubectl-apply.sh.ejs', 'kubectl-apply.sh');
        }
    };
}
