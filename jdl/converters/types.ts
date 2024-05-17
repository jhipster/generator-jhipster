import { RelationshipType, RelationshipSide } from '../basic-types/relationships.js';
import { GENERATOR_JHIPSTER } from '../../generators/index.js';

export type JSONField = {
  fieldName: string;
  fieldType: string;
  documentation?: string;
  options?: Record<string, boolean | string | number>;
  fieldValidateRules?: string[];
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

export type JSONBlueprint = {
  name: string;
  version?: string;
} & Record<string, any>;

export type JSONMicrofrontend = {
  baseName: string;
};

export type JSONGeneratorJhipsterContent = {
  baseName: string;
  applicationType?: string;
  entities?: string[];
  jhipsterVersion?: string;
  packageName?: string;
  packageFolder?: string;
  serverPort?: string;
  authenticationType?: string;
  buildTool?: string;
  cacheProvider?: string;
  clientPackageManager?: string;
  creationTimestamp?: number;
  databaseType?: string;
  devDatabaseType?: string;
  enableHibernateCache?: boolean;
  enableTranslation?: boolean;
  jhiPrefix?: string;
  jwtSecretKey?: string;
  languages?: string[];
  messageBroker?: string;
  nativeLanguage?: string;
  prodDatabaseType?: string;
  searchEngine?: string;
  serviceDiscoveryType?: string;
  skipClient?: boolean;
  skipUserManagement?: boolean;
  testFrameworks?: string[];
  websocket?: string;
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
  microfrontends?: JSONMicrofrontend[] | null;
} & Record<string, any>;

export type PostProcessedJSONGeneratorJhipsterContent = Omit<
  JSONGeneratorJhipsterContent,
  'promptValues' | 'blueprints' | 'microfrontends'
> & {
  blueprints?: string[];
  microfrontends?: string[];
};

export type PostProcessedJSONRootObject = {
  [GENERATOR_JHIPSTER]: PostProcessedJSONGeneratorJhipsterContent;
};

export type JSONRootObject = {
  [GENERATOR_JHIPSTER]: JSONGeneratorJhipsterContent;
};
