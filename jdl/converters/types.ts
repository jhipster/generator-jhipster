export type Field = {
  fieldName: string;
  fieldType: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type Relationship = {
  relationshipName: string;
  relationshipType: string;
  otherEntityName: string;
  options?: Record<string, boolean | string | number>;
} & Record<string, any>;

export type Entity = {
  javadoc?: string;
  fields?: Field[];
  relationships?: Relationship[];
} & Record<string, any>;
