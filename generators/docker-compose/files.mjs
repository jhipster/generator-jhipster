/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { applicationTypes, authenticationTypes, monitoringTypes } from '../../jdl/jhipster/index.mjs';

const { PROMETHEUS } = monitoringTypes;
const { MICROSERVICE } = applicationTypes;
const { OAUTH2 } = authenticationTypes;

// eslint-disable-next-line import/prefer-default-export
export function writeFiles() {
  return {
    cleanup() {
      this.removeFile('realm-config/jhipster-users-0.json');
    },

    writeDockerCompose() {
      this.writeFile('docker-compose.yml.ejs', 'docker-compose.yml');
      this.writeFile('README-DOCKER-COMPOSE.md.ejs', 'README-DOCKER-COMPOSE.md');
    },

    writeRegistryFiles() {
      if (this.serviceDiscoveryAny) {
        this.writeFile('central-server-config/application.yml.ejs', 'central-server-config/application.yml');
      }
    },

    writeKeycloakFiles() {
      if (this.authenticationType === OAUTH2 && this.applicationType !== MICROSERVICE) {
        this.writeFile('realm-config/jhipster-realm.json.ejs', 'realm-config/jhipster-realm.json');
      }
    },

    writePrometheusFiles() {
      if (this.monitoring !== PROMETHEUS) return;

      // Generate a list of target apps to monitor for the prometheus config
      const appsToMonitor = [];
      for (let i = 0; i < this.appConfigs.length; i++) {
        appsToMonitor.push(`        - ${this.appConfigs[i].baseName}:${this.appConfigs[i].composePort}`);
      }

      // Format the application target list as a YAML array
      this.appsToMonitorList = appsToMonitor.join('\n').replace(/'/g, '');

      this.writeFile('prometheus-conf/prometheus.yml.ejs', 'prometheus-conf/prometheus.yml');
      this.writeFile('prometheus-conf/alert_rules.yml.ejs', 'prometheus-conf/alert_rules.yml');
      this.writeFile('alertmanager-conf/config.yml.ejs', 'alertmanager-conf/config.yml');
    },
  };
}
