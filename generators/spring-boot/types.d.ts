import type {
  Config as JavaConfig,
  Field as JavaField,
  Options as JavaOptions,
  Relationship as JavaRelationship,
  Source as JavaSource,
} from '../java/types.js';
import type { Entity as BaseApplicationEntity } from '../base-application/types.js';
import type { Config as CommonConfig } from '../common/index.js';
import type {
  Application as ServerApplication,
  Entity as ServerEntity,
  Field as ServerField,
  Relationship as ServerRelationship,
} from '../server/index.js';
import type { Application as GradleApplication } from '../gradle/types.js';
import type { JavaAnnotation } from '../java/support/add-java-annotation.ts';
import type { ApplicationPropertiesNeedles } from '../server/support/needles.ts';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.js';
import type { HandleCommandTypes } from '../../lib/command/types.js';
import type command from './command.js';

type Command = HandleCommandTypes<typeof command>;

export type Config = Command['Config'] & JavaConfig & CommonConfig;

export type Options = Command['Options'] & JavaOptions;

export type SpringEntity = {
  entitySearchLayer?: boolean;
  /* Generate entity's Repository */
  entityPersistenceLayer?: boolean;
  /* Generate entity's Rest Api */
  entityRestLayer?: boolean;
  entitySpringPreAuthorize?: string;
  entitySpringReadPreAuthorize?: string;
  entityR2dbcRepository?: boolean;
};

export type Field = ServerField &
  JavaField & {
    filterableField?: boolean;
  };

export interface Relationship extends ServerRelationship, JavaRelationship {}

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = ServerEntity<F, R> &
  SpringEntity & {
    skipDbChangelog?: boolean;
    entityJavaFilterableProperties: any[];
    entityJavaCustomFilters: any[];
  };

export type Source = JavaSource & {
  addTestSpringFactory?({ key, value }: { key: string; value: string }): void;
  addLogbackLogEntry?({ file, name, level }: { file: string; name: string; level: string }): void;
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

type ImperativeApplication = {
  reactive: false;
};

type ReactiveApplication = {
  reactive: true;
};

type DatabaseTypeApplication = OptionWithDerivedProperties<'databaseType', ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j']>;

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

export type Application<E extends BaseApplicationEntity = Entity> = Command['Application'] &
  ServerApplication<E> &
  GradleApplication<E> &
  ApplicationNature &
  SearchEngine &
  DatabaseTypeApplication & {
    jhipsterDependenciesVersion: string;
    springBootDependencies: Record<string, string>;

    addSpringMilestoneRepository: boolean;

    enableSwaggerCodegen: boolean;
    embeddableLaunchScript: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;

    generateAuthenticationApi?: boolean;
    generateInMemoryUserCredentials?: boolean;

    databaseMigration: string;
    databaseMigrationLiquibase: boolean;

    communicationSpringWebsocket: boolean;
    requiresDeleteAllUsers: boolean;
  };
