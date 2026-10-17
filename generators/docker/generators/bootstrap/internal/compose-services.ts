/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type { Application as SpringDataRelationalApplication } from '../../../../spring-boot/generators/data-relational/index.ts';
import type { Application as SpringBootApplication } from '../../../../spring-boot/index.ts';
import { addDockerComposeFile, dockerComposeLocalPorts } from '../../../support/index.ts';
import type { Application as DockerApplication } from '../../../types.ts';

/** An application with docker compose files: its docker data and the backend choices its services depend on. */
export type DockerComposeApplication = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

/** The postgresql database of the application. */
export const addPostgresqlDockerComposeFile = (application: DockerComposeApplication) => {
  if (!application.databaseTypeSql || !application.prodDatabaseTypePostgresql) return;
  const { baseName, dockerContainers, prodDatabasePassword } = application;
  addDockerComposeFile(application, 'postgresql', {
    postgresql: {
      image: dockerContainers.postgresql,
      environment: [
        `POSTGRES_USER=${baseName}`,
        ...(prodDatabasePassword ? [`POSTGRES_PASSWORD=${prodDatabasePassword}`] : []),
        'POSTGRES_HOST_AUTH_METHOD=trust',
      ],
      // The variable of the container, escaped for docker compose.
      // eslint-disable-next-line no-template-curly-in-string
      healthcheck: { test: ['CMD-SHELL', 'pg_isready -U $${POSTGRES_USER}'], interval: '5s', timeout: '5s', retries: 10 },
      ports: dockerComposeLocalPorts(5432),
    },
  });
};

/** The redis cache of the application. */
export const addRedisDockerComposeFile = (application: DockerComposeApplication) => {
  if (!application.cacheProviderRedis) return;
  addDockerComposeFile(application, 'redis', {
    redis: { image: application.dockerContainers.redis, ports: dockerComposeLocalPorts(6379) },
  });
};
