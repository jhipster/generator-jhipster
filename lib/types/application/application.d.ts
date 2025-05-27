/* eslint-disable @typescript-eslint/consistent-type-imports */
import type {
  BaseApplicationApplication,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationRelationship,
  BaseApplicationSources,
} from '../../../generators/base-application/types.js';
import type { ClientApplication, ClientSourceType } from '../../../generators/client/types.js';
import type { I18nApplication, LanguagesSource } from '../../../generators/languages/types.js';
import type { SpringBootApplication, SpringBootSourceType } from '../../../generators/server/types.js';
import type { ExportApplicationPropertiesFromCommand } from '../../command/types.js';
import type { DockerSourceType } from '../../../generators/docker/types.ts';
import type { OptionWithDerivedProperties } from '../../../generators/base-application/application-options.js';
import { Field } from './field.js';
import { Relationship } from './relationship.js';
export type BaseApplicationToRefactor = BaseApplicationApplication & {
  jhipsterVersion: string;

  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;
  camelizedBaseName: string;
  hipster: string;
  lowercaseBaseName: string;
  upperFirstCamelCaseBaseName: string;
  documentationArchiveUrl: string;

  projectVersion: string;
  projectDescription: string;

  jhiPrefix: string;

  skipCommitHook: boolean;
  skipJhipsterDependencies: boolean;
  fakerSeed?: string;

  nodeVersion: string;
  nodePackageManager: string;
  /* @deprecated use nodePackageManager */
  clientPackageManager: string;
  nodeDependencies: Record<string, string>;

  skipClient?: boolean;
  skipServer?: boolean;
  monorepository?: boolean;

  blueprints?: { name: string; version: string }[];
  testFrameworks?: string[];

  /**
   * True if the application has at least one non-builtin entity.
   */
  hasNonBuiltInEntity?: boolean;

  /** Customize templates sourceFile and destinationFile */

  context: any;
} & I18nApplication;

/* ApplicationType Start */
type MicroservicesArchitectureApplication = {
  gatewayServerPort: number;
};

type GatewayApplication = MicroservicesArchitectureApplication & {
  microfrontends: string[];
};

/*
Deterministic option causes types to be too complex
type ApplicationType = DeterministicOptionWithDerivedProperties<
  'applicationType',
  ['monolith', 'gateway', 'microservice'],
  [Record<string, never>, GatewayApplication, MicroservicesArchitectureApplication]
>;
*/
type ApplicationProperties = OptionWithDerivedProperties<'applicationType', ['monolith', 'gateway', 'microservice']> &
  GatewayApplication &
  MicroservicesArchitectureApplication;

/* ApplicationType End */

/* AuthenticationType Start */
/*
Deterministic option causes types to be too complex
type UserManagement =
  | {
      skipUserManagement: true;
      generateUserManagement: false;
      generateBuiltInUserEntity?: false;
      generateBuiltInAuthorityEntity: false;
    }
  | {
      skipUserManagement: false;
      generateBuiltInUserEntity?: boolean;
      generateUserManagement: true;
      user: any;
      userManagement: any;
      generateBuiltInAuthorityEntity: boolean;
      authority: any;
    };
    */
type UserManagement<Entity extends BaseApplicationEntity<any, any, any>> = {
  skipUserManagement: boolean;
  user: Entity;
  userManagement: Entity;
  authority: Entity;
};

type JwtApplication = {
  jwtSecretKey: string;
};

type Oauth2Application = {
  syncUserWithIdp?: boolean;
};

type SessionApplication = {
  rememberMeKey: string;
};

/*
Deterministic option causes types to be too complex
type AuthenticationType = DeterministicOptionWithDerivedProperties<
  'authenticationType',
  ['jwt', 'oauth2', 'session'],
  [JwtApplication, Oauth2Application, SessionApplication]
>;
*/
type AuthenticationProperties<Entity extends BaseApplicationEntity<any, any, any>> = OptionWithDerivedProperties<
  'authenticationType',
  ['jwt', 'oauth2', 'session']
> &
  UserManagement<Entity> &
  JwtApplication &
  Oauth2Application &
  SessionApplication;

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type CommonClientServerApplication<E extends BaseApplicationEntity<any, any, any>> = BaseApplicationToRefactor &
  QuirksApplication &
  AuthenticationProperties<E> &
  SpringBootApplication &
  ClientApplication<E> &
  ExportApplicationPropertiesFromCommand<typeof import('../../../generators/git/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../../../generators/docker/command.ts').default> &
  import('../../../generators/docker/types.d.ts').DockerApplicationType &
  ExportApplicationPropertiesFromCommand<typeof import('../../../generators/project-name/command.ts').default> &
  ApplicationProperties & {
    clientRootDir: string;
    clientSrcDir: string;
    clientTestDir?: string;
    clientDistDir?: string;
    devServerPort: number;
    pages: string[];

    serverPort: number;
    backendType?: string;
    backendTypeJavaAny?: boolean;
    backendTypeSpringBoot?: boolean;
    temporaryDir?: string;

    hipsterName?: string;
    hipsterProductName?: string;
    hipsterHomePageProductName?: string;
    hipsterStackOverflowProductName?: string;
    hipsterBugTrackerProductName?: string;
    hipsterChatProductName?: string;
    hipsterTwitterUsername?: string;
    hipsterDocumentationLink?: string;
    hipsterTwitterLink?: string;
    hipsterProjectLink?: string;
    hipsterStackoverflowLink?: string;
    hipsterBugTrackerLink?: string;
    hipsterChatLink?: string;

    dockerServicesDir?: string;
    dockerServices?: string[];
    prettierFolders?: string;
    prettierExtensions?: string;
  };

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type PlatformApplication = ServiceDiscoveryApplication & MonitoringApplication;

export type ApplicationType = {
  gradleDevelocityHost?: string;
  translations: string[];
  getWebappTranslation: (t: any[]) => string;
} & BaseApplicationApplication &
  CommonClientServerApplication<any> &
  ExportApplicationPropertiesFromCommand<typeof import('../../../generators/gradle/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../../../generators/spring-boot/command.ts').default>;

export type DeprecatedBaseApplicationSource<
  F extends BaseApplicationField = Field,
  R extends BaseApplicationRelationship<any> = Relationship,
  A extends BaseApplicationApplication = BaseApplicationApplication,
> = BaseApplicationSources<F, any, R, any, A> & {
  generatorPath: string;
  srcMainResources: string;
  srcTestResources: string;
  skipUserManagement: boolean;
  nativeLanguage: string;
} & SpringBootSourceType &
  ClientSourceType &
  LanguagesSource &
  DockerSourceType;
