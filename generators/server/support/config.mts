import { normalizePathEnd } from '../../base/support/index.mjs';

import {
  databaseTypes,
  monitoringTypes,
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  websocketTypes,
  serviceDiscoveryTypes,
  searchEngineTypes,
} from '../../../jdl/jhipster/index.mjs';
import { prepareSqlApplicationProperties } from '../../spring-data-relational/support/index.mjs';
import {
  CLIENT_DIST_DIR,
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
} from '../../generator-constants.mjs';
import { MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_NO, MESSAGE_BROKER_PULSAR } from '../../server/options/index.mjs';
import { SpringBootApplication } from '../types.mjs';
import { PlatformApplication } from '../../base-application/types.mjs';

const { SQL, MONGODB, COUCHBASE, NEO4J, CASSANDRA } = databaseTypes;
const NO_DATABASE = databaseTypes.NO;
const { PROMETHEUS, ELK } = monitoringTypes;
const { OAUTH2, SESSION } = authenticationTypes;
const { CAFFEINE, EHCACHE, REDIS, HAZELCAST, INFINISPAN, MEMCACHED } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { SPRING_WEBSOCKET } = websocketTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const NO_CACHE = cacheTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_SEARCH_ENGINE = searchEngineTypes.NO;

/**
 * Load server configs into application.
 * all variables should be set to dest,
 * all variables should be referred from config,
 */
export const loadServerConfig = ({ config, application }: { config: any; application: SpringBootApplication }) => {
  application.packageName = config.packageName;
  application.packageFolder = config.packageFolder && normalizePathEnd(config.packageFolder);
  (application as any).serverPort = config.serverPort;

  application.srcMainJava = SERVER_MAIN_SRC_DIR;
  application.srcMainResources = SERVER_MAIN_RES_DIR;
  application.srcMainWebapp = CLIENT_MAIN_SRC_DIR;
  application.srcTestJava = SERVER_TEST_SRC_DIR;
  application.srcTestResources = SERVER_TEST_RES_DIR;
  application.srcTestJavascript = CLIENT_TEST_SRC_DIR;

  application.buildTool = config.buildTool;

  application.databaseType = config.databaseType;
  application.databaseMigration = config.databaseMigration;
  application.devDatabaseType = config.devDatabaseType;
  application.prodDatabaseType = config.prodDatabaseType;
  application.incrementalChangelog = config.incrementalChangelog;
  application.reactive = config.reactive;
  application.searchEngine = config.searchEngine;
  (application as any).cacheProvider = config.cacheProvider;
  (application as any).enableHibernateCache = config.enableHibernateCache;
  (application as any).serviceDiscoveryType = config.serviceDiscoveryType;

  application.enableSwaggerCodegen = config.enableSwaggerCodegen;
  application.messageBroker = config.messageBroker;
  (application as any).websocket = config.websocket;
  application.embeddableLaunchScript = config.embeddableLaunchScript;

  application.enableGradleEnterprise = config.enableGradleEnterprise;

  if (config.gradleEnterpriseHost) {
    if (config.gradleEnterpriseHost.startsWith('https://')) {
      (application as any).gradleEnterpriseHost = config.gradleEnterpriseHost;
    } else {
      (application as any).gradleEnterpriseHost = `https://${config.gradleEnterpriseHost}`;
    }
  }
};

/**
 * @param {Object} config - config to load config from
 * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
 */
export const loadPlatformConfig = ({ config, application }: { config: any; application: PlatformApplication }) => {
  application.serviceDiscoveryType = config.serviceDiscoveryType;
  application.monitoring = config.monitoring;
};

/**
 * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
 * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
 */
export const loadDerivedPlatformConfig = ({ application }: { application: PlatformApplication }) => {
  application.monitoringElk = application.monitoring === ELK;
  application.monitoringPrometheus = application.monitoring === PROMETHEUS;
};

