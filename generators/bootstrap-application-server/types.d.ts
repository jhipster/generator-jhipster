import type { OptionalGenericDerivedProperty, GenericDerivedProperty } from '../../types/application';
import type { ClientServerApplication } from '../bootstrap-application-client-server/types';

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

type DatabaseTypeSqlApplication = OptionalGenericDerivedProperty<DatabaseType, 'sql'> &
  (
    | ReactiveApplication
    | (ImperativeApplication & {
        enableHibernateCache: boolean;
      })
  ) & {
    devDatabaseType: string;
    prodDatabaseType: string;
  };

type DatabaseTypeApplication =
  | DatabaseTypeSqlApplication
  | OptionalGenericDerivedProperty<DatabaseType, 'no'>
  | OptionalGenericDerivedProperty<DatabaseType, 'cassandra'>
  | OptionalGenericDerivedProperty<DatabaseType, 'couchbase'>
  | OptionalGenericDerivedProperty<DatabaseType, 'mongodb'>
  | OptionalGenericDerivedProperty<DatabaseType, 'neo4j'>;

type BuildTool = {
  buildTool: 'maven' | 'gradle';
};

type BuildToolGradleApplication = GenericDerivedProperty<BuildTool, 'gradle'> & {
  enableGradleEnterprise: boolean;
};

type SearchEngine = {
  searchEngine: string;
};

export type SpringBootApplication = ClientServerApplication &
  (ImperativeApplication | ReactiveApplication) &
  (GenericDerivedProperty<BuildTool, 'maven'> | BuildToolGradleApplication) &
  SearchEngine &
  DatabaseTypeApplication & {
    packageName: string;
    packageFolder: string;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    prettierJava: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;
  };
