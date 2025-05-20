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
import { applicationTypes, authenticationTypes, monitoringTypes } from '../../lib/jhipster/index.js';

const { PROMETHEUS } = monitoringTypes;
const { MICROSERVICE } = applicationTypes;
const { OAUTH2 } = authenticationTypes;

export function writeFiles() {
  return {
    cleanup({ control }) {
      if (control.isJhipsterVersionLessThan('7.10.0')) {
        this.removeFile('realm-config/jhipster-users-0.json');
      }
    },

    writeDockerCompose({ deployment }) {
      this.writeFile('docker-compose.yml.ejs', 'docker-compose.yml', deployment);
      this.writeFile('README-DOCKER-COMPOSE.md.ejs', 'README-DOCKER-COMPOSE.md', deployment);
    },

    writeRegistryFiles({ deployment }) {
      if (deployment.serviceDiscoveryAny) {
        this.writeFile('central-server-config/application.yml.ejs', 'central-server-config/application.yml', deployment);
      }
    },

    writeKeycloakFiles({ deployment }) {
      if (deployment.authenticationType === OAUTH2 && deployment.applicationType !== MICROSERVICE) {
        this.writeFile('realm-config/keycloak-health-check.sh', 'realm-config/keycloak-health-check.sh', deployment);
        this.writeFile('realm-config/jhipster-realm.json.ejs', 'realm-config/jhipster-realm.json', deployment);
      }
    },

    writePrometheusFiles({ deployment }) {
      if (deployment.monitoring !== PROMETHEUS) return;

      this.writeFile('prometheus-conf/prometheus.yml.ejs', 'prometheus-conf/prometheus.yml', deployment);
      this.writeFile('prometheus-conf/alert_rules.yml.ejs', 'prometheus-conf/alert_rules.yml', deployment);
      this.writeFile('alertmanager-conf/config.yml.ejs', 'alertmanager-conf/config.yml', deployment);
    },
  };
}
