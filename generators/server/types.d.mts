import { JavaApplication } from '../java/types.mjs';
import { GradleSourceType } from '../gradle/types.mjs';
import { MavenSourceType } from '../maven/types.mjs';
import { LiquibaseSourceType } from '../liquibase/types.mjs';
import { SpringCacheSourceType } from '../spring-cache/types.mjs';
import { MessageBrokerApplicationType } from './options/message-broker.mjs';
import type { DeterministicOptionWithDerivedProperties, OptionWithDerivedProperties } from '../base-application/application-options.mjs';

export type SpringBootSourceType = GradleSourceType &
  MavenSourceType &
  SpringCacheSourceType &
  LiquibaseSourceType & {
    addTestSpringFactory?({ key, value }: { key: string; value: string }): void;
    addLogbackMainLog?({ name, level }: { name: string; level: string }): void;
    addLogbackTestLog?({ name, level }: { name: string; level: string }): void;
    addIntegrationTestAnnotation?({ package, annotation }: { package?: string; annotation: string }): void;
  };

type CacheProviderApplication = OptionWithDerivedProperties<
  'cacheProvider',
  ['no', 'caffeine', 'ehcache', 'hazelcast', 'infinispan', 'memcached', 'redis']
>;

type ImperativeApplication = {
  reactive: false;
};

type ReactiveApplication = {
  reactive: true;
};

export type LiquibaseApplication = {
  incrementalChangelog: boolean;
  liquibaseDefaultSchemaName: string;
};

type DatabaseTypeSqlApplication = (
  | ReactiveApplication
  | (ImperativeApplication & {
      enableHibernateCache: boolean;
    })
) & {
  devDatabaseType: string;
  prodDatabaseType: string;
  devDatabaseTypeMysql: boolean;
} & LiquibaseApplication;

type DatabaseTypeApplication = DeterministicOptionWithDerivedProperties<
  'databaseType',
  ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j'],
  [DatabaseTypeSqlApplication]
>;

type BuildToolApplication = DeterministicOptionWithDerivedProperties<
  'buildTool',
  ['maven', 'gradle'],
  [
    Record<string, never>,
    {
      enableGradleEnterprise: boolean;
    }
  ]
>;

type SearchEngine = {
  searchEngine: string;
};

type ApplicatonNature = (ImperativeApplication & CacheProviderApplication) | ReactiveApplication;

export type SpringBootApplication = JavaApplication &
  ApplicatonNature &
  BuildToolApplication &
  SearchEngine &
  DatabaseTypeApplication &
  MessageBrokerApplicationType & {
    dockerContainers: Record<string, string>;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;

    imperativeOrReactive: string;

    databaseMigration: string;
    databaseMigrationLiquibase: boolean;
  };
