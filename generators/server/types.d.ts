import type { JavaApplication, JavaBuildToolApplication, JavaSourceType } from '../java/types.js';
import type { GradleSourceType } from '../gradle/types.js';
import type { MavenSourceType } from '../maven/types.js';
import type { LiquibaseSourceType } from '../liquibase/types.js';
import type { SpringCacheSourceType } from '../spring-cache/types.js';
import type { OptionWithDerivedProperties } from '../base-application/application-options.js';
import type { GatewayApplication } from '../spring-cloud/generators/gateway/types.js';
import type { JavaAnnotation } from '../java/support/add-java-annotation.ts';
import type { ApplicationPropertiesNeedles } from './support/needles.ts';

export type SpringEntity = {
  entitySearchLayer?: boolean;
  /* Generate entity's Entity */
  entityDomainLayer?: boolean;
  /* Generate entity's Repository */
  entityPersistenceLayer?: boolean;
  /* Generate entity's Rest Api */
  entityRestLayer?: boolean;
  entitySpringPreAuthorize?: string;
  entitySpringReadPreAuthorize?: string;
  skipJunitTests?: string;
  entityR2dbcRepository?: boolean;
};

export type ServerEntity = SpringEntity & {
  skipDbChangelog?: boolean;
  entityAbsolutePackage?: string;
};

export type SpringBootSource = JavaSourceType & {
  addTestSpringFactory?({ key, value }: { key: string; value: string }): void;
  addLogbackLogEntry?({ file, name, level }: { file: string; name: string; level: string }): void;
  addLogbackMainLog?({ name, level }: { name: string; level: string }): void;
  addLogbackTestLog?({ name, level }: { name: string; level: string }): void;
  addIntegrationTestAnnotation?(annotation: JavaAnnotation): void;
  addAllowBlockingCallsInside?({ classPath, method }: { classPath: string; method: string }): void;
  addApplicationPropertiesContent?(content: ApplicationPropertiesNeedles): void;
  addApplicationPropertiesProperty?({ propertyName, propertyType }: { propertyName: string; propertyType: string }): void;
  /**
   * @example
   * addApplicationPropertiesClass({
   *   propertyType: 'Liquibase',
   *   classStructure: { enabled: ['PropertyType', '"default value"'], asyncStart: 'PropertyTypeOnly' },
   * });
   */
  addApplicationPropertiesClass?(opts: {
    propertyName?: string;
    propertyType: string;
    classStructure: Record<string, string | string[]>;
  }): void;
  addNativeHint?(hints: {
    advanced?: string[];
    declaredConstructors?: string[];
    resources?: string[];
    publicConstructors?: string[];
  }): void;
  /**
   * Injects a document into the application.yml file using '---' document separator.
   *
   * @example
   * addApplicationYamlDocument(`
   * spring:
   *  key: value
   * `);
   */
  addApplicationYamlDocument?(document: string): void;
};

export type SpringBootSourceType = GradleSourceType & MavenSourceType & SpringCacheSourceType & LiquibaseSourceType & SpringBootSource;

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

/*
Deterministic option causes types to be too complex
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
 */
type DatabaseTypeSqlApplication = {
  enableHibernateCache: boolean;
} & {
  devDatabaseType: string;
  prodDatabaseType: string;
  devDatabaseTypeMysql: boolean;
  devDatabaseTypeH2Any?: boolean;

  devJdbcUrl?: string;
  devDatabaseUsername?: string;
  devDatabasePassword?: string;
  prodJdbcUrl?: string;
  prodDatabaseUsername?: string;
  prodDatabasePassword?: string;
} & LiquibaseApplication;
/*
Deterministic option causes types to be too complex
type DatabaseTypeApplication = DeterministicOptionWithDerivedProperties<
  'databaseType',
  ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j'],
  [DatabaseTypeSqlApplication]
>;
*/
type DatabaseTypeApplication = DatabaseTypeSqlApplication &
  OptionWithDerivedProperties<'databaseType', ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j']>;

/*
Deterministic option causes types to be too complex
type BuildToolApplication = DeterministicOptionWithDerivedProperties<
  'buildTool',
  ['maven', 'gradle'],
  [
    Record<string, never>,
    {
      enableGradleDevelocity: boolean;
    },
  ]
>;
*/

type SearchEngine = {
  searchEngine: string;
};

/*
Deterministic option causes types to be too complex
type ApplicationNature = (ImperativeApplication & CacheProviderApplication) | ReactiveApplication;
*/
type ApplicationNature = { reactive: boolean };

export type SpringBootApplication = JavaApplication &
  ApplicationNature &
  JavaBuildToolApplication &
  SearchEngine &
  DatabaseTypeApplication &
  GatewayApplication & {
    jhipsterDependenciesVersion: string;
    springBootDependencies: Record<string, string>;

    addSpringMilestoneRepository: boolean;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;
    srcMain: string;
    srcTest: string;
    documentationUrl: string;

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
    anyEntityHasRelationshipWithUser: boolean;
    requiresDeleteAllUsers: boolean;
    reactorBlock: string;
    reactorBlockOptional: string;

    domains: string[];
  };
