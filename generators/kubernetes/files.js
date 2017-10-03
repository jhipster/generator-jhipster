/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
                this.template('_deployment.yml', `${appName}/${appName}-deployment.yml`);
                this.template('_service.yml', `${appName}/${appName}-service.yml`);
                // If we choose microservice with no DB, it is trying to move _no.yml as prodDatabaseType is getting tagged as 'string' type
                if (this.app.prodDatabaseType !== 'no') {
                    this.template(`db/_${this.app.prodDatabaseType}.yml`, `${appName}/${appName}-${this.app.prodDatabaseType}.yml`);
                }
                if (this.app.searchEngine === 'elasticsearch') {
                    this.template('db/_elasticsearch.yml', `${appName}/${appName}-elasticsearch.yml`);
                }
                if (this.app.messageBroker === 'kafka') {
                    this.template('db/_kafka.yml', `${appName}/${appName}-kafka.yml`);
                }
                if ((this.app.applicationType === 'gateway' || this.app.applicationType === 'monolith') && this.kubernetesServiceType === 'Ingress') {
                    this.template('_ingress.yml', `${appName}/${appName}-ingress.yml`);
                }
                if (this.prometheusOperator) {
                    this.template('_prometheus.yml', `${appName}/${appName}-prometheus.yml`);
                }
            }
        },

        writeReadme() {
            this.template('_README-KUBERNETES.md', 'README.md');
        },

        writeNamespace() {
            if (this.kubernetesNamespace !== 'default') {
                this.template('_namespace.yml', 'namespace.yml');
            }
        },

        writeJhipsterConsole() {
            if (this.jhipsterConsole) {
                this.template('console/_logstash-config.yml', 'console/logstash-config.yml');
                this.template('console/_jhipster-elasticsearch.yml', 'console/jhipster-elasticsearch.yml');
                this.template('console/_jhipster-logstash.yml', 'console/jhipster-logstash.yml');
                this.template('console/_jhipster-console.yml', 'console/jhipster-console.yml');
            }
        },

        writePrometheusTpr() {
            if (this.prometheusOperator) {
                this.template('_prometheus-tpr.yml', 'prometheus-tpr.yml');
            }
        },

        writeRegistryFiles() {
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('registry/_jhipster-registry.yml', 'registry/jhipster-registry.yml');
                this.template('registry/_application-configmap.yml', 'registry/application-configmap.yml');
            } else if (this.serviceDiscoveryType === 'consul') {
                this.template('registry/_consul.yml', 'registry/consul.yml');
                this.template('registry/_consul-config-loader.yml', 'registry/consul-config-loader.yml');
                this.template('registry/_application-configmap.yml', 'registry/application-configmap.yml');
            }
        }
    };
}
