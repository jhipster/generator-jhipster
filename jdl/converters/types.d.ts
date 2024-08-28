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

export type JSONGeneratorJhipsterApplicationtypeContent = {
  applicationType: string;
};

export type JSONGeneratorJhipsterCacheProviderContent = {
  cacheProvider: string;
};

export type JSONGeneratorJhipsterDatabaseContent = {
  databaseType: string;
  devDatabaseType?: string;
  prodDatabaseType?: string;
  enableHibernateCache: boolean;
};

export type JSONGeneratorJhipsterClientContent = {
  clientFramework: string;
  skipClient: boolean;
  clientPackageManager?: string;
  clientTheme?: string;
  clientThemeVariant?: string;
  microfrontend: boolean;
  withAdminUi: boolean;
};

export type JSONGeneratorJhipsterPackageContent = {
  packageName: string;
  packageFolder: string;
} & JSONMicrofrontend;

export type JSONGeneratorJhipsterAuthenticationContent = {
  authenticationType: string;
  skipUserManagement: boolean;
  jwtSecretKey?: string;
};

export type JSONGeneratorJhipsterReactiveContent = {
  reactive: boolean;
};

export type JSONGeneratorJhipsterServerContent = {
  serverPort: number;
  serviceDiscoveryType: string;
  buildTool: string;
  enableGradleEnterprise?: boolean;
  gradleEnterpriseHost?: string;
  dtoSuffix?: string;
  messageBroker?: string;
};

export type JSONGeneratorJhipsterTranslationContent = {
  languages?: string[];
  nativeLanguage?: string;
  enableTranslation?: boolean;
};

export type AbstractJSONGeneratorJhipsterContent = {
  entities?: string[];
  jhipsterVersion?: string;
  enableSwaggerCodegen?: boolean;
  creationTimestamp?: number;
  jhiPrefix?: string;
  entitySuffix?: string;
  searchEngine?: string;
  testFrameworks?: string[];
  websocket?: string;
} & JSONGeneratorJhipsterApplicationtypeContent &
  JSONGeneratorJhipsterContentDeployment &
  JSONGeneratorJhipsterCacheProviderContent &
  JSONGeneratorJhipsterDatabaseContent &
  JSONGeneratorJhipsterPackageContent &
  JSONGeneratorJhipsterClientContent &
  JSONGeneratorJhipsterAuthenticationContent &
  JSONGeneratorJhipsterServerContent &
  JSONGeneratorJhipsterTranslationContent &
  JSONGeneratorJhipsterReactiveContent &
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
  [GENERATOR_JHIPSTER]: PostProcessedJSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContent = {
  [GENERATOR_JHIPSTER]: JSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
