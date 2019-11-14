/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

const ApplicationTypes = require('./application_types');
const DatabaseTypes = require('./database_types');

const Options = {
  applicationType: {
    monolith: ApplicationTypes.MONOLITH,
    microservice: ApplicationTypes.MICROSERVICE,
    gateway: ApplicationTypes.GATEWAY,
    uaa: ApplicationTypes.UAA
  },
  authenticationType: {
    jwt: 'jwt',
    oauth2: 'oauth2',
    session: 'session',
    uaa: 'uaa'
  },
  baseName: 'jhipster',
  blueprint: undefined,
  blueprints: [],
  buildTool: {
    maven: 'maven',
    gradle: 'gradle'
  },
  cacheProvider: {
    caffeine: 'caffeine',
    ehcache: 'ehcache',
    hazelcast: 'hazelcast',
    infinispan: 'infinispan',
    memcached: 'memcached',
    redis: 'redis',
    no: 'no'
  },
  clientFramework: {
    angularX: 'angularX',
    angular: 'angular',
    react: 'react',
    vuejs: 'vuejs'
  },
  clientPackageManager: {
    yarn: 'yarn',
    npm: 'npm'
  },
  clientTheme: 'none',
  clientThemeVariant: {
    none: '',
    default: 'primary'
  },
  databaseType: {
    sql: DatabaseTypes.SQL,
    mongodb: DatabaseTypes.MONGODB,
    cassandra: DatabaseTypes.CASSANDRA,
    couchbase: DatabaseTypes.COUCHBASE,
    no: 'no'
  },
  devDatabaseType: {
    // these options + the prod database type
    h2Disk: 'h2Disk',
    h2Memory: 'h2Memory'
  },
  dtoSuffix: 'DTO',
  embeddableLaunchScript: true,
  enableHibernateCache: true,
  enableSwaggerCodegen: false,
  enableTranslation: true,
  entitySuffix: '',
  experimental: false,
  i18n: true,
  installModules: false,
  jhiPrefix: 'jhi',
  jhipsterVersion: '',
  jwtSecretKey: '',
  languages: ['en', 'fr'],
  messageBroker: {
    kafka: 'kafka',
    false: false
  },
  nativeLanguage: 'en',
  npm: true,
  otherModules: [],
  packageName: 'com.mycompany.myapp',
  packageFolder: 'com/mycompany/myapp',
  prodDatabaseType: {
    mysql: DatabaseTypes.MYSQL,
    mariadb: DatabaseTypes.MARIADB,
    postgresql: DatabaseTypes.POSTGRESQL,
    oracle: DatabaseTypes.ORACLE,
    mssql: DatabaseTypes.MSSQL,
    no: 'no'
  },
  reactive: false,
  rememberMeKey: '',
  searchEngine: {
    elasticsearch: 'elasticsearch',
    false: false
  },
  serverPort: '8080',
  serviceDiscoveryType: {
    eureka: 'eureka',
    consul: 'consul',
    no: 'no'
  },
  skipClient: false,
  skipGit: false,
  skipInstall: false,
  skipServer: false,
  skipUserManagement: false,
  testFrameworks: {
    protractor: 'protractor',
    cucumber: 'cucumber',
    gatling: 'gatling'
  },
  uaaBaseName: '../uaa',
  useNpm: true,
  useSass: false,
  websocket: {
    'spring-websocket': 'spring-websocket',
    false: false
  },
  withEntities: false
};

const getType = option => typeof Options[option];

Options.exists = option => getType(option) !== 'undefined';

Options.isType = (option, type) => getType(option) === type;

Options.doesValueExists = (option, value) => {
  if (value === 'no' || value === false) {
    return typeof Options[option].no !== 'undefined' || typeof Options[option].false !== 'undefined';
  }
  return typeof Options[option][value] !== 'undefined';
};

module.exports = Options;
