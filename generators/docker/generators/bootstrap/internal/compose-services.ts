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
import { addDockerComposeApplicationDependency, addDockerComposeFile, dockerComposeLocalPorts } from '../../../support/index.ts';
import type { Application as DockerApplication, DockerComposeServiceConfig } from '../../../types.ts';

/** An application with docker compose files: its docker data and the backend choices its services depend on. */
export type DockerComposeApplication = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

type Application = DockerComposeApplication;

/** Spring Boot docker compose support ignores the service. */
const springBootIgnore = (ignore: boolean | undefined): DockerComposeServiceConfig =>
  ignore ? { labels: { 'org.springframework.boot.ignore': true } } : {};

const sqlDatabaseService = (application: Application): DockerComposeServiceConfig | undefined => {
  const { baseName, prodDatabaseType, dockerContainers } = application;
  const password = application.prodDatabasePassword;
  const lowercaseBaseName = baseName.toLowerCase();
  if (prodDatabaseType === 'postgresql') {
    return {
      image: dockerContainers.postgresql,
      environment: [`POSTGRES_USER=${baseName}`, ...(password ? [`POSTGRES_PASSWORD=${password}`] : []), 'POSTGRES_HOST_AUTH_METHOD=trust'],
      // The variable of the container, escaped for docker compose.
      // eslint-disable-next-line no-template-curly-in-string
      healthcheck: { test: ['CMD-SHELL', 'pg_isready -U $${POSTGRES_USER}'], interval: '5s', timeout: '5s', retries: 10 },
      ports: dockerComposeLocalPorts(5432),
    };
  }
  if (prodDatabaseType === 'mysql') {
    return {
      image: dockerContainers.mysql,
      volumes: ['./config/mysql:/etc/mysql/conf.d:ro'],
      environment: [
        'MYSQL_ALLOW_EMPTY_PASSWORD=yes',
        `MYSQL_DATABASE=${lowercaseBaseName}`,
        ...(password ? [`MYSQL_PASSWORD=${password}`] : []),
      ],
      ports: dockerComposeLocalPorts(3306),
      command: 'mysqld --lower_case_table_names=1 --skip-mysqlx --character_set_server=utf8mb4 --explicit_defaults_for_timestamp',
      healthcheck: { test: ['CMD-SHELL', 'mysql -e "SHOW DATABASES;" && sleep 5'], interval: '5s', timeout: '10s', retries: 10 },
    };
  }
  if (prodDatabaseType === 'mariadb') {
    return {
      image: dockerContainers.mariadb,
      volumes: ['./config/mariadb:/etc/mysql/conf.d:ro'],
      environment: [
        'MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=yes',
        'MARIADB_ALLOW_EMPTY_PASSWORD=yes',
        `MARIADB_DATABASE=${lowercaseBaseName}`,
        ...(password ? [`MARIADB_PASSWORD=${password}`] : []),
      ],
      ports: dockerComposeLocalPorts(3306),
      command: 'mariadbd --lower_case_table_names=1 --character_set_server=utf8mb4 --explicit_defaults_for_timestamp',
      healthcheck: {
        test: ['CMD', '/usr/local/bin/healthcheck.sh', '--connect', '--innodb_initialized'],
        interval: '5s',
        timeout: '5s',
        retries: 10,
      },
      ...springBootIgnore(application.backendTypeSpringBoot && application.reactive),
    };
  }
  if (prodDatabaseType === 'mssql') {
    return {
      image: dockerContainers.mssql,
      environment: [
        'ACCEPT_EULA=Y',
        'MSSQL_PID=Express',
        'MSSQL_SA_PASSWORD=yourStrong(!)Password',
        `MSSQL_DATABASE=${baseName}`,
        'MSSQL_SLEEP=15',
      ],
      ports: dockerComposeLocalPorts(1433),
      command: `/bin/bash -c '/opt/mssql/bin/sqlservr & echo "wait $$MSSQL_SLEEP sec for DB to start "; sleep $$MSSQL_SLEEP; /opt/mssql-tools18/bin/sqlcmd -U sa -P $$MSSQL_SA_PASSWORD -C -d tempdb -q "EXIT(CREATE DATABASE $$MSSQL_DATABASE)"; wait;'`,
      healthcheck: {
        // The variables of the container, escaped for docker compose.
        // eslint-disable-next-line no-template-curly-in-string
        test: '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$${MSSQL_SA_PASSWORD}" -C -Q "USE $${MSSQL_DATABASE}" -b -o /dev/null',
        interval: '10s',
        timeout: '3s',
        retries: 10,
        start_period: '10s',
      },
    };
  }
  return undefined;
};

