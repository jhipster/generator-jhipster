import { mutateData, normalizePathEnd, pickFields } from '../../base/support/index.js';

import {
  databaseTypes,
  monitoringTypes,
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  websocketTypes,
  serviceDiscoveryTypes,
  searchEngineTypes,
} from '../../../jdl/jhipster/index.js';
import { prepareSqlApplicationProperties } from '../../spring-data-relational/support/index.js';
import {
  CLIENT_DIST_DIR,
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
} from '../../generator-constants.js';
import { MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_NO, MESSAGE_BROKER_PULSAR } from '../../server/options/index.js';
import { PlatformApplication } from '../../base-application/types.js';

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
export const loadServerConfig = ({ config, application }: { config: any; application: any }) => {
  mutateData(
    application,
    {
      srcMainJava: SERVER_MAIN_SRC_DIR,
      srcMainResources: SERVER_MAIN_RES_DIR,
      srcMainWebapp: CLIENT_MAIN_SRC_DIR,
      srcTestJava: SERVER_TEST_SRC_DIR,
      srcTestResources: SERVER_TEST_RES_DIR,
      srcTestJavascript: CLIENT_TEST_SRC_DIR,
    },
    pickFields(config, [
      'packageName',
      'packageFolder',
      'serverPort',
      'buildTool',
      'databaseType',
      'databaseMigration',
      'devDatabaseType',
      'prodDatabaseType',
      'incrementalChangelog',
      'reactive',
      'searchEngine',
      'cacheProvider',
      'enableHibernateCache',
      'serviceDiscoveryType',
      'enableSwaggerCodegen',
      'messageBroker',
      'websocket',
      'embeddableLaunchScript',
      'enableGradleEnterprise',
      'gradleEnterpriseHost',
      'feignClient',
    ]),
    {
      packageFolder: ({ packageFolder }) => (packageFolder ? normalizePathEnd(packageFolder) : packageFolder),
      gradleEnterpriseHost: ({ gradleEnterpriseHost }) =>
        !gradleEnterpriseHost || gradleEnterpriseHost.startsWith('https://') ? gradleEnterpriseHost : `https://${gradleEnterpriseHost}`,
    },
  );
};

/**
 * @param {Object} config - config to load config from
 * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
 */
export const loadPlatformConfig = ({ config, application }: { config: any; application: PlatformApplication }) => {
  mutateData(application, pickFields(config, ['serviceDiscoveryType', 'monitoring']));
};

export const loadDerivedServerAndPlatformProperties = ({ application }: { application: any }) => {
  if (!application.serviceDiscoveryType) {
    application.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
  }
  application.serviceDiscoveryAny = application.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
  application.serviceDiscoveryConsul = application.serviceDiscoveryType === CONSUL;
  application.serviceDiscoveryEureka = application.serviceDiscoveryType === EUREKA;
};

/**
 * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
 * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
 */
export const loadDerivedPlatformConfig = ({ application }: { application: PlatformApplication }) => {
  application.monitoringElk = application.monitoring === ELK;
  application.monitoringPrometheus = application.monitoring === PROMETHEUS;
  loadDerivedServerAndPlatformProperties({ application });
};

/**
 * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
 */
export const loadDerivedServerConfig = ({ application }: { application: any }) => {
  application.prodDatabaseTypePostgresql = undefined;
  application.prodDatabaseTypeMssql = undefined;
  application.devDatabaseTypeH2Any = undefined;
  application.prodDatabaseTypeMariadb = undefined;

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

  mutateData(application, {
    packageFolder: ({ packageName }) => `${packageName.replace(/\./g, '/')}/`,
    javaPackageSrcDir: ({ srcMainJava, packageFolder }) => normalizePathEnd(`${srcMainJava}${packageFolder}`),
    javaPackageTestDir: ({ srcTestJava, packageFolder }) => normalizePathEnd(`${srcTestJava}${packageFolder}`),

    temporaryDir: ({ buildToolGradle }) => (buildToolGradle ? 'build/' : 'target/'),
    clientDistDir: ({ temporaryDir, buildToolGradle }) =>
      `${temporaryDir}${buildToolGradle ? 'resources/main/' : 'classes/'}${CLIENT_DIST_DIR}`,

    authenticationUsesCsrf: ({ authenticationType }) => [OAUTH2, SESSION].includes(authenticationType),
    imperativeOrReactive: ({ reactive }) => (reactive ? 'reactive' : 'imperative'),
  });

  if (application.databaseTypeSql) {
    prepareSqlApplicationProperties({ application });
  }

  loadDerivedServerAndPlatformProperties({ application });
};
