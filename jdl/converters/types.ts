import { RelationshipType, RelationshipSide } from '../basic-types/relationships.js';

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
  documentation?: string;
  fields?: Field[];
  relationships?: Relationship[];
} & Record<string, any>;
