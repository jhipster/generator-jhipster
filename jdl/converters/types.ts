import { RelationshipType, RelationshipSide } from '../basic-types/relationships.js';

export type JSONField = {
  fieldName: string;
  fieldType: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type JSONRelationship = {
  relationshipSide?: RelationshipSide;
  relationshipName: string;
  relationshipType: RelationshipType;
  otherEntityName: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type JSONEntity = {
  documentation?: string;
  fields?: JSONField[];
  relationships?: JSONRelationship[];
} & Record<string, any>;

export type JSONApplication = {
  config: Record<string, string>;
  entities: any;
} & Record<string, any>;