/** The sql database of the application. */
export const addSqlDatabaseDockerComposeFiles = (application: Application) => {
  const service = application.databaseTypeSql ? sqlDatabaseService(application) : undefined;
  if (!service) return;
  const { prodDatabaseType } = application;
  addDockerComposeFile(application, prodDatabaseType, { [prodDatabaseType]: service });
  addDockerComposeApplicationDependency(application, prodDatabaseType, SERVICE_HEALTHY);
};

/** The mongodb database of the application, and its cluster. */
export const addMongodbDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeMongodb) return;
  const { dockerContainers } = application;
  const lowercaseBaseName = application.baseName.toLowerCase();
  addDockerComposeFile(application, 'mongodb', {
    mongodb: {
      image: dockerContainers.mongodb,
      ports: dockerComposeLocalPorts(27017),
      healthcheck: {
        test: ['CMD', 'echo', '\'db.runCommand("ping").ok\'', '|', 'mongo', 'localhost:27017/test', '--quiet'],
        interval: '5s',
        timeout: '5s',
        retries: 10,
      },
    },
  });
  addDockerComposeFile(application, 'mongodb-cluster', {
    mongodb: {
      image: dockerContainers.mongodb,
      ports: dockerComposeLocalPorts(27017),
      command: `mongos --configdb csvr/${lowercaseBaseName}-mongodb-config --bind_ip 0.0.0.0`,
    },
    'mongodb-node': { build: { context: '.', dockerfile: 'mongodb/MongoDB.Dockerfile' }, command: 'mongod --shardsvr --replSet rs1' },
    'mongodb-config': {
      image: dockerContainers.mongodb,
      container_name: `${lowercaseBaseName}-mongodb-config`,
      command: 'mongod --configsvr --dbpath /data/db --replSet csvr',
    },
  });
  addDockerComposeApplicationDependency(application, 'mongodb', SERVICE_HEALTHY);
};

const cassandraMigration = (application: Application, keyspaceScript: string): DockerComposeServiceConfig => ({
  environment: [
    `CASSANDRA_CONTACT_POINT=${application.baseName.toLowerCase()}-cassandra`,
    'USER=docker-cassandra-migration',
    `CREATE_KEYSPACE_SCRIPT=${keyspaceScript}`,
  ],
  build: { context: '.', dockerfile: 'cassandra/Cassandra-Migration.Dockerfile' },
  volumes: ['../resources/config/cql:/cql:ro'],
});

/** The cassandra database of the application, its cluster and, with the cql loader, its migration. */
export const addCassandraDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeCassandra) return;
  const { dockerContainers, databaseMigrationLoader } = application;
  const lowercaseBaseName = application.baseName.toLowerCase();
  const ports = () => dockerComposeLocalPorts(7000, 7001, 7199, 9042, 9160);
  addDockerComposeFile(application, 'cassandra', {
    cassandra: {
      image: dockerContainers.cassandra,
      container_name: `${lowercaseBaseName}-cassandra`,
      environment: ['MAX_HEAP_SIZE=2G', 'HEAP_NEWSIZE=512M'],
      ports: ports(),
      healthcheck: { test: ['CMD', 'cqlsh', '-e', 'describe keyspaces'], interval: '5s', timeout: '25s', retries: 20 },
      ...springBootIgnore(application.backendTypeSpringBoot),
    },
    ...(databaseMigrationLoader ?
      {
        'cassandra-migration': {
          ...cassandraMigration(application, 'create-keyspace-prod.cql'),
          ...springBootIgnore(application.backendTypeSpringBoot),
        },
      }
    : {}),
  });
  addDockerComposeFile(application, 'cassandra-cluster', {
    cassandra: { container_name: `${lowercaseBaseName}-cassandra`, image: dockerContainers.cassandra, ports: ports() },
    'cassandra-node': { image: dockerContainers.cassandra, environment: [`CASSANDRA_SEEDS=${lowercaseBaseName}-cassandra`] },
    ...(databaseMigrationLoader ? { 'cassandra-migration': cassandraMigration(application, 'create-keyspace-prod.cql') } : {}),
  });
  addDockerComposeApplicationDependency(application, 'cassandra', SERVICE_HEALTHY);
  if (databaseMigrationLoader) {
    addDockerComposeFile(application, 'cassandra-migration', {
      'cassandra-migration': cassandraMigration(application, 'create-keyspace.cql'),
    });
    addDockerComposeApplicationDependency(application, 'cassandra-migration', SERVICE_COMPLETED_SUCCESSFULLY);
  }
};

