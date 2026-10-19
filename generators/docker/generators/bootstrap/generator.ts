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
import type { Application as SpringDataRelationalApplication } from '../../../spring-boot/generators/data-relational/index.ts';
import type { Application as SpringBootApplication } from '../../../spring-boot/index.ts';
import { mutateApplicationLoading, mutateApplicationPreparing } from '../../application.ts';
import { SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from '../../constants.ts';
import type {
  Application as DockerApplication,
  Config as DockerConfig,
  DockerComposeServiceConfig,
  Options as DockerOptions,
  Source as DockerSource,
} from '../../types.ts';

/** An application with docker compose files: its docker data and the backend choices its services depend on. */
type DockerComposeApplication = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

/**
 * Adds a docker compose file to the application: its template, named after it, and the data merged into it, with the
 * project name of the application.
 */
const addDockerComposeFile = (
  application: DockerComposeApplication,
  name: string,
  services: Record<string, DockerComposeServiceConfig>,
) => {
  application.dockerComposeFiles[name] = {
    source: `${name}.yml.ejs`,
    data: { name: application.baseName.toLowerCase(), services },
  };
};

/** Spring Boot docker compose support ignores the service. */
const springBootIgnore = (ignore: boolean | undefined): DockerComposeServiceConfig =>
  ignore ? { labels: { 'org.springframework.boot.ignore': true } } : {};

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
        const { baseName, prodDatabasePassword: password, dockerContainers } = app;
        const lowercaseBaseName = baseName.toLowerCase();
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
        const image = app.dockerContainers.mongodb;
        const lowercaseBaseName = app.baseName.toLowerCase();
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
        const contactPoint = `${app.baseName.toLowerCase()}-cassandra`;
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
        const { baseName } = app;
        addDockerComposeFile(app, 'couchbase', { couchbase: { environment: [`BUCKET=${baseName}`] } });
        addDockerComposeFile(app, 'couchbase-cluster', {
          couchbase: { environment: [`BUCKET=${baseName}`] },
          'couchbase-node': {
            environment: [`BUCKET=${baseName}`, `COUCHBASE_MASTER=${baseName.toLowerCase()}-couchbase`, 'AUTO_REBALANCE=false'],
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
        const { baseName, serverPort, dockerApplicationEnvironment } = app;
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
            image: baseName.toLowerCase(),
            environment: [
              ...Object.entries(dockerApplicationEnvironment).map(([key, value]) => `${key}=${value ?? ''}`),
              ...(app.cacheProviderMemcached ? ['JHIPSTER_CACHE_MEMCACHED_SERVERS=memcached:11211'] : []),
              ...(app.cacheProviderRedis ? ['JHIPSTER_CACHE_REDIS_SERVER=redis://redis:6379', 'JHIPSTER_CACHE_REDIS_CLUSTER=false'] : []),
              ...(app.searchEngineElasticsearch ? ['SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200'] : []),
              ...(app.messageBrokerKafka ? ['SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=kafka:9092'] : []),
              ...(app.messageBrokerPulsar ?
                ['SPRING_PULSAR_CLIENT_SERVICE_URL=pulsar://pulsar:6650', 'SPRING_PULSAR_ADMINISTRATION_SERVICE_URL=http://pulsar:8080']
              : []),
              ...(app.cacheProviderInfinispan ? ['JAVA_OPTS=-Djgroups.tcp.address=NON_LOOPBACK -Djava.net.preferIPv4Stack=true'] : []),
            ],
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
    });
  }

  get [BaseSimpleApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
