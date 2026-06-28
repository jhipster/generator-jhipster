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

const deploymentTestSamples = {
  '01-gateway': {
    applicationType: 'gateway',
    baseName: 'jhgate',
    prodDatabaseType: 'mysql',
    serverPort: 8080,
  },
  '02-mysql': {
    applicationType: 'microservice',
    baseName: 'msmysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serverPort: 8081,
  },
  '03-psql': {
    applicationType: 'microservice',
    baseName: 'mspsql',
    prodDatabaseType: 'postgresql',
    searchEngine: 'elasticsearch',
    serverPort: 8081,
  },
  '04-mongo': {
    applicationType: 'microservice',
    baseName: 'msmongodb',
    databaseType: 'mongodb',
    serverPort: 8081,
  },
  '05-cassandra': {
    applicationType: 'microservice',
    baseName: 'mscassandra',
    databaseType: 'cassandra',
    serverPort: 8081,
  },
  '07-mariadb': {
    applicationType: 'microservice',
    baseName: 'msmariadb',
    prodDatabaseType: 'mariadb',
    serverPort: 8081,
  },
  '08-monolith': {
    applicationType: 'monolith',
    baseName: 'sampleMysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    searchEngine: 'elasticsearch',
    serverPort: 8080,
    authenticationType: 'session',
  },
  '09-kafka': {
    applicationType: 'monolith',
    baseName: 'sampleKafka',
    prodDatabaseType: 'mysql',
    serverPort: 8080,
    messageBroker: 'kafka',
    authenticationType: 'session',
  },
  '10-couchbase': {
    applicationType: 'microservice',
    baseName: 'mscouchbase',
    databaseType: 'couchbase',
    prodDatabaseType: 'couchbase',
    serverPort: 8081,
  },
  '11-mssql': {
    applicationType: 'microservice',
    baseName: 'msmssqldb',
    databaseType: 'sql',
    prodDatabaseType: 'mssql',
    serverPort: 8081,
  },
  '12-oracle': {
    applicationType: 'monolith',
    baseName: 'oracle-mono',
    databaseType: 'sql',
    prodDatabaseType: 'oracle',
    serverPort: 8080,
    skipClient: true,
  },
};

export default deploymentTestSamples;
