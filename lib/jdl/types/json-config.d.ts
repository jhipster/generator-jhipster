import type { YO_RC_CONFIG_KEY } from '../../utils/yo-rc.ts';
import type { RelationshipSide, RelationshipType } from '../basic-types/relationships.js';

export type JSONField = {
  fieldName: string;
  fieldType: string;
  documentation?: string;
  options?: Record<string, boolean | string | number>;
  fieldValidateRules?: string[];
} & Record<string, any>;

export type JSONBlobField = {
  fieldTypeBlobContent: 'image' | 'any' | 'text';
} & JSONField;

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

export type JSONBlueprint = {
  name: string;
  version?: string;
} & Record<string, any>;

export type JSONMicrofrontend = {
  baseName: string;
};
export type JSONGeneratorJhipsterContentDeployment = {
  appsFolders?: string[];
  clusteredDbApps?: string[];
};

export type AbstractJSONGeneratorJhipsterContent = {
  baseName: string;
  applicationType?: string;
} & JSONGeneratorJhipsterContentDeployment &
  Record<string, any>;

export type JSONGeneratorJhipsterContent = {
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
  microfrontends?: JSONMicrofrontend[] | null;
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONGeneratorJhipsterContent = {
  blueprints?: string[];
  microfrontends?: string[];
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONRootObject = {
  [YO_RC_CONFIG_KEY]: PostProcessedJSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContent = {
  [YO_RC_CONFIG_KEY]: JSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
