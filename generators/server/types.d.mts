import type { OptionalGenericDerivedProperty, GenericDerivedProperty } from '../base/application.mjs';
import type { CommonClientServerApplication } from '../base-application/types.mjs';
import { JavaApplication } from '../java/types.mjs';

declare const CACHE_PROVIDER = 'cacheProvider';

type CacheProvider = {
  [CACHE_PROVIDER]: 'no' | 'caffeine' | 'ehcache' | 'hazelcast' | 'infinispan' | 'memcached' | 'redis';
};

type CacheProviderApplication = OptionalGenericDerivedProperty<CacheProvider, CacheProvider[typeof CACHE_PROVIDER]>;

type ImperativeApplication = {
  reactive: false;
} & CacheProviderApplication;

type ReactiveApplication = {
  reactive: true;
};

type DatabaseType = {
  databaseType: 'no' | 'sql' | 'cassandra' | 'couchbase' | 'mongodb' | 'neo4j';
};

export type LiquibaseApplication = {
  incrementalChangelog: boolean;
};

type DatabaseTypeSqlApplication = GenericDerivedProperty<DatabaseType, 'sql'> &
  (
    | ReactiveApplication
    | (ImperativeApplication & {
        enableHibernateCache: boolean;
      })
  ) & {
    devDatabaseType: string;
    prodDatabaseType: string;
  } & LiquibaseApplication;

type DatabaseTypeApplication =
  | DatabaseTypeSqlApplication
  | GenericDerivedProperty<DatabaseType, 'no'>
  | GenericDerivedProperty<DatabaseType, 'cassandra'>
  | GenericDerivedProperty<DatabaseType, 'couchbase'>
  | GenericDerivedProperty<DatabaseType, 'mongodb'>
  | GenericDerivedProperty<DatabaseType, 'neo4j'>;

type BuildTool = {
  buildTool: 'maven' | 'gradle';
};

type BuildToolGradleApplication = GenericDerivedProperty<BuildTool, 'gradle'> & {
  enableGradleEnterprise: boolean;
};
type BuildToolApplication = BuildToolGradleApplication | GenericDerivedProperty<BuildTool, 'maven'>;

type SearchEngine = {
  searchEngine: string;
};

export type SpringBootApplication = CommonClientServerApplication &
  JavaApplication &
  (ImperativeApplication | ReactiveApplication) &
  BuildToolApplication &
  SearchEngine &
  DatabaseTypeApplication & {
    dockerContainers: Record<string, string>;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;

    imperativeOrReactive: string;
  };
