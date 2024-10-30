export const JDL_RELATIONSHIP_ONE_TO_ONE = 'OneToOne';
export const JDL_RELATIONSHIP_ONE_TO_MANY = 'OneToMany';
export const JDL_RELATIONSHIP_MANY_TO_ONE = 'ManyToOne';
export const JDL_RELATIONSHIP_MANY_TO_MANY = 'ManyToMany';

export const RELATIONSHIP_ONE_TO_ONE = 'one-to-one';
export const RELATIONSHIP_ONE_TO_MANY = 'one-to-many';
export const RELATIONSHIP_MANY_TO_ONE = 'many-to-one';
export const RELATIONSHIP_MANY_TO_MANY = 'many-to-many';

export type RelationshipType =
  | typeof RELATIONSHIP_ONE_TO_ONE
  | typeof RELATIONSHIP_ONE_TO_MANY
  | typeof RELATIONSHIP_MANY_TO_ONE
  | typeof RELATIONSHIP_MANY_TO_MANY;

export type JDLRelationshipType =
  | typeof JDL_RELATIONSHIP_ONE_TO_ONE
  | typeof JDL_RELATIONSHIP_ONE_TO_MANY
  | typeof JDL_RELATIONSHIP_MANY_TO_ONE
  | typeof JDL_RELATIONSHIP_MANY_TO_MANY;

export const relationshipTypes: Record<'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY', JDLRelationshipType> = {
  ONE_TO_ONE: JDL_RELATIONSHIP_ONE_TO_ONE,
  ONE_TO_MANY: JDL_RELATIONSHIP_ONE_TO_MANY,
  MANY_TO_ONE: JDL_RELATIONSHIP_MANY_TO_ONE,
  MANY_TO_MANY: JDL_RELATIONSHIP_MANY_TO_MANY,
};

export type RelationshipSide = 'left' | 'right';
