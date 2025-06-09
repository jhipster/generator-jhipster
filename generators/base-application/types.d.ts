import type { DerivedPropertiesOnlyOf } from '../../lib/command/types.js';
import type { Entity as BaseEntity } from '../../lib/jhipster/types/entity.js';
import type { Field as BaseField } from '../../lib/jhipster/types/field.js';
import type { Relationship as BaseRelationship } from '../../lib/jhipster/types/relationship.js';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
} from '../base-simple-application/index.ts';
import type { ApplicationOptions } from './application-options-all.js';

export type Config = BaseSimpleApplicationConfig & {
  baseName?: string;
  entities?: string[];
};

export type Options = BaseSimpleApplicationOptions & ApplicationOptions;

export type { Features } from '../base-simple-application/types.js';
export type { Source } from '../base-simple-application/types.js';

type Property = {
  propertyName: string;

  propertyNameCapitalized?: string;
  propertyNameUpperSnakeCase?: string;
  propertyApiDescription?: string;
};

export type Field = Property & BaseField;

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
}

/**
 * Represents a relationship with an otherEntity, where the relationship is extended with the other entity.
 * Utility type to workaround https://github.com/Microsoft/TypeScript/issues/24364.
 */
export type RelationshipWithEntity<R, E> = R & {
  otherEntity: E;
};

/**
 * Represents an entity with its relationships, where the relationships are extended with the other entity.
 * Interface is used to allow `this` type in the relationships.
 */
export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends Omit<Required<BaseEntity<F>>, 'relationships'> {
  relationships: RelationshipWithEntity<R, this>[];
  otherRelationships: R[];
}

export type Application = BaseSimpleApplicationApplication & {
  jhiPrefix: string;
  jhiPrefixCapitalized: string;
  jhiPrefixDashed: string;

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
