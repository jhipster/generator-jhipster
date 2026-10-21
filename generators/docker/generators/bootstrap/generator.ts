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
import BaseSimpleApplicationGenerator from '../../../base-simple-application/index.ts';
import { mutateApplicationLoading, mutateApplicationPreparing } from '../../application.ts';
import { DOCKER_COMPOSE_SOURCES_DIR, SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from '../../constants.ts';
import { createDockerDeploymentServices, mergeDockerComposeFile } from '../../support/index.ts';
import type {
  Application as DockerApplication,
  Config as DockerConfig,
  DockerComposeServiceConfig,
  Options as DockerOptions,
  Source as DockerSource,
} from '../../types.ts';

import {
  type DockerComposeApplication,
  addDockerComposeFile,
  applicationEnvironment,
  springBootIgnore,
} from './internal/docker-compose-files.ts';

export default class BootstrapGenerator extends BaseSimpleApplicationGenerator<
  DockerApplication,
  DockerConfig,
  DockerOptions,
  DockerSource
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-simple-application');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults(mutateApplicationLoading);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ applicationDefaults }) {
        applicationDefaults(mutateApplicationPreparing);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get default() {
    return this.asDefaultTaskGroup({
      // The files are added once every generator prepared the application: their static parts are in the templates.
      sqlDatabase({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.databaseTypeSql) return;
        const { baseName, lowercaseBaseName, prodDatabasePassword: password, dockerContainers } = app;
        if (app.prodDatabaseTypePostgresql) {
          addDockerComposeFile(app, 'postgresql', {
            postgresql: {
              image: dockerContainers.postgresql,
              environment: [`POSTGRES_USER=${baseName}`, ...(password ? [`POSTGRES_PASSWORD=${password}`] : [])],
            },
          });
        } else if (app.prodDatabaseTypeMysql) {
          addDockerComposeFile(app, 'mysql', {
            mysql: {
              image: dockerContainers.mysql,
              environment: [`MYSQL_DATABASE=${lowercaseBaseName}`, ...(password ? [`MYSQL_PASSWORD=${password}`] : [])],
            },
          });
        } else if (app.prodDatabaseTypeMariadb) {
          addDockerComposeFile(app, 'mariadb', {
            mariadb: {
              image: dockerContainers.mariadb,
              environment: [`MARIADB_DATABASE=${lowercaseBaseName}`, ...(password ? [`MARIADB_PASSWORD=${password}`] : [])],
              ...springBootIgnore(app.backendTypeSpringBoot && app.reactive),
            },
          });
        } else if (app.prodDatabaseTypeMssql) {
          addDockerComposeFile(app, 'mssql', { mssql: { image: dockerContainers.mssql, environment: [`MSSQL_DATABASE=${baseName}`] } });
        }
      },
      mongodb({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.databaseTypeMongodb) return;
        const { lowercaseBaseName } = app;
        const image = app.dockerContainers.mongodb;
        addDockerComposeFile(app, 'mongodb', { mongodb: { image } });
        addDockerComposeFile(app, 'mongodb-cluster', {
          mongodb: { image, command: `mongos --configdb csvr/${lowercaseBaseName}-mongodb-config --bind_ip 0.0.0.0` },
          'mongodb-config': { image, container_name: `${lowercaseBaseName}-mongodb-config` },
        });
      },
      cassandra({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.databaseTypeCassandra) return;
        const { dockerContainers, databaseMigrationLoader, backendTypeSpringBoot } = app;
        const contactPoint = `${app.lowercaseBaseName}-cassandra`;
        // The service that applies the cql scripts of the application, with the cql loader.
        const migration: DockerComposeServiceConfig = {
          environment: [
            `CASSANDRA_CONTACT_POINT=${contactPoint}`,
            'USER=docker-cassandra-migration',
            'CREATE_KEYSPACE_SCRIPT=create-keyspace-prod.cql',
          ],
          build: { context: '.', dockerfile: 'cassandra/Cassandra-Migration.Dockerfile' },
          volumes: ['../resources/config/cql:/cql:ro'],
        };
        addDockerComposeFile(app, 'cassandra', {
          cassandra: { image: dockerContainers.cassandra, container_name: contactPoint, ...springBootIgnore(backendTypeSpringBoot) },
          ...(databaseMigrationLoader ? { 'cassandra-migration': { ...migration, ...springBootIgnore(backendTypeSpringBoot) } } : {}),
        });
        addDockerComposeFile(app, 'cassandra-cluster', {
          cassandra: { container_name: contactPoint, image: dockerContainers.cassandra },
          'cassandra-node': { image: dockerContainers.cassandra, environment: [`CASSANDRA_SEEDS=${contactPoint}`] },
          ...(databaseMigrationLoader ? { 'cassandra-migration': migration } : {}),
        });
        if (databaseMigrationLoader) {
          addDockerComposeFile(app, 'cassandra-migration', {
            'cassandra-migration': { environment: [`CASSANDRA_CONTACT_POINT=${contactPoint}`] },
          });
        }
      },
      couchbase({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.databaseTypeCouchbase) return;
        const { baseName, lowercaseBaseName } = app;
        addDockerComposeFile(app, 'couchbase', { couchbase: { environment: [`BUCKET=${baseName}`] } });
        addDockerComposeFile(app, 'couchbase-cluster', {
          couchbase: { environment: [`BUCKET=${baseName}`] },
          'couchbase-node': {
            environment: [`BUCKET=${baseName}`, `COUCHBASE_MASTER=${lowercaseBaseName}-couchbase`, 'AUTO_REBALANCE=false'],
          },
        });
      },
      neo4j({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.databaseTypeNeo4j) return;
        addDockerComposeFile(app, 'neo4j', { neo4j: { image: app.dockerContainers.neo4j } });
      },
      elasticsearch({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.searchEngineElasticsearch) return;
        addDockerComposeFile(app, 'elasticsearch', { elasticsearch: { image: app.dockerContainers.elasticsearch } });
      },
      cache({ application }) {
        const app = application as DockerComposeApplication;
        if (app.cacheProviderMemcached) {
          addDockerComposeFile(app, 'memcached', {
            memcached: { image: app.dockerContainers.memcached, ...springBootIgnore(app.backendTypeSpringBoot) },
          });
        }
        if (app.cacheProviderRedis) {
          addDockerComposeFile(app, 'redis', { redis: { image: app.dockerContainers.redis } });
        }
      },
      app({ application }) {
        const app = application as DockerComposeApplication;
        if (!app.backendTypeSpringBoot && !app.dockerServices.includes('app')) return;
        const { lowercaseBaseName, serverPort, dockerApplicationEnvironment } = app;
        // The services the application waits for, in the order the docker generator added them to the `app` file.
        const dependencies: [string, unknown, string][] = [
          ['cassandra', app.databaseTypeCassandra, SERVICE_HEALTHY],
          ['cassandra-migration', app.databaseTypeCassandra && app.databaseMigrationLoader, SERVICE_COMPLETED_SUCCESSFULLY],
          [
            app.prodDatabaseType,
            app.databaseTypeSql &&
              (app.prodDatabaseTypePostgresql || app.prodDatabaseTypeMysql || app.prodDatabaseTypeMariadb || app.prodDatabaseTypeMssql),
            SERVICE_HEALTHY,
          ],
          ['couchbase', app.databaseTypeCouchbase, SERVICE_HEALTHY],
          ['mongodb', app.databaseTypeMongodb, SERVICE_HEALTHY],
          ['neo4j', app.databaseTypeNeo4j, SERVICE_HEALTHY],
          ['elasticsearch', app.searchEngineElasticsearch, SERVICE_HEALTHY],
          ['keycloak', app.authenticationTypeOauth2, SERVICE_HEALTHY],
          ['jhipster-registry', app.serviceDiscoveryEureka, SERVICE_HEALTHY],
        ];
        const dependsOn = Object.fromEntries(
          dependencies.filter(([, enabled]) => enabled).map(([serviceName, , condition]) => [serviceName, { condition }]),
        );
        addDockerComposeFile(app, 'app', {
          app: {
            image: lowercaseBaseName,
            environment: applicationEnvironment(app, dockerApplicationEnvironment, ''),
            ...(app.applicationTypeMonolith || app.applicationTypeGateway ? { ports: [`127.0.0.1:${serverPort}:${serverPort}`] } : {}),
            healthcheck: {
              test: [
                'CMD-SHELL',
                String.raw`bash -c 'exec 3<>/dev/tcp/127.0.0.1/${serverPort}; printf "GET /management/health HTTP/1.0\r\nHost: localhost\r\n\r\n" >&3; grep -q "\"status\":\"UP\"" <&3'`,
              ],
              interval: '5s',
              timeout: '5s',
              retries: 40,
            },
            ...(Object.keys(dependsOn).length > 0 ? { depends_on: dependsOn } : {}),
          },
        });
      },
      deploymentServices({ application }) {
        const app = application as DockerComposeApplication;
        const { dockerComposeFiles, dockerDeploymentServicePrefix: servicePrefix } = app;
        // The services of the application, the other ones (like keycloak) being shared by the applications of a deployment.
        const serviceNames = new Set(Object.values(dockerComposeFiles).flatMap(({ data }) => Object.keys(data.services ?? {})));
        const deploymentEnvironment = applicationEnvironment(
          app,
          { ...app.dockerApplicationEnvironment, ...app.dockerDeploymentEnvironment },
          servicePrefix,
        );
        for (const file of Object.values(dockerComposeFiles)) {
          const { data } = file;
          const deploymentData =
            data.services?.app ?
              { ...data, services: { ...data.services, app: { ...data.services.app, environment: deploymentEnvironment } } }
            : data;
          const { services } = mergeDockerComposeFile(
            { ...file, data: deploymentData },
            this.fs.read(this.fetchFromInstalledJHipster(DOCKER_COMPOSE_SOURCES_DIR, file.source)),
          );
          file.deploymentServices = createDockerDeploymentServices(services, {
            applicationServiceName: app.lowercaseBaseName,
            servicePrefix,
            isApplicationService: serviceName => serviceNames.has(serviceName),
          });
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
