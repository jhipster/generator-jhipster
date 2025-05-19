import type { BaseApplicationEntity, BaseApplicationField, BaseApplicationPrimaryKey, BaseApplicationRelationship } from '../types.js';

export type GetRelationshipType<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
> = E extends { relationships: (infer R)[] } ? R : never;
export type GetFieldType<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
> = E extends { fields: (infer F)[] } ? F : never;
