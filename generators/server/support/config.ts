import { mutateData, pickFields } from '../../base/support/index.js';

import {
  buildToolTypes,
  cacheTypes,
  databaseTypes,
  monitoringTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
  websocketTypes,
} from '../../../lib/jhipster/index.js';
import { prepareSqlApplicationProperties } from '../../spring-data-relational/support/index.js';
import type { PlatformApplication } from '../../base-application/types.js';

const { NO: NO_DATABASE, SQL, MONGODB, COUCHBASE, NEO4J, CASSANDRA } = databaseTypes;
const { PROMETHEUS, ELK } = monitoringTypes;
const { NO: NO_CACHE, CAFFEINE, EHCACHE, REDIS, HAZELCAST, INFINISPAN, MEMCACHED } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { SPRING_WEBSOCKET } = websocketTypes;
const { NO: NO_SERVICE_DISCOVERY, CONSUL, EUREKA } = serviceDiscoveryTypes;
const { NO: NO_SEARCH_ENGINE, ELASTICSEARCH } = searchEngineTypes;

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

  if (application.databaseTypeSql) {
    prepareSqlApplicationProperties({ application });
  }

  loadDerivedServerAndPlatformProperties({ application });
};
