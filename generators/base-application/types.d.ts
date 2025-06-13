import type { DerivedPropertiesOnlyOf } from '../../lib/command/types.js';
import type { Entity as BaseEntity } from '../../lib/jhipster/types/entity.js';
import type { Field as BaseField } from '../../lib/jhipster/types/field.js';
import type { FieldType } from '../../lib/jhipster/field-types.js';
import type { Relationship as BaseRelationship } from '../../lib/jhipster/types/relationship.js';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
} from '../base-simple-application/index.ts';
import type { ApplicationOptions } from './application-options-all.js';
import type { OptionWithDerivedProperties } from './internal/types/application-options.js';
import type { FakerWithRandexp } from './support/faker.ts';

export type Config = BaseSimpleApplicationConfig & {
  entities?: string[];
  backendType?: string;
};

export type Options = BaseSimpleApplicationOptions & ApplicationOptions;

export type { Features } from '../base-simple-application/types.js';
export type { Source } from '../base-simple-application/types.js';

type Property = {
  propertyName: string;

  propertyNameCapitalized?: string;
  propertyNameUpperSnakeCase?: string;
  propertyApiDescription?: string;

  skipClient?: boolean;
  skipServer?: boolean;
};

export type Field = Property &
  BaseField &
  DerivedPropertiesOnlyOf<'fieldType', 'Boolean'> & {
    documentation?: string;

    enumFileName?: string;
    enumValues?: { name: string; value: string }[];
    fieldIsEnum?: boolean;

    // Validation
    fieldValidate?: boolean;
    unique?: boolean;
    maxlength?: number;

    generateFakeDataFromPattern?: () => string | undefined;
    /** @deprecated */
    createRandexp: () => any;

    generateFakeData?: (type?: 'csv' | 'cypress' | 'json-serializable' | 'ts') => any;
  };

/**
 * Represents a relationship with an otherRelationship.
 * Interface is used to allow `this` type in the otherRelationship.
 */
export interface Relationship
  extends Property,
    BaseRelationship,
    DerivedPropertiesOnlyOf<'relationship', 'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'> {
  relationshipNameCapitalized: string;
  otherRelationship: this;
  collection: boolean;

  /**
   * A persistable relationship means that the relationship will be updated in the database.
   */
  persistableRelationship: boolean;

  id?: boolean;
  ownerSide?: boolean;
  relationshipEagerLoad?: boolean;
  relationshipRequired?: boolean;
}

/**
 * Represents a relationship with an otherEntity, where the relationship is extended with the other entity.
 * Utility type to workaround https://github.com/Microsoft/TypeScript/issues/24364.
 */
export type RelationshipWithEntity<R, E> = R & {
  otherEntity: E;
};

export type PrimaryKey<F extends Field = Field> = {
  name: string;
  fields: F[];
  derivedFields: F[];
  type: FieldType;
  composite: boolean;
  derived: boolean;
  javaValueGenerator?: string;
  javaBuildSpecification?: string;

  tsSampleValues?: (string | number)[];
  javaSampleValues?: string[];
};

/**
 * Represents an entity with its relationships, where the relationships are extended with the other entity.
 * Interface is used to allow `this` type in the relationships.
 */
export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends Omit<Required<BaseEntity<F>>, 'relationships'> {
  relationships: RelationshipWithEntity<R, this>[];
  otherRelationships: R[];

  primaryKey?: PrimaryKey<F>;

  changelogDateForRecent: any;

  entityAuthority?: string;
  entityReadAuthority?: string;

  /** @experimental */
  auditableEntity?: boolean;
  builtIn?: boolean;
  builtInUser?: boolean;
  builtInUserManagement?: boolean;
  builtInAuthority?: boolean;
  adminEntity?: boolean;
  hasCyclicRequiredRelationship?: boolean;

  entityNameCapitalized: string;
  entityNamePlural: string;
  entityNamePluralizedAndSpinalCased: string;
  entityInstancePlural: string;
  entityInstance: string;

  // TODO rename to entityNameHumanized
  entityClassHumanized: string;
  // TODO rename to entityNamePluralHumanized
  entityClassPluralHumanized: string;

  resetFakerSeed(suffix?: string): void;
  generateFakeData?: (type?: any) => any;
  faker: FakerWithRandexp;
}

