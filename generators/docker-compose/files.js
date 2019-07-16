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
        writeDockerCompose() {
            this.template('docker-compose.yml.ejs', 'docker-compose.yml');
            this.template('README-DOCKER-COMPOSE.md.ejs', 'README-DOCKER-COMPOSE.md');
        },

        writeRegistryFiles() {
            if (this.serviceDiscoveryType === 'eureka') {
                this.template('jhipster-registry.yml.ejs', 'jhipster-registry.yml');
            }
            if (this.serviceDiscoveryType) {
                this.template('central-server-config/application.yml.ejs', 'central-server-config/application.yml');
            }
            if (this.gatewayNb === 0 && this.microserviceNb === 0) return;
            if (this.serviceDiscoveryType === 'consul') {
                this.template('consul.yml.ejs', 'consul.yml');
            }
        },

        writeTraefikFiles() {
            if (this.gatewayType !== 'traefik') return;
            this.template('traefik.yml.ejs', 'traefik.yml');
            this.template('traefik/traefik.toml.ejs', 'traefik/traefik.toml');
        },

        writeKafkaFiles() {
            if (!this.useKafka) return;

            this.template('kafka.yml.ejs', 'kafka.yml');
        },

        writeKeycloakFiles() {
            if (this.authenticationType === 'oauth2' && this.applicationType !== 'microservice') {
                this.template('keycloak.yml.ejs', 'keycloak.yml');
                this.template('realm-config/jhipster-realm.json.ejs', 'realm-config/jhipster-realm.json');
                this.template('realm-config/jhipster-users-0.json.ejs', 'realm-config/jhipster-users-0.json');
            }
        },

        writeElkFiles() {
            if (this.monitoring !== 'elk') return;

            this.template('jhipster-console.yml.ejs', 'jhipster-console.yml');
            this.template('log-conf/logstash.conf.ejs', 'log-conf/logstash.conf');
            this.template('log-data/.gitignore.ejs', 'log-data/.gitignore');
        },

        writePrometheusFiles() {
            if (this.monitoring !== 'prometheus') return;

            // Generate a list of target apps to monitor for the prometheus config
            const appsToMonitor = [];
            for (let i = 0; i < this.appConfigs.length; i++) {
                appsToMonitor.push(`        - ${this.appConfigs[i].baseName}-app:${this.appConfigs[i].serverPort}`);
            }

            // Format the application target list as a YAML array
            this.appsToMonitorList = appsToMonitor.join('\n').replace(/'/g, '');

            this.template('prometheus.yml.ejs', 'prometheus.yml');
            this.template('prometheus-conf/prometheus.yml.ejs', 'prometheus-conf/prometheus.yml');
            this.template('prometheus-conf/alert_rules.yml.ejs', 'prometheus-conf/alert_rules.yml');
            this.template('alertmanager-conf/config.yml.ejs', 'alertmanager-conf/config.yml');
        }
    };
}
