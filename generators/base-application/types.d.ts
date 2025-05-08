/* eslint-disable @typescript-eslint/consistent-type-imports */

import { BaseApplication, BaseControl, BaseEntity, BaseSources } from '../base/types.js';
import { Application as SimpleApplication } from '../base-simple-application/index.js';
import type { FieldType } from '../../lib/application/field-types.js';
import type { FakerWithRandexp } from '../base/support/index.js';
export type Property = {
  propertyName: string;
  propertyNameCapitalized?: string;
  propertyNameUpperSnakeCase?: string;
};
export type BaseApplicationField = Property & {
  fieldName: string;
  fieldType: FieldType | string;
  documentation?: string;

  id?: boolean;
  autoGenerate?: boolean;
  generateFakeData?: (type?: 'csv' | 'cypress' | 'json-serializable' | 'ts') => any;
  nullable?: boolean;
  fieldTypeBlobContent?: 'image' | 'any' | 'text';
  // Validation
  fieldValidate?: boolean;
  /** @deprecated */
  reference?: any;
  /** @deprecated */
  fieldTypeNumeric: boolean;
  transient?: boolean;
  requiresPersistableImplementation: boolean;
  /**
   * Faker template passed to `faker.helpers.fake()`.
   * @see https://fakerjs.dev/api/helpers.html#fake
   */
  fakerTemplate?: string;
  fieldValidateRules?: string[];
  generateFakeDataFromPattern?: () => string | undefined;
  fieldValidateRulesPattern?: string | RegExp;
  fieldIsEnum?: boolean;
  enumValues?: { name: string; value: string }[];
  unique?: boolean;
  maxlength?: number;
  fieldValidateRulesMax?: number;
  fieldValidateRulesMin?: number;
  fieldValidateRulesMaxlength?: number;
  fieldValidateRulesMinlength?: number;
  columnName?: string;

  // Derived properties
  fieldTypeBinary?: boolean;
  fieldValues: any;
  enumFileName?: string;
  // Blob
  fieldWithContentType?: boolean;
  contentTypeFieldName?: string;
  /** @deprecated */
  createRandexp: () => any;
  // Temporary fields for Faker
  uniqueValue?: any[];
  relationshipsPath?: string[];
};

export type BaseApplicationPrimaryKey<F extends BaseApplicationField> = {
  fields: F[];
  type: FieldType;
  composite: boolean;
  hasUUID: boolean;
  hasLong: boolean;
  hasInteger: boolean;
  typeUUID: boolean;
  typeString: boolean;
  typeLong: boolean;
  typeInteger: boolean;
  typeNumeric: boolean;
};

export type BaseApplicationRelationship<E extends BaseEntity> = Property & {
  relationshipName: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  ownerSide?: boolean;
  relationshipValidate: boolean;
  otherEntity: E;
  /**
   * A persistable relationship means that the relationship will be updated in the database.
   */
  persistableRelationship: boolean;
  /** @deprecated */
  reference?: any;
  id?: boolean;
  relationshipCollection: boolean;
  relationshipReferenceField: string;
  relationshipFieldNamePlural: string;
  relationshipFieldName: string;
  bagRelationship: boolean;
  relationshipEagerLoad: boolean;
  collection: boolean;
  otherEntityName: string;
  otherEntityRelationshipName?: string;
};
export type BaseApplicationEntity<
  Field extends BaseApplicationField,
  PrimaryKey extends BaseApplicationPrimaryKey<Field>,
  Relationship extends BaseApplicationRelationship<any>,