/* ApplicationType Start */
type MicroservicesArchitectureApplication = {
  microfrontend: boolean;
  gatewayServerPort: number;
};

type GatewayApplication = MicroservicesArchitectureApplication & {
  microfrontends: string[];
};

/*
Deterministic option causes types to be too complex
type ApplicationType = DeterministicOptionWithDerivedProperties<
  'applicationType',
  ['monolith', 'gateway', 'microservice'],
  [Record<string, never>, GatewayApplication, MicroservicesArchitectureApplication]
>;
*/
type ApplicationProperties = OptionWithDerivedProperties<'applicationType', ['monolith', 'gateway', 'microservice']> &
  GatewayApplication &
  MicroservicesArchitectureApplication;

/* ApplicationType End */

/* AuthenticationType Start */
/*
Deterministic option causes types to be too complex
type UserManagement =
  | {
      skipUserManagement: true;
      generateUserManagement: false;
      generateBuiltInUserEntity?: false;
      generateBuiltInAuthorityEntity: false;
    }
  | {
      skipUserManagement: false;
      generateBuiltInUserEntity?: boolean;
      generateUserManagement: true;
      user: any;
      userManagement: any;
      generateBuiltInAuthorityEntity: boolean;
      authority: any;
    };
    */
type UserManagement<Entity> = {
  skipUserManagement: boolean;
  generateUserManagement: boolean;
  generateBuiltInUserEntity?: boolean;
  generateBuiltInAuthorityEntity: boolean;
  user: Entity;
  userManagement: Entity;
  authority: Entity;
};

type JwtApplication = {
  jwtSecretKey: string;
};

type Oauth2Application = {
  syncUserWithIdp?: boolean;
};

type SessionApplication = {
  rememberMeKey: string;
};

/*
Deterministic option causes types to be too complex
type AuthenticationType = DeterministicOptionWithDerivedProperties<
  'authenticationType',
  ['jwt', 'oauth2', 'session'],
  [JwtApplication, Oauth2Application, SessionApplication]
>;
*/
type AuthenticationProperties<Entity> = OptionWithDerivedProperties<'authenticationType', ['jwt', 'oauth2', 'session']> &
  UserManagement<Entity> &
  JwtApplication &
  Oauth2Application &
  SessionApplication;

export type Application<E extends Entity> = BaseSimpleApplicationApplication &
  ApplicationProperties &
  AuthenticationProperties<E> & {
    jhiPrefix: string;
    jhiPrefixCapitalized: string;
    jhiPrefixDashed: string;

    javaNodeBuildPaths: string[];

    clientRootDir: string;
    clientSrcDir: string;
    clientTestDir?: string;
    clientDistDir?: string;

    hipsterName?: string;
    hipsterProductName?: string;
    hipsterHomePageProductName?: string;
    hipsterStackOverflowProductName?: string;
    hipsterBugTrackerProductName?: string;
    hipsterChatProductName?: string;
    hipsterTwitterUsername?: string;
    hipsterDocumentationLink?: string;
    hipsterTwitterLink?: string;
    hipsterProjectLink?: string;
    hipsterStackoverflowLink?: string;
    hipsterBugTrackerLink?: string;
    hipsterChatLink?: string;

    pages: string[];

    devServerPort: number;
    serverPort: number;
    backendType?: string;
    backendTypeJavaAny?: boolean;
    backendTypeSpringBoot?: boolean;
    temporaryDir?: string;

    prettierFolders?: string;
    prettierExtensions?: string;

    loginRegex?: string;
    jsLoginRegex?: string;

    entitySuffix: string;
    dtoSuffix: string;

    skipCommitHook: boolean;
    fakerSeed?: string;

    /* @deprecated use nodePackageManager */
    clientPackageManager: string;

    skipClient?: boolean;
    skipServer?: boolean;
    monorepository?: boolean;

    blueprints?: { name: string; version: string }[];
    testFrameworks?: string[];

    /**
     * True if the application has at least one non-builtin entity.
     */
    hasNonBuiltInEntity?: boolean;
  };
