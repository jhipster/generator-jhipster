import { RelationshipType, RelationshipSide } from '../basic-types/relationships.js';

export type JSONField = {
  fieldName: string;
  fieldType: string;
  documentation?: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type JSONFieldEnum = JSONField & {
  fieldValues: string;
  fieldTypeDocumentation?: string;
  fieldValuesJavadocs?: Record<string, string>;
};

export type JSONFieldBlob = JSONField & {
  fieldTypeBlobContent: string;
};

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

export type JSONGeneratorJhipsterContent = {
  applicationType: string;
} & Record<string, any>;

export type JSONRootObject = {
  entities: string[];
  ['generator-jhipster']: JSONGeneratorJhipsterContent;
};
