export type GetRelationshipType<E> = E extends { relationships: (infer R)[] } ? R : never;
export type GetFieldType<E> = E extends { fields: (infer F)[] } ? F : never;
