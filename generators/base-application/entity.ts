import { kebabCase, lowerFirst, snakeCase, startCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import type { DerivedPropertiesOnlyOf } from '../../lib/command/types.ts';
import type { FieldType } from '../../lib/jhipster/field-types.ts';
import { BlobTypes, fieldTypesValues } from '../../lib/jhipster/field-types.ts';
import { type ValidationType, validationTypes } from '../../lib/jhipster/index.ts';
import type { Entity as BaseEntity } from '../../lib/jhipster/types/entity.ts';
import type { Field as BaseField } from '../../lib/jhipster/types/field.ts';
import type { Relationship as BaseRelationship } from '../../lib/jhipster/types/relationship.ts';
import { buildMutateDataForProperty } from '../../lib/utils/derived-property.ts';
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';

import type { FakerWithRandexp } from './support/faker.ts';

type Property = {
  propertyName: string;

  propertyNameCapitalized?: string;
  propertyNameUpperSnakeCase?: string;
  propertyApiDescription?: string;

  skipClient?: boolean;
  skipServer?: boolean;
};

const mutateProperty = {
  propertyNameCapitalized: ({ propertyName }) => upperFirst(propertyName),
  propertyNameUpperSnakeCase: ({ propertyName }) => snakeCase(propertyName).toUpperCase(),
} as const satisfies MutateDataParam<Property>;

type BaseApplicationAddedFieldProperties = DerivedPropertiesOnlyOf<'fieldType', FieldType> &
  DerivedPropertiesOnlyOf<'fieldValidation', ValidationType> & {
    path?: string[];

    fieldNameCapitalized: string;
    fieldNameHumanized: string;
    fieldNameUnderscored: string;
    fieldTranslationKey?: string;

    fieldApiDescription?: string;

    enumFileName?: string;
    enumValues?: { name: string; value: string }[];

    // Validation
    fieldValidate?: boolean;
    unique?: boolean;
    maxlength?: number;

    /**
     * Faker template passed to `faker.helpers.fake()`.
     * @see https://fakerjs.dev/api/helpers.html#fake
     */
    fakerTemplate?: string;

    // Temporary fields for Faker
    uniqueValue?: any[];

    generateFakeDataFromPattern?: () => string | undefined;

    generateFakeData?: (type?: 'csv' | 'cypress' | 'json-serializable' | 'ts') => any;

    transient?: boolean;
    id?: boolean;
    autoGenerate?: boolean;
    readonly?: boolean;
    sequenceGeneratorName?: string;

    // Blob
    fieldWithContentType?: boolean;
    contentTypeFieldName?: string;

    fieldTypeTimed?: boolean;

    blobContentTypeText?: boolean;
    blobContentTypeImage?: boolean;
    blobContentTypeAny?: boolean;

    fieldTypeBytes?: boolean;
    // Derived properties
    fieldTypeBinary?: boolean;

    /** @deprecated */
    fieldValidationMinLength: boolean;
    /** @deprecated */
    fieldValidationMaxLength: boolean;
    /** @deprecated */
    fieldValidationMinBytes: boolean;
    /** @deprecated */
    fieldValidationMaxBytes: boolean;

    relatedByOtherEntity?: boolean;

    enumInstance?: string;
    builtIn?: boolean;
  };

export type Field = Property &
  Omit<BaseField, 'fieldType'> &
  BaseApplicationAddedFieldProperties &
  (
    | {
        fieldType: string;
        fieldIsEnum: true;
      }
    | {
        fieldType: FieldType;
        fieldIsEnum: false;
      }
  );

export const mutateField = {
  __override__: false,
  ...buildMutateDataForProperty('fieldType', Object.values(fieldTypesValues), { anyData: true }),
  fieldTypeBytes: ({ fieldTypeByte }) => fieldTypeByte,
  ...buildMutateDataForProperty('fieldTypeBlobContent', Object.values(BlobTypes), { prefix: 'blobContentType' }),

  path: ({ fieldName }) => [fieldName],
  propertyName: ({ fieldName }) => fieldName,
  ...mutateProperty,

  fieldNameCapitalized: ({ fieldName }) => upperFirst(fieldName),
  fieldNameUnderscored: ({ fieldName }) => snakeCase(fieldName),
  fieldNameHumanized: ({ fieldName }) => startCase(fieldName),

  ...buildMutateDataForProperty('fieldValidateRules', Object.values(validationTypes), {
    prefix: 'fieldValidation',
    array: true,
    valCheck: (data, value) => data.fieldValidateRules?.includes(value) ?? false,
  }),
  fieldValidationMaxLength: ({ fieldValidationMaxlength }) => fieldValidationMaxlength,
  fieldValidationMinLength: ({ fieldValidationMinlength }) => fieldValidationMinlength,
  fieldValidationMinBytes: ({ fieldValidationMinbytes }) => fieldValidationMinbytes,
  fieldValidationMaxBytes: ({ fieldValidationMaxbytes }) => fieldValidationMaxbytes,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Field>, BaseApplicationAddedFieldProperties>;

export type DerivedField<E extends Entity = Entity, F extends Field = Entity['fields'][number]> = F & {
  derived: true;
  originalField: F;
  derivedEntity: E;
};

type BaseApplicationAddedRelationshipProperties = DerivedPropertiesOnlyOf<
  'relationship',
  'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'
> &
  Property & {
    relationshipNameCapitalized: string;
    collection: boolean;

    /**
     * A persistable relationship means that the relationship will be updated in the database.
     */
    persistableRelationship?: boolean;

    id?: boolean;
    /** @deprecated */
    ownerSide?: boolean;
    relationshipEagerLoad?: boolean;
    relationshipRequired?: boolean;

    relationshipFieldName: string;
    relationshipFieldNamePlural: string;
    relationshipNamePlural: string;
    relationshipNameHumanized: string;

    relationshipIgnoreBackReference?: boolean;

    relationshipValidate?: boolean;
    relationshipValidateRules?: string[];
  };

/**
 * Represents a relationship with an otherRelationship.
 * Interface is used to allow `this` type in the otherRelationship.
 */
export interface Relationship extends BaseApplicationAddedRelationshipProperties, BaseRelationship {
  otherRelationship: this;
}

export const mutateRelationship = {
  __override__: false,
  ...buildMutateDataForProperty('relationshipSide', ['left', 'right'], { prefix: 'relationship', suffix: 'Side' }),
  ...buildMutateDataForProperty('relationshipType', ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'], {
    prefix: 'relationship',
  }),
  collection: ({ relationshipType }) => relationshipType === 'one-to-many' || relationshipType === 'many-to-many',

  relationshipFieldName: ({ relationshipName }) => lowerFirst(relationshipName),
  relationshipFieldNamePlural: ({ relationshipFieldName }) => pluralize(relationshipFieldName!),
  relationshipNamePlural: ({ relationshipName }) => pluralize(relationshipName),
  relationshipNameCapitalized: ({ relationshipName }) => upperFirst(relationshipName),
  relationshipNameHumanized: ({ relationshipName }) => startCase(relationshipName),

  propertyName: ({ collection, relationshipFieldName, relationshipFieldNamePlural }) =>
    collection ? relationshipFieldNamePlural! : relationshipFieldName!,

  ...mutateProperty,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Relationship>, BaseApplicationAddedRelationshipProperties>;

/**
 * Represents a relationship with an otherEntity, where the relationship is extended with the other entity.
 * Utility type to workaround https://github.com/Microsoft/TypeScript/issues/24364.
 */
export type RelationshipWithEntity<R, E extends BaseEntity> = R & {
  otherEntity: E;
  relatedField: Exclude<E['fields'], undefined>[number];
  otherEntityUser: boolean;
};

export const mutateRelationshipWithEntity = {
  __override__: false,
  otherEntityField: data => data.otherEntity?.primaryKey?.name,
  // let ownerSide true when type is 'many-to-one' for convenience.
  // means that this side should control the reference.
  ownerSide: data =>
    Boolean(data.otherEntity.embedded || data.relationshipManyToOne || (data.relationshipLeftSide && !data.relationshipOneToMany)),
  persistableRelationship: ({ ownerSide }) => ownerSide!,
  otherEntityUser: ({ otherEntityName }) => otherEntityName.toLowerCase() === 'user',
} satisfies MutateDataParam<RelationshipWithEntity<Relationship, Entity>>;

export type PrimaryKey<F extends Field = Field> = {
  name: string;
  nameCapitalized: string;
  hibernateSnakeCaseName: string;
  fields: F[];
  relationships: any[];

  type: FieldType;
  composite: boolean;
  derived: boolean;
  javaValueGenerator?: string;
  javaBuildSpecification?: string;

  tsSampleValues?: (string | number)[];
  javaSampleValues?: string[];

  hasUUID?: boolean;
  hasLong?: boolean;
  hasInteger?: boolean;
  typeUUID?: boolean;
  typeString?: boolean;
  typeLong?: boolean;
  typeInteger?: boolean;
  /** @deprecated replace with technology-specific implementation */
  typeNumeric?: boolean;

  derivedFields?: (F & {
    originalField: F;
    derived: boolean;
  })[];
  ownFields?: F[];

  tsType?: string;
  autoGenerate?: boolean;
  /** @deprecated */
  ids: any[];
};

type BaseApplicationAddedEntityProperties = {
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

  resetFakerSeed?(suffix?: string): void;
  generateFakeData?: (type?: any) => any;
  faker?: FakerWithRandexp;

  anyFieldIsBigDecimal?: boolean;
  /**
   * Any file is of type Bytes or ByteBuffer
   */
  anyFieldIsBlobDerived?: boolean;
  /**
   * Any field is of type ZonedDateTime, Instant or LocalDate
   */
  anyFieldIsDateDerived?: boolean;
  anyFieldIsDuration?: boolean;
  anyFieldIsInstant?: boolean;
  anyFieldIsLocalDate?: boolean;
  anyFieldIsLocalTime?: boolean;
  /**
   * Any field is of type ZonedDateTime or Instant
   */
  anyFieldIsTimeDerived?: boolean;
  anyFieldIsUUID?: boolean;
  anyFieldIsZonedDateTime?: boolean;

  anyFieldHasDocumentation?: boolean;
  anyFieldHasImageContentType?: boolean;
  anyFieldHasTextContentType?: boolean;
  /**
   * Any field has image or any contentType
   */
  anyFieldHasFileBasedContentType?: boolean;

  /**
   * Any relationship is required or id
   */
  anyRelationshipIsRequired?: boolean;
  hasRelationshipWithBuiltInUser?: boolean;

  /** Properties from application required for entities published through gateways */
  useMicroserviceJson?: boolean;
  microserviceAppName?: string;
  applicationType?: string;
  microfrontend?: boolean;
  skipUiGrouping?: boolean;
};

/**
 * Represents an entity with its relationships, where the relationships are extended with the other entity.
 * Interface is used to allow `this` type in the relationships.
 */
export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends BaseApplicationAddedEntityProperties,
    Omit<Required<BaseEntity<F>>, 'relationships'> {
  relationships: RelationshipWithEntity<R, this>[];
  otherRelationships: R[];

  primaryKey?: PrimaryKey<F>;

  changelogDateForRecent: any;
}

export const mutateEntity = {
  __override__: false,
  entityNameCapitalized: ({ name }) => upperFirst(name),
  entityNamePlural: ({ name }) => pluralize(name),
  entityNamePluralizedAndSpinalCased: ({ entityNamePlural }) => kebabCase(entityNamePlural),
  entityInstance: ({ name }) => lowerFirst(name),
  entityInstancePlural: ({ entityNamePlural }) => lowerFirst(entityNamePlural),
  entityAuthority: ({ adminEntity }) => (adminEntity ? 'ROLE_ADMIN' : undefined),

  entityClassHumanized: ({ entityNameCapitalized }) => startCase(entityNameCapitalized),
  entityClassPluralHumanized: ({ entityNamePlural }) => startCase(entityNamePlural),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<Entity>, BaseApplicationAddedEntityProperties>;