/** The couchbase database of the application, and its cluster. */
export const addCouchbaseDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeCouchbase) return;
  const { baseName } = application;
  const build = () => ({ context: '.', dockerfile: 'couchbase/Couchbase.Dockerfile' });
  const ports = () => dockerComposeLocalPorts(8091, 8092, 8093, 8094, 11210);
  addDockerComposeFile(application, 'couchbase', {
    couchbase: {
      build: build(),
      ports: ports(),
      environment: [`BUCKET=${baseName}`],
      healthcheck: {
        test: ['CMD-SHELL', 'curl -f "http://localhost:8091/ui/index.html" && sleep 20'],
        interval: '5s',
        timeout: '25s',
        retries: 10,
      },
    },
  });
  addDockerComposeFile(application, 'couchbase-cluster', {
    couchbase: { build: build(), ports: ports(), environment: ['TYPE=MASTER', `BUCKET=${baseName}`] },
    'couchbase-node': {
      build: build(),
      environment: ['TYPE=WORKER', `BUCKET=${baseName}`, `COUCHBASE_MASTER=${baseName.toLowerCase()}-couchbase`, 'AUTO_REBALANCE=false'],
    },
  });
  addDockerComposeApplicationDependency(application, 'couchbase', SERVICE_HEALTHY);
};

/** The neo4j database of the application. */
export const addNeo4jDockerComposeFiles = (application: Application) => {
  if (!application.databaseTypeNeo4j) return;
  addDockerComposeFile(application, 'neo4j', {
    neo4j: {
      image: application.dockerContainers.neo4j,
      environment: ['NEO4J_AUTH=none'],
      ports: dockerComposeLocalPorts(7474, 7687),
      healthcheck: { test: ['CMD', 'wget', 'http://localhost:7474/', '-O', '-'], interval: '5s', timeout: '5s', retries: 10 },
    },
  });
  addDockerComposeApplicationDependency(application, 'neo4j', SERVICE_HEALTHY);
};

/** The elasticsearch search engine of the application. */
export const addElasticsearchDockerComposeFiles = (application: Application) => {
  if (!application.searchEngineElasticsearch) return;
  addDockerComposeFile(application, 'elasticsearch', {
    elasticsearch: {
      image: application.dockerContainers.elasticsearch,
      ports: dockerComposeLocalPorts(9200, 9300),
      environment: ['ES_JAVA_OPTS=-Xms256m -Xmx256m', 'discovery.type=single-node', 'xpack.security.enabled=false'],
      healthcheck: {
        test: ['CMD', 'curl', '-f', 'http://localhost:9200/_cluster/health?wait_for_status=green&timeout=10s'],
        interval: '5s',
        timeout: '10s',
        retries: 10,
      },
    },
  });
  addDockerComposeApplicationDependency(application, 'elasticsearch', SERVICE_HEALTHY);
};

/** The memcached or redis cache of the application. */
export const addCacheDockerComposeFiles = (application: Application) => {
  if (application.cacheProviderMemcached) {
    addDockerComposeFile(application, 'memcached', {
      memcached: {
        image: application.dockerContainers.memcached,
        ports: dockerComposeLocalPorts(11211),
        ...springBootIgnore(application.backendTypeSpringBoot),
      },
    });
  }
  if (application.cacheProviderRedis) {
    addDockerComposeFile(application, 'redis', {
      redis: { image: application.dockerContainers.redis, ports: dockerComposeLocalPorts(6379) },
    });
  }
};

/** The services outside the application it waits for: the identity provider and the registry. */
export const addPlatformDockerComposeDependencies = (application: Application) => {
  if (application.authenticationTypeOauth2) {
    addDockerComposeApplicationDependency(application, 'keycloak', SERVICE_HEALTHY);
  }
  if (application.serviceDiscoveryEureka) {
    addDockerComposeApplicationDependency(application, 'jhipster-registry', SERVICE_HEALTHY);
  }
};