> = BaseEntity & {
  resetFakerSeed(suffix?: string): void;

  primaryKey: PrimaryKey;
  name: string;
  entityPackage?: string;
  skipUiGrouping: boolean;
  anyFieldHasDocumentation: boolean;
  existingEnum: boolean;
  fields: Field[];
  relationships: Relationship[];
  otherEntities: BaseApplicationEntity<Field, PrimaryKey, Relationship>[];
  searchEngine: 'no' | 'elasticsearch' | 'couchbase';
  pagination?: 'no' | 'infinite-scroll' | 'pagination';
  dto?: 'no' | 'mapstruct' | 'any';
  service?: 'no' | 'serviceClass' | 'serviceImpl';
  paginationPagination: boolean;
  paginationInfiniteScroll: boolean;
  paginationNo: boolean;
  anyPropertyHasValidation: boolean;
  jpaMetamodelFiltering: boolean;
  dtoMapstruct: boolean;
  readOnly: boolean;
  embedded: boolean;
  changelogDate?: string;
  changelogDateForRecent: any;
  angularJSSuffix?: string;
  /** Properties from application required for entities published through gateways */
  useMicroserviceJson?: boolean;
  microserviceAppName?: string;
  skipServer?: boolean;

  requiresPersistableImplementation: boolean;
  updatableEntity?: boolean;
  entityAngularJSSuffix: string;
  microserviceName?: string;
  entityAuthority?: string;
  adminEntity?: boolean;
  builtInUserManagement?: boolean;
  entitySuffix?: string;

  entityReadAuthority?: string;

  fluentMethods: boolean;
  clientRootFolder: string;
  dtoAny: boolean;
  serviceClass: boolean;
  serviceImpl: boolean;
  serviceNo: boolean;
  /**
   * Any field is of type ZonedDateTime, Instant or LocalDate
   */
  anyFieldIsDateDerived: boolean;
  anyFieldIsDuration: boolean;
  anyFieldIsInstant: boolean;
  anyFieldIsLocalDate: boolean;
  anyFieldIsLocalTime: boolean;
  /**
   * Any field is of type ZonedDateTime or Instant
   */
  anyFieldIsTimeDerived: boolean;
  anyFieldIsUUID: boolean;
  anyFieldIsZonedDateTime: boolean;
  anyFieldIsBigDecimal: boolean;
  /**
   * Any file is of type Bytes or ByteBuffer
   */
  anyFieldIsBlobDerived: boolean;
  anyFieldHasImageContentType: boolean;
  anyFieldHasTextContentType: boolean;
  /**
   * Any field has image or any contentType
   */
  anyFieldHasFileBasedContentType: boolean;
  fieldsContainNoOwnerOneToOne: boolean;
  otherRelationships: Relationship[];
  enums: string[];
  relationshipsByOtherEntity: Record<string, Relationship[]>;
  differentRelationships: Record<string, Relationship[]>;
  entityNameCapitalized: string;
  entityNamePlural: string;
  entityNamePluralizedAndSpinalCased: string;
  entityClass: string;
  entityInstance: string;
  entityInstancePlural: string;
  entityTableName: string;

  entityClassPlural: string;
  persistClass: string;
  persistInstance: string;
  dtoClass?: string;
  dtoInstance?: string;

  restClass: string;
  restInstance: string;
  entityI18nVariant: string;
  entityClassHumanized: string;
  entityClassPluralHumanized: string;

  entityFileName: string;
  entityAngularName: string;
  entityAngularNamePlural: string;
  entityApiUrl: string;

  entityFolderName: string;
  entityModelFileName: string;
  entityParentPathAddition: string;
  entityPluralFileName: string;
  entityServiceFileName: string;
  entityReactName: string;
  entityStateName: string;
  entityUrl: string;
  entityTranslationKey: string;
  entityTranslationKeyMenu: string;
  i18nKeyPrefix: string;
  i18nAlertHeaderPrefix: string;
  hasRelationshipWithBuiltInUser: boolean;
  saveUserSnapshot?: boolean;
  entityApi: string;
  entityPage: string;
  generateFakeData?: (type?: any) => any;
  persistableOtherEntities: Relationship[][];
  persistableRelationships: Relationship[];
  allReferences: any;
  otherEntitiesWithPersistableRelationship: BaseApplicationEntity<Field, PrimaryKey, any>[];
  entityContainsCollectionField: boolean;
  otherEntityPrimaryKeyTypes: FieldType[] | string[];
  otherEntityPrimaryKeyTypesIncludesUUID: boolean;
  eagerLoad: boolean;
  relationshipsContainEagerLoad: boolean;
  containsBagRelationships: boolean;
  implementsEagerLoadApis: boolean;
  databaseType?: string;
  reactive: boolean;
  eagerRelations: Relationship[];
  regularEagerRelations: Relationship[];
  reactiveEagerRelations: Relationship[];
  reactiveRegularEagerRelations: Relationship[];
  dtoReferences: any[];
  restProperties: (Field | Relationship)[];
  otherReferences: any[];
  otherDtoReferences: any[];
  faker: FakerWithRandexp;
};
export type BaseApplicationApplication<
  Field extends BaseApplicationField,
  PrimaryKey extends BaseApplicationPrimaryKey<Field>,
  Relationship extends BaseApplicationRelationship<any>,
  Entity extends BaseApplicationEntity<Field, PrimaryKey, Relationship>,
> = BaseApplication<Entity> &
  SimpleApplication & {
    baseName: string;
    generateBuiltInUserEntity?: boolean;
    generateUserManagement: boolean;
    generateBuiltInAuthorityEntity: boolean;
    applicationTypeMicroservice: boolean;
    applicationTypeGateway: boolean;
    microfrontend: boolean;
    dtoSuffix: string;
    entitySuffix: string;
    frontendAppName?: string;
    authenticationTypeOauth2: boolean;
  };

export type BaseApplicationSources<
  Field extends BaseApplicationField,
  PrimaryKey extends BaseApplicationPrimaryKey<Field>,
  Relationship extends BaseApplicationRelationship<any>,
  Entity extends BaseApplicationEntity<Field, PrimaryKey, Relationship>,
  Application extends BaseApplicationApplication<Field, PrimaryKey, Relationship, Entity>,
> = BaseApplicationApplication<Field, PrimaryKey, Relationship, Entity> & BaseSources<Entity, Application> & {};

export type BaseApplicationControl = BaseControl & {};
