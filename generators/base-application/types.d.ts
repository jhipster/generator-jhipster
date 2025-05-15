/* eslint-disable @typescript-eslint/consistent-type-imports */
import { BaseApplication, BaseControl, BaseEntity, BaseSources } from '../base/types.js';

export type BaseApplicationField = {
  fieldName: string;
};
export type BaseApplicationRelationship = {
  relationshipName: string;
};
export type BaseApplicationEntity<Field extends BaseApplicationField, Relationship extends BaseApplicationRelationship> = BaseEntity & {
  name: string;
  fields: Field[];
  relationships: Relationship[];
  pagination?: 'no' | 'infinite-scroll' | 'pagination';
  dto?: 'no' | 'mapstruct' | 'any';
  service?: 'no' | 'serviceClass' | 'serviceImpl';
  paginationPagination: boolean;
  paginationInfiniteScroll: boolean;
  paginationNo: boolean;
  dtoMapstruct: boolean;
  dtoAny: boolean;
  serviceClass: boolean;
  serviceImpl: boolean;
  serviceNo: boolean;
};
export type BaseApplicationApplication<
  Field extends BaseApplicationField,
  Relationship extends BaseApplicationRelationship,
  Entity extends BaseApplicationEntity<Field, Relationship>,
> = BaseApplication<Entity> & {
  baseName: string;
  generateBuiltInUserEntity?: boolean;
  generateUserManagement: boolean;
  generateBuiltInAuthorityEntity: boolean;
};

export type BaseApplicationSources<
  Field extends BaseApplicationField,
  Relationship extends BaseApplicationRelationship,
  Entity extends BaseApplicationEntity<Field, Relationship>,
  Application extends BaseApplicationApplication<Field, Relationship, Entity>,
> = BaseApplicationApplication<Field, Relationship, Entity> & BaseSources<Entity, Application> & {};

export type BaseApplicationControl = BaseControl & {};
