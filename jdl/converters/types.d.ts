import { RelationshipSide, RelationshipType } from '../basic-types/relationships.js';
import { GENERATOR_JHIPSTER } from '../../generators/index.js';

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

export type ApplicationtypeJSONGeneratorJhipsterContent = {
  applicationType?: string;
};

export type JSONGeneratorJhipsterCacheProviderContent = {
  cacheProvider?: string;
};

export type JSONGeneratorJhipsterDatabaseContent = {
  prodDatabaseType?: string;
  databaseType?: string;
  devDatabaseType?: string;
  enableHibernateCache?: boolean;
};

export type JSONGeneratorJhipsterClientContent = {
  clientFramework?: string;
  skipClient?: boolean;
  clientPackageManager?: string;
  clientTheme?: string;
  clientThemeVariant?: string;
  microfrontend?: boolean;
  microfrontends?: JSONMicrofrontend[];
  withAdminUi?: boolean;
};

export type JSONGeneratorJhipsterPackageContent = {
  packageName?: string;
  packageFolder?: string;
  baseName: string;
};

export type JSONGeneratorJhipsterAuthenticationContent = {
  authenticationType?: string;
  skipUserManagement?: boolean;
};

export type AbstractJSONGeneratorJhipsterContent = {
  entities?: string[];
  jhipsterVersion?: string;
  buildTool?: string;
  dtoSuffix?: string;
  enableSwaggerCodegen?: boolean;
  creationTimestamp?: number;
  enableTranslation?: boolean;
  jhiPrefix?: string;
  entitySuffix?: string;
  jwtSecretKey?: string;
  languages?: string[];
  messageBroker?: string;
  serverPort?: number;
  nativeLanguage?: string;
  reactive?: boolean;
  searchEngine?: string;
  serviceDiscoveryType?: string;
  testFrameworks?: string[];
  enableGradleEnterprise?: boolean;
  gradleEnterpriseHost?: string;
  websocket?: string;
} & ApplicationtypeJSONGeneratorJhipsterContent &
  JSONGeneratorJhipsterContentDeployment &
  JSONGeneratorJhipsterCacheProviderContent &
  JSONGeneratorJhipsterDatabaseContent &
  JSONGeneratorJhipsterPackageContent &
  JSONGeneratorJhipsterAuthenticationContent &
  Record<string, any>;

export type JSONGeneratorJhipsterContent = {
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
  microfrontends?: JSONMicrofrontend[] | null;
} & AbstractJSONGeneratorJhipsterContent &
  JSONGeneratorJhipsterClientContent;

export type PostProcessedJSONGeneratorJhipsterContent = {
  blueprints?: string[];
  microfrontends?: string[];
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONRootObject = {
  [GENERATOR_JHIPSTER]: PostProcessedJSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContent = {
  [GENERATOR_JHIPSTER]: JSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
