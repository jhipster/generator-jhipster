export type RelationshipSide = 'left' | 'right';
export type RelationshipType = 'one-to-one' | 'many-to-one' | 'one-to-many' | 'many-to-many';

export type Field = {
  fieldName: string;
  fieldType: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type Relationship = {
  relationshipSide?: RelationshipSide;
  relationshipName: string;
  relationshipType: RelationshipType;
  otherEntityName: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type Entity = {
  javadoc?: string;
  fields?: Field[];
  relationships?: Relationship[];
} & Record<string, any>;
