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

type DatabaseTypeSqlApplication = GenericDerivedProperty<DatabaseType, 'sql'> &
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

export type SpringBootApplication = ClientServerApplication &
  (ImperativeApplication | ReactiveApplication) &
  BuildToolApplication &
  SearchEngine &
  DatabaseTypeApplication & {
    packageName: string;
    packageFolder: string;

    srcMainJava: string;
    srcMainResources: string;
    srcMainWebapp: string;
    srcTestJava: string;
    srcTestResources: string;
    srcTestJavascript: string;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    prettierJava: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;
  };
