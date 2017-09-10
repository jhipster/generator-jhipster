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
        writeDockerCompose() {
            this.template('_docker-compose.yml', 'docker-compose.yml');
            this.template('_README-DOCKER-COMPOSE.md', 'README-DOCKER-COMPOSE.md');
        },

        writeRegistryFiles() {
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('_jhipster-registry.yml', 'jhipster-registry.yml');
            }
            if (this.serviceDiscoveryType) {
                this.template('central-server-config/_application.yml', 'central-server-config/application.yml');
            }
            if (this.gatewayNb === 0 && this.microserviceNb === 0) return;
            if (this.serviceDiscoveryType === 'consul') {
                this.template('_consul.yml', 'consul.yml');
            }
        },

        writeKafkaFiles() {
            if (!this.useKafka) return;

            this.template('_kafka.yml', 'kafka.yml');
        },

        writeElkFiles() {
            if (this.monitoring !== 'elk') return;

            this.template('_jhipster-console.yml', 'jhipster-console.yml');
            this.template('log-conf/_logstash.conf', 'log-conf/logstash.conf');
            this.template('log-data/_.gitignore', 'log-data/.gitignore');
        },

        writePrometheusFiles() {
            if (this.monitoring !== 'prometheus') return;

            // Generate a list of target apps to monitor for the prometheus config
            const appsToMonitor = [];
            for (let i = 0; i < this.appConfigs.length; i++) {
                appsToMonitor.push(`             - ${this.appConfigs[i].baseName}-app:${this.appConfigs[i].serverPort}`);
            }

            // Format the application target list as a YAML array
            this.appsToMonitorList = appsToMonitor.join('\n').replace(/'/g, '');

            this.template('_prometheus.yml', 'prometheus.yml');
            this.template('prometheus-conf/_prometheus.yml', 'prometheus-conf/prometheus.yml');
            this.template('prometheus-conf/_alert.rules', 'prometheus-conf/alert.rules');
            this.template('alertmanager-conf/_config.yml', 'alertmanager-conf/config.yml');
        }
    };
}
