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
import { SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from '../../../constants.ts';
import type { Application as DockerApplication, DockerComposeServiceConfig } from '../../../types.ts';

/** An application with docker compose files: its docker data and the backend choices its services depend on. */
export type DockerComposeApplication = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

type Application = DockerComposeApplication;

/**
 * Adds a docker compose file to the application: its template, named after it, and the data merged into it, with the
 * project name of the application.
 */
const addDockerComposeFile = (application: Application, name: string, services: Record<string, DockerComposeServiceConfig>) => {
  application.dockerComposeFiles[name] = {
    source: `${name}.yml.ejs`,
    data: { name: application.baseName.toLowerCase(), services },
  };
};

/** Spring Boot docker compose support ignores the service. */
const springBootIgnore = (ignore: boolean | undefined): DockerComposeServiceConfig =>
  ignore ? { labels: { 'org.springframework.boot.ignore': true } } : {};

/** The sql database of the application. */
export const addSqlDatabaseDockerComposeFile = (application: Application) => {
  if (!application.databaseTypeSql) return;
  const { baseName, prodDatabaseType, prodDatabasePassword: password, dockerContainers } = application;
  const lowercaseBaseName = baseName.toLowerCase();
  if (application.prodDatabaseTypePostgresql) {
    addDockerComposeFile(application, 'postgresql', {
      postgresql: {
        image: dockerContainers.postgresql,
        environment: [`POSTGRES_USER=${baseName}`, ...(password ? [`POSTGRES_PASSWORD=${password}`] : [])],
      },
    });
  } else if (application.prodDatabaseTypeMysql) {
    addDockerComposeFile(application, 'mysql', {
      mysql: {
        image: dockerContainers.mysql,
        environment: [`MYSQL_DATABASE=${lowercaseBaseName}`, ...(password ? [`MYSQL_PASSWORD=${password}`] : [])],
      },
    });
  } else if (application.prodDatabaseTypeMariadb) {
    addDockerComposeFile(application, 'mariadb', {
      mariadb: {
        image: dockerContainers.mariadb,
        environment: [`MARIADB_DATABASE=${lowercaseBaseName}`, ...(password ? [`MARIADB_PASSWORD=${password}`] : [])],
        ...springBootIgnore(application.backendTypeSpringBoot && application.reactive),
      },
    });
  } else if (application.prodDatabaseTypeMssql) {
    addDockerComposeFile(application, prodDatabaseType, {
      mssql: { image: dockerContainers.mssql, environment: [`MSSQL_DATABASE=${baseName}`] },
    });
  }
};

/** The mongodb database of the application, and its cluster. */
export const addMongodbDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeMongodb) return;
  const { dockerContainers } = application;
  const lowercaseBaseName = application.baseName.toLowerCase();
  addDockerComposeFile(application, 'mongodb', { mongodb: { image: dockerContainers.mongodb } });
  addDockerComposeFile(application, 'mongodb-cluster', {
    mongodb: { image: dockerContainers.mongodb, command: `mongos --configdb csvr/${lowercaseBaseName}-mongodb-config --bind_ip 0.0.0.0` },
    'mongodb-config': { image: dockerContainers.mongodb, container_name: `${lowercaseBaseName}-mongodb-config` },
  });
};

/** The service that applies the cql scripts of the application, with the cql loader. */
const cassandraMigration = (application: Application): DockerComposeServiceConfig => ({
  environment: [
    `CASSANDRA_CONTACT_POINT=${application.baseName.toLowerCase()}-cassandra`,
    'USER=docker-cassandra-migration',
    'CREATE_KEYSPACE_SCRIPT=create-keyspace-prod.cql',
  ],
  build: { context: '.', dockerfile: 'cassandra/Cassandra-Migration.Dockerfile' },
  volumes: ['../resources/config/cql:/cql:ro'],
});

/** The cassandra database of the application, its cluster and, with the cql loader, its migration. */
export const addCassandraDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeCassandra) return;
  const { dockerContainers, databaseMigrationLoader, backendTypeSpringBoot } = application;
  const lowercaseBaseName = application.baseName.toLowerCase();
  addDockerComposeFile(application, 'cassandra', {
    cassandra: {
      image: dockerContainers.cassandra,
      container_name: `${lowercaseBaseName}-cassandra`,
      ...springBootIgnore(backendTypeSpringBoot),
    },
    ...(databaseMigrationLoader ?
      { 'cassandra-migration': { ...cassandraMigration(application), ...springBootIgnore(backendTypeSpringBoot) } }
    : {}),
  });
  addDockerComposeFile(application, 'cassandra-cluster', {
    cassandra: { container_name: `${lowercaseBaseName}-cassandra`, image: dockerContainers.cassandra },
    'cassandra-node': { image: dockerContainers.cassandra, environment: [`CASSANDRA_SEEDS=${lowercaseBaseName}-cassandra`] },
    ...(databaseMigrationLoader ? { 'cassandra-migration': cassandraMigration(application) } : {}),
  });
  if (databaseMigrationLoader) {
    addDockerComposeFile(application, 'cassandra-migration', {
      'cassandra-migration': { environment: [`CASSANDRA_CONTACT_POINT=${lowercaseBaseName}-cassandra`] },
    });
  }
};