export const loadServerAndPlatformConfig = ({ application }: { application: any }) => {
  if (!application.serviceDiscoveryType) {
    application.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
  }
  application.serviceDiscoveryAny = application.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
  application.serviceDiscoveryConsul = application.serviceDiscoveryType === CONSUL;
  application.serviceDiscoveryEureka = application.serviceDiscoveryType === EUREKA;
};

/**
 * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
 */
export const loadDerivedServerConfig = ({ application }: { application: any }) => {
  if (!application.packageFolder) {
    application.packageFolder = `${application.packageName.replace(/\./g, '/')}/`;
  }

  application.prodDatabaseTypePostgres = undefined;
  application.prodDatabaseTypeMssql = undefined;
  application.devDatabaseTypeH2Any = undefined;
  application.prodDatabaseTypeMariadb = undefined;

  application.javaPackageSrcDir = normalizePathEnd(`${application.srcMainJava}${application.packageFolder}`);
  application.javaPackageTestDir = normalizePathEnd(`${application.srcTestJava}${application.packageFolder}`);

  application.communicationSpringWebsocket = application.websocket === SPRING_WEBSOCKET;

  if (!application.searchEngine) {
    application.searchEngine = NO_SEARCH_ENGINE;
  }
  application.searchEngineNo = application.searchEngine === NO_SEARCH_ENGINE;
  application.searchEngineAny = !application.searchEngineNo;
  application.searchEngineCouchbase = application.searchEngine === COUCHBASE;
  application.searchEngineElasticsearch = application.searchEngine === ELASTICSEARCH;

  if (!application.messageBroker) {
    application.messageBroker = MESSAGE_BROKER_NO;
  }
  application.messageBrokerKafka = application.messageBroker === MESSAGE_BROKER_KAFKA;
  application.messageBrokerPulsar = application.messageBroker === MESSAGE_BROKER_PULSAR;
  application.messageBrokerAny = application.messageBroker && application.messageBroker !== MESSAGE_BROKER_NO;

  application.buildToolGradle = application.buildTool === GRADLE;
  application.buildToolMaven = application.buildTool === MAVEN;
  application.buildToolUnknown = !application.buildToolGradle && !application.buildToolMaven;

  application.temporaryDir = application.buildToolGradle ? 'build/' : 'target/';
  const buildDestinationDir = `${application.temporaryDir}${application.buildToolGradle ? 'resources/main/' : 'classes/'}`;
  application.clientDistDir = `${buildDestinationDir}${CLIENT_DIST_DIR}`;

  application.cacheProviderNo = !application.cacheProvider || application.cacheProvider === NO_CACHE;
  application.cacheProviderCaffeine = application.cacheProvider === CAFFEINE;
  application.cacheProviderEhcache = application.cacheProvider === EHCACHE;
  application.cacheProviderHazelcast = application.cacheProvider === HAZELCAST;
  application.cacheProviderInfinispan = application.cacheProvider === INFINISPAN;
  application.cacheProviderMemcached = application.cacheProvider === MEMCACHED;
  application.cacheProviderRedis = application.cacheProvider === REDIS;
  application.cacheProviderAny = application.cacheProvider && application.cacheProvider !== NO_CACHE;

  application.databaseTypeNo = application.databaseType === NO_DATABASE;
  application.databaseTypeSql = application.databaseType === SQL;
  application.databaseTypeCassandra = application.databaseType === CASSANDRA;
  application.databaseTypeCouchbase = application.databaseType === COUCHBASE;
  application.databaseTypeMongodb = application.databaseType === MONGODB;
  application.databaseTypeNeo4j = application.databaseType === NEO4J;
  application.databaseTypeAny = !application.databaseTypeNo;

  application.databaseMigrationLiquibase = application.databaseMigration
    ? application.databaseMigration === 'liquibase'
    : application.databaseType === SQL;

  application.imperativeOrReactive = application.reactive ? 'reactive' : 'imperative';

  application.authenticationUsesCsrf = [OAUTH2, SESSION].includes(application.authenticationType);

  if (application.databaseTypeSql) {
    prepareSqlApplicationProperties({ application });
  }

  loadServerAndPlatformConfig({ application });
};
