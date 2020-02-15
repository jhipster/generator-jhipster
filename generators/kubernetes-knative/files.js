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
    writeFiles
};

function writeFiles() {
    return {
        writeGeneratorFiles() {
            const k8s = this.fetchFromInstalledJHipster('kubernetes/templates');
            const helm = this.fetchFromInstalledJHipster('kubernetes-helm/templates');
            if (this.kubernetesNamespace !== 'default') {
                this.template(`${k8s}/namespace.yml.ejs`, 'namespace.yml');
            }
            this.template('README-KUBERNETES-KNATIVE.md.ejs', 'README.md');
            if (this.generatorType === 'k8s') {
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
                        this.template('istio/gateway.yml.ejs', `${appName}/${appName}-gateway.yml`);
                    }
                    if (!this.app.serviceDiscoveryType && this.app.authenticationType === 'jwt') {
                        this.template(`${k8s}/secret/jwt-secret.yml.ejs`, `${appName}/jwt-secret.yml`);
                    }
                    if (this.monitoring === 'prometheus') {
                        this.template(`${k8s}/monitoring/jhipster-prometheus-sm.yml.ejs`, `${appName}/${appName}-prometheus-sm.yml`);
                    }
                    this.template('istio/destination-rule.yml.ejs', `${appName}/${appName}-destination-rule.yml`);
                    this.template('istio/virtual-service.yml.ejs', `${appName}/${appName}-virtual-service.yml`);
                }

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
                    this.template(`${k8s}/istio/gateway/jhipster-console-gateway.yml.ejs`, 'console/jhipster-console-gateway.yml');
                }

                if (this.monitoring === 'prometheus') {
                    this.template(`${k8s}/monitoring/jhipster-prometheus-crd.yml.ejs`, 'monitoring/jhipster-prometheus-crd.yml');
                    this.template(`${k8s}/monitoring/jhipster-prometheus-cr.yml.ejs`, 'monitoring/jhipster-prometheus-cr.yml');
                    this.template(`${k8s}/monitoring/jhipster-grafana.yml.ejs`, 'monitoring/jhipster-grafana.yml');
                    this.template(`${k8s}/monitoring/jhipster-grafana-dashboard.yml.ejs`, 'monitoring/jhipster-grafana-dashboard.yml');
                    this.template(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, 'monitoring/jhipster-grafana-gateway.yml');
                }

                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(`${k8s}/registry/jhipster-registry.yml.ejs`, 'registry/jhipster-registry.yml');
                    this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'registry/application-configmap.yml');
                } else if (this.serviceDiscoveryType === 'consul') {
                    this.template(`${k8s}/registry/consul.yml.ejs`, 'registry/consul.yml');
                    this.template(`${k8s}/registry/consul-config-loader.yml.ejs`, 'registry/consul-config-loader.yml');
                    this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'registry/application-configmap.yml');
                }
                this.template(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, 'istio/grafana-gateway.yml');
                this.template(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, 'istio/zipkin-gateway.yml');
                this.template(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, 'istio/kiali-gateway.yml');
                this.template('kubectl-apply.sh.ejs', 'kubectl-knative-apply.sh');
            } else {
                for (let i = 0; i < this.appConfigs.length; i++) {
                    const appName = this.appConfigs[i].baseName.toLowerCase();
                    this.app = this.appConfigs[i];

                    this.template('service.yml.ejs', `${appName}/templates/${appName}-service.yml`);
                    this.template(`${helm}/app/values.yml.ejs`, `${appName}/values.yml`);
                    this.template(`${helm}/app/Chart.yml.ejs`, `${appName}/Chart.yml`);
                    this.template(`${helm}/app/requirements.yml.ejs`, `${appName}/requirements.yml`);
                    this.template(`${helm}/app/helpers.tpl.ejs`, `${appName}/templates/_helpers.tpl`);

                    if (this.app.prodDatabaseType === 'couchbase') {
                        this.template(
                            `${k8s}/db/${this.app.prodDatabaseType}.yml.ejs`,
                            `${appName}/templates/${appName}-${this.app.prodDatabaseType}.yml`
                        );
                    }

                    if (this.app.searchEngine === 'elasticsearch') {
                        this.template(`${k8s}/db/elasticsearch.yml.ejs`, `${appName}/templates/${appName}-elasticsearch.yml`);
                    }
                    if (this.app.applicationType === 'gateway' || this.app.applicationType === 'monolith') {
                        this.template('istio/gateway.yml.ejs', `${appName}/templates/${appName}-gateway.yml`);
                    }
                    if (!this.app.serviceDiscoveryType && this.app.authenticationType === 'jwt') {
                        this.template(`${k8s}/secret/jwt-secret.yml.ejs`, `${appName}/templates/jwt-secret.yml`);
                    }
                    this.template('istio/destination-rule.yml.ejs', `${appName}/templates/${appName}-destination-rule.yml`);
                    this.template('istio/virtual-service.yml.ejs', `${appName}/templates/${appName}-virtual-service.yml`);
                }

                if (
                    this.useKafka ||
                    this.monitoring === 'elk' ||
                    this.monitoring === 'prometheus' ||
                    this.serviceDiscoveryType === 'eureka' ||
                    this.serviceDiscoveryType === 'consul'
                ) {
                    this.template(`${helm}/csvc/values.yml.ejs`, 'csvc/values.yml');
                    this.template(`${helm}/csvc/Chart.yml.ejs`, 'csvc/Chart.yml');
                    this.template(`${helm}/csvc/requirements.yml.ejs`, 'csvc/requirements.yml');
                    this.template(`${helm}/csvc/helpers.tpl.ejs`, 'csvc/templates/_helpers.tpl');
                }
                if (this.monitoring === 'elk') {
                    this.template(`${k8s}/console/jhipster-logstash.yml.ejs`, 'csvc/templates/jhipster-logstash.yml');
                    this.template(`${k8s}/console/jhipster-console.yml.ejs`, 'csvc/templates/jhipster-console.yml');
                    this.template(`${k8s}/console/jhipster-dashboard-console.yml.ejs`, 'csvc/templates/jhipster-dashboard-console.yml');
                    if (this.deploymentApplicationType === 'microservice') {
                        this.template(`${k8s}/console/jhipster-zipkin.yml.ejs`, 'csvc/templates/jhipster-zipkin.yml');
                    }
                    this.template(`${k8s}/istio/gateway/jhipster-console-gateway.yml.ejs`, 'csvc/templates/jhipster-console-gateway.yml');
                }
                if (this.monitoring === 'prometheus') {
                    this.template(`${k8s}/istio/gateway/jhipster-grafana-gateway.yml.ejs`, 'csvc/templates/jhipster-grafana-gateway.yml');
                }
                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(`${k8s}/registry/jhipster-registry.yml.ejs`, 'csvc/templates/jhipster-registry.yml');
                    this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'csvc/templates/application-configmap.yml');
                }
                if (this.serviceDiscoveryType === 'consul') {
                    this.template(`${k8s}/registry/consul.yml.ejs`, 'csvc/templates/consul.yml');
                    this.template(`${k8s}/registry/consul-config-loader.yml.ejs`, 'csvc/templates/consul-config-loader.yml');
                    this.template(`${k8s}/registry/application-configmap.yml.ejs`, 'csvc/templates/application-configmap.yml');
                }
                this.template(`${k8s}/istio/gateway/grafana-gateway.yml.ejs`, 'csvc/templates/grafana-gateway.yml');
                this.template(`${k8s}/istio/gateway/zipkin-gateway.yml.ejs`, 'csvc/templates/zipkin-gateway.yml');
                this.template(`${k8s}/istio/gateway/kiali-gateway.yml.ejs`, 'csvc/templates/kiali-gateway.yml');
                this.template('helm-apply.sh.ejs', 'helm-knative-apply.sh');
                this.template('helm-upgrade.sh.ejs', 'helm-knative-upgrade.sh');
            }
        }
    };
}
