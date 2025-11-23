import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.ts';
import type { Entity as BaseApplicationEntity, RelationshipWithEntity } from '../base-application/types.ts';
import type { Config as CommonConfig } from '../common/types.d.ts';
import type { JavaAnnotation } from '../java/support/add-java-annotation.ts';
import type {
  Config as JavaConfig,
  Field as JavaField,
  Options as JavaOptions,
  Relationship as JavaRelationship,
  Source as JavaSource,
} from '../java/types.ts';
import type { Application as GradleApplication } from '../java-simple-application/generators/gradle/types.ts';
import type { ApplicationPropertiesNeedles } from '../server/support/needles.ts';
import type {
  Application as ServerApplication,
  Config as ServerConfig,
  Entity as ServerEntity,
  Field as ServerField,
  Options as ServerOptions,
  Relationship as ServerRelationship,
  Source as ServerSource,
} from '../server/types.d.ts';

import type command from './command.ts';
import type springBootDependencies from './resources/spring-boot-dependencies.ts';

type Command = HandleCommandTypes<typeof command>;

export type SpringBootModule = keyof (typeof springBootDependencies)['modules'];

export type Config = Command['Config'] & JavaConfig & ServerConfig & CommonConfig;

export type Options = Command['Options'] & JavaOptions & ServerOptions;

export type SpringEntity = {
  entitySearchLayer?: boolean;
  /* Generate entity's Repository */
  entityPersistenceLayer?: boolean;
  /* Generate entity's Rest Api */
  entityRestLayer?: boolean;
  entitySpringPreAuthorize?: string;
  entitySpringReadPreAuthorize?: string;
  entityR2dbcRepository?: boolean;

  serviceClass: boolean;
  serviceImpl: boolean;
  serviceNo: boolean;

  saveUserSnapshot?: boolean;
};

export type Field = ServerField &
  JavaField & {
    filterableField?: boolean;
    autoGenerateByService?: boolean;
    autoGenerateByRepository?: boolean;
    mapstructExpression?: boolean;

    requiresPersistableImplementation?: boolean;
    fieldNameAsDatabaseColumn?: string;
  };

export interface Relationship extends ServerRelationship, JavaRelationship {}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends ServerEntity<F, R>, SpringEntity {
  skipDbChangelog?: boolean;
  entityJavaFilterableProperties: any[];
  entityJavaCustomFilters: any[];

  isUsingMapsId?: boolean;
  mapsIdAssoc?: R;
  reactiveEagerRelations: RelationshipWithEntity<R, this>[];

  reactiveOtherEntities: Set<this>;
  reactiveUniqueEntityTypes: Set<string>;
}

export type Source = JavaSource &
  ServerSource & {
    addTestSpringFactory?({ key, value }: { key: string; value: string }): void;
    addLogbackLogEntry?({ file, name, level }: { file: string; name: string; level: string }): void;
    addIntegrationTestAnnotation?(annotation: JavaAnnotation): void;
    addAllowBlockingCallsInside?({ classPath, method }: { classPath: string; method: string }): void;
    addApplicationPropertiesContent?(content: ApplicationPropertiesNeedles): void;
    addApplicationPropertiesProperty?({ propertyName, propertyType }: { propertyName: string; propertyType: string }): void;
    /**
     * Add a Spring Boot Module to dependencies.
     */
    addSpringBootModule?(
      ...moduleNames: (SpringBootModule | { condition: boolean; profile?: 'dev' | 'prod'; module: SpringBootModule })[]
    ): void;
    /**
     * Override a property defined in Spring Boot Dependencies POM.
     */
    overrideProperty?({ property, value }: { property: SpringBootModule; value: string }): void;
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
      publicMethods?: string[];
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
  GradleApplication &
  ApplicationNature &
  SearchEngine &
  DatabaseTypeApplication & {
    springBootDependencies: Record<string, string>;

    addSpringMilestoneRepository: boolean;

    enableSwaggerCodegen: boolean;
    skipFakeData: boolean;
    skipCheckLengthOfIdentifier: boolean;

    databaseMigration: string;
    databaseMigrationLiquibase: boolean;

    communicationSpringWebsocket: boolean;
    requiresDeleteAllUsers: boolean;

    springDataDescription: string;
  };
