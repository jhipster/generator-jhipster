import { JavaApplication, JavaSourceType } from '../java/types.js';
import { GradleSourceType } from '../gradle/types.js';
import { MavenSourceType } from '../maven/types.js';
import { LiquibaseSourceType } from '../liquibase/types.js';
import { SpringCacheSourceType } from '../spring-cache/types.js';
import type { DeterministicOptionWithDerivedProperties, OptionWithDerivedProperties } from '../base-application/application-options.js';
import { GatewayApplication } from '../spring-cloud/generators/gateway/types.js';
import { JavaAnnotation } from '../java/support/add-java-annotation.ts';
import { ApplicationPropertiesNeedles } from './support/needles.ts';
import { MessageBrokerApplicationType } from './options/message-broker.js';

export type SpringEntity = {
  /* Generate entity's Entity */
  entityDomainLayer?: boolean;
  /* Generate entity's Repository */
  entityPersistenceLayer?: boolean;
  /* Generate entity's Rest Api */
  entityRestLayer?: boolean;
  entitySpringPreAuthorize?: string;
  entitySpringReadPreAuthorize?: string;
  skipJunitTests?: string;
};

export type SpringBootSourceType = JavaSourceType &
  GradleSourceType &
  MavenSourceType &
  SpringCacheSourceType &
  LiquibaseSourceType & {
    addTestSpringFactory?({ key, value }: { key: string; value: string }): void;
    addLogbackLogEntry?({ file, name, level }: { file: string; name: string; level: string }): void;
    addLogbackMainLog?({ name, level }: { name: string; level: string }): void;
    addLogbackTestLog?({ name, level }: { name: string; level: string }): void;
    addIntegrationTestAnnotation?(annotation: JavaAnnotation): void;
    addAllowBlockingCallsInside?({ classPath, method }: { classPath: string; method: string }): void;
    addApplicationPropertiesContent?(content: ApplicationPropertiesNeedles): void;
    addApplicationPropertiesProperty?({ propertyName, propertyType }: { propertyName: string; propertyType: string }): void;
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
    },
  ]
>;

type SearchEngine = {
  searchEngine: string;
};

type ApplicationNature = (ImperativeApplication & CacheProviderApplication) | ReactiveApplication;

export type SpringBootApplication = JavaApplication &
  ApplicationNature &
  BuildToolApplication &
  SearchEngine &
  DatabaseTypeApplication &
  GatewayApplication &
  MessageBrokerApplicationType & {
    jhipsterDependenciesVersion: string;
    springBootDependencies: Record<string, string>;
    dockerContainers: Record<string, string>;

    addSpringMilestoneRepository: boolean;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;

    imperativeOrReactive: string;
    optionalOrMono: string;
    optionalOrMonoOfNullable: string;
    listOrFlux: string;
    optionalOrMonoClassPath: string;
    wrapMono: (className: string) => string;
    listOrFluxClassPath: string;

    generateAuthenticationApi?: boolean;
    generateInMemoryUserCredentials?: boolean;

    databaseMigration: string;
    databaseMigrationLiquibase: boolean;

    communicationSpringWebsocket: boolean;
    requiresDeleteAllUsers: boolean;
    reactorBlock: string;
    reactorBlockOptional: string;
  };
