/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
            for (let i = 0; i < this.appConfigs.length; i++) {
                const appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('_deployment.yml', `${this.directoryPath}/k8s/${appName}/${appName}-deployment.yml`);
                this.template('_service.yml', `${this.directoryPath}/k8s/${appName}/${appName}-service.yml`);
                // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
                if (this.app.prodDatabaseType !== 'no') {
                    this.template(`db/_${this.app.prodDatabaseType}.yml`, `${this.directoryPath}/k8s/${appName}/${appName}-${this.app.prodDatabaseType}.yml`);
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template('db/_elasticsearch.yml', `${this.directoryPath}/k8s/${appName}/${appName}-elasticsearch.yml`);
                }
                if (this.app.messageBroker === 'kafka') {
                    this.template('db/_kafka.yml', `${this.directoryPath}/k8s/${appName}/${appName}-kafka.yml`);
                }
                if ((this.app.applicationType === 'gateway' || this.app.applicationType === 'monolith') && this.kubernetesServiceType === 'Ingress') {
                    this.template('_ingress.yml', `${this.directoryPath}/k8s/${appName}/${appName}-ingress.yml`);
                }
                if (this.monitoring === 'prometheus') {
                    this.template('monitoring/_jhipster-prometheus-sm.yml', `${this.directoryPath}/k8s/${appName}/${appName}-prometheus-sm.yml`);
                }
            }
        },

        writeReadme() {
            this.template('_README-KUBERNETES.md', `${this.directoryPath}/k8s/README.md`);
        },

        writeNamespace() {
            if (this.kubernetesNamespace !== 'default') {
                this.template('_namespace.yml', `${this.directoryPath}/k8s/namespace.yml`);
            }
        },

        writeJhipsterConsole() {
            if (this.monitoring === 'elk') {
                this.template('console/_jhipster-elasticsearch.yml', `${this.directoryPath}/k8s/console/jhipster-elasticsearch.yml`);
                this.template('console/_jhipster-logstash.yml', `${this.directoryPath}/k8s/console/jhipster-logstash.yml`);
                this.template('console/_jhipster-console.yml', `${this.directoryPath}/k8s/console/jhipster-console.yml`);
                this.template('console/_jhipster-dashboard-console.yml', `${this.directoryPath}/k8s/console/jhipster-dashboard-console.yml`);
                if (this.composeApplicationType === 'microservice') {
                    this.template('console/_jhipster-zipkin.yml', `${this.directoryPath}/k8s/console/jhipster-zipkin.yml`);
                }
            }
        },

        writePrometheusGrafanaFiles() {
            if (this.monitoring === 'prometheus') {
                this.template('monitoring/_jhipster-prometheus-crd.yml', `${this.directoryPath}/k8s/monitoring/jhipster-prometheus-crd.yml`);
                this.template('monitoring/_jhipster-prometheus-cr.yml', `${this.directoryPath}/k8s/monitoring/jhipster-prometheus-cr.yml`);
                this.template('monitoring/_jhipster-grafana.yml', `${this.directoryPath}/k8s/monitoring/jhipster-grafana.yml`);
                this.template('monitoring/_jhipster-grafana-dashboard.yml', `${this.directoryPath}/k8s/monitoring/jhipster-grafana-dashboard.yml`);
            }
        },

        writeRegistryFiles() {
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('registry/_jhipster-registry.yml', `${this.directoryPath}/k8s/registry/jhipster-registry.yml`);
                this.template('registry/_application-configmap.yml', `${this.directoryPath}/k8s/registry/application-configmap.yml`);
            } else if (this.serviceDiscoveryType === 'consul') {
                this.template('registry/_consul.yml', `${this.directoryPath}/k8s/registry/consul.yml`);
                this.template('registry/_consul-config-loader.yml', `${this.directoryPath}/k8s/registry/consul-config-loader.yml`);
                this.template('registry/_application-configmap.yml', `${this.directoryPath}/k8s/registry/application-configmap.yml`);
            }
        },

        writeConfigRunFile() {
            this.template('_apply.sh', `${this.directoryPath}/k8s/kubectl-apply.sh`);
        }

    };
}
