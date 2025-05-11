import type { BaseApplicationEntity } from '../types.js';

export type GetRelationshipType<E extends BaseApplicationEntity> = E extends { relationships: (infer R)[] } ? R : never;
export type GetFieldType<E extends BaseApplicationEntity> = E extends { fields: (infer F)[] } ? F : never;
