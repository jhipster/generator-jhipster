import type { BaseApplicationEntity, BaseApplicationField, BaseApplicationRelationship } from '../types.js';

export type GetRelationshipType<
  F extends BaseApplicationField,
  R extends BaseApplicationRelationship,
  E extends BaseApplicationEntity<F, R>,
> = E extends { relationships: (infer R)[] } ? R : never;
export type GetFieldType<
  F extends BaseApplicationField,
  R extends BaseApplicationRelationship,
  E extends BaseApplicationEntity<F, R>,
> = E extends { fields: (infer F)[] } ? F : never;