/** The couchbase database of the application, and its cluster. */
export const addCouchbaseDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeCouchbase) return;
  const { baseName } = application;
  addDockerComposeFile(application, 'couchbase', { couchbase: { environment: [`BUCKET=${baseName}`] } });
  addDockerComposeFile(application, 'couchbase-cluster', {
    couchbase: { environment: [`BUCKET=${baseName}`] },
    'couchbase-node': {
      environment: [`BUCKET=${baseName}`, `COUCHBASE_MASTER=${baseName.toLowerCase()}-couchbase`, 'AUTO_REBALANCE=false'],
    },
  });
};

/** The neo4j database of the application. */
export const addNeo4jDockerComposeFile = (application: Application) => {
  if (!application.databaseTypeNeo4j) return;
  addDockerComposeFile(application, 'neo4j', { neo4j: { image: application.dockerContainers.neo4j } });
};

/** The elasticsearch search engine of the application. */
export const addElasticsearchDockerComposeFile = (application: Application) => {
  if (!application.searchEngineElasticsearch) return;
  addDockerComposeFile(application, 'elasticsearch', { elasticsearch: { image: application.dockerContainers.elasticsearch } });
};

/** The memcached or redis cache of the application. */
export const addCacheDockerComposeFiles = (application: Application) => {
  if (application.cacheProviderMemcached) {
    addDockerComposeFile(application, 'memcached', {
      memcached: { image: application.dockerContainers.memcached, ...springBootIgnore(application.backendTypeSpringBoot) },
    });
  }
  if (application.cacheProviderRedis) {
    addDockerComposeFile(application, 'redis', { redis: { image: application.dockerContainers.redis } });
  }
};

/** The services the application waits for, in the order the docker generator adds them to the `app` file. */
const applicationDependencies = (application: Application): Record<string, { condition: string }> => {
  const dependencies: [string, string][] = [];
  if (application.databaseTypeCassandra) {
    dependencies.push(['cassandra', SERVICE_HEALTHY]);
    if (application.databaseMigrationLoader) {
      dependencies.push(['cassandra-migration', SERVICE_COMPLETED_SUCCESSFULLY]);
    }
  }
  if (
    application.databaseTypeSql &&
    (application.prodDatabaseTypePostgresql ||
      application.prodDatabaseTypeMysql ||
      application.prodDatabaseTypeMariadb ||
      application.prodDatabaseTypeMssql)
  ) {
    dependencies.push([application.prodDatabaseType, SERVICE_HEALTHY]);
  }
  for (const [serviceName, enabled] of [
    ['couchbase', application.databaseTypeCouchbase],
    ['mongodb', application.databaseTypeMongodb],
    ['neo4j', application.databaseTypeNeo4j],
    ['elasticsearch', application.searchEngineElasticsearch],
    ['keycloak', application.authenticationTypeOauth2],
  ] as const) {
    if (enabled) {
      dependencies.push([serviceName, SERVICE_HEALTHY]);
    }
  }
  if (application.serviceDiscoveryEureka) {
    dependencies.push(['jhipster-registry', SERVICE_HEALTHY]);
  }
  return Object.fromEntries(dependencies.map(([serviceName, condition]) => [serviceName, { condition }]));
};

/** The `app` file of a Spring Boot application, or of an application with an `app` docker service: its container. */
export const addApplicationDockerComposeFile = (application: Application) => {
  if (!application.backendTypeSpringBoot && !application.dockerServices.includes('app')) return;
  const { baseName, serverPort, dockerApplicationEnvironment } = application;
  const dependsOn = applicationDependencies(application);
  addDockerComposeFile(application, 'app', {
    app: {
      image: baseName.toLowerCase(),
      environment: [
        ...Object.entries(dockerApplicationEnvironment).map(([key, value]) => `${key}=${value ?? ''}`),
        ...(application.cacheProviderMemcached ? ['JHIPSTER_CACHE_MEMCACHED_SERVERS=memcached:11211'] : []),
        ...(application.cacheProviderRedis ? ['JHIPSTER_CACHE_REDIS_SERVER=redis://redis:6379', 'JHIPSTER_CACHE_REDIS_CLUSTER=false'] : []),
        ...(application.searchEngineElasticsearch ? ['SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200'] : []),
        ...(application.messageBrokerKafka ? ['SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=kafka:9092'] : []),
        ...(application.messageBrokerPulsar ?
          ['SPRING_PULSAR_CLIENT_SERVICE_URL=pulsar://pulsar:6650', 'SPRING_PULSAR_ADMINISTRATION_SERVICE_URL=http://pulsar:8080']
        : []),
        ...(application.cacheProviderInfinispan ? ['JAVA_OPTS=-Djgroups.tcp.address=NON_LOOPBACK -Djava.net.preferIPv4Stack=true'] : []),
      ],
      ...(application.applicationTypeMonolith || application.applicationTypeGateway ?
        { ports: [`127.0.0.1:${serverPort}:${serverPort}`] }
      : {}),
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
};
