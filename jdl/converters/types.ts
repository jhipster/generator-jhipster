export type Field = {
  fieldName: string;
  fieldType: string;
  options: Record<string, boolean | string | number>;
} & Record<string, boolean | string | number | string[]>;

export type Relationship = {
  relationshipName: string;
  relationshipType: string;
  options: Record<string, boolean | string | number>;
  otherEntityName: string;
} & Record<string, boolean | string | number | string[]>;

export type Entity = {
  javadoc?: string;
  fields?: Field[];
  relationships?: Relationship[];
} & Record<string, boolean | string | number | string[]>;
