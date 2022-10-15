import type { OptionalGenericDerivedProperty, GenericDerivedProperty } from '../base/application.js';
import type { CommonClientServerApplication } from '../bootstrap-application-base/types.js';

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

export type LiquibaseApplication = DatabaseTypeSqlApplication & {
  incrementalChangelog: boolean;
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

export type SpringBootApplication = CommonClientServerApplication &
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

    buildDir: string;

    javaDependencies: Record<string, string>;
    dockerContainers: Record<string, string>;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    prettierJava: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;
  };
