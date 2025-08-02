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
import { APPLICATION_TYPE_MICROSERVICE } from '../../lib/core/application-types.ts';
import { authenticationTypes, monitoringTypes } from '../../lib/jhipster/index.ts';
import { asWriteFilesSection } from '../base-application/support/index.ts';
import { asWritingWorkspacesTask } from '../base-workspaces/support/task-type-inference.ts';

const { PROMETHEUS } = monitoringTypes;
const { OAUTH2 } = authenticationTypes;

export const files = asWriteFilesSection({
  dockerCompose: [
    {
      templates: ['docker-compose.yml', 'README-DOCKER-COMPOSE.md'],
    },
  ],
  registry: [
    {
      condition: deployment => deployment.serviceDiscoveryAny,
      templates: ['central-server-config/application.yml'],
    },
  ],
  keycloak: [
    {
      condition: deployment => deployment.authenticationType === OAUTH2 && deployment.applicationType !== APPLICATION_TYPE_MICROSERVICE,
      templates: ['realm-config/keycloak-health-check.sh', 'realm-config/jhipster-realm.json'],
    },
  ],
  prometheus: [
    {
      condition: deployment => deployment.monitoring === PROMETHEUS,
      templates: ['prometheus-conf/prometheus.yml', 'prometheus-conf/alert_rules.yml', 'alertmanager-conf/config.yml'],
    },
  ],
});

export const writeFiles = asWritingWorkspacesTask(async function writeFiles({ deployment }) {
  await this.writeFiles({
    sections: files,
    context: deployment,
  });
});
