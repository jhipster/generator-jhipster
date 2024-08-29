import CoreGenerator from '../base-core/generator.ts';
import { ClientApplication } from '../client/types.js';
import { I18nApplication } from '../languages/types.js';
import { SpringBootApplication } from '../server/types.js';
import { DeterministicOptionWithDerivedProperties, OptionWithDerivedProperties } from './application-options.js';

export type PersistedBaseApplication = {
  dtoSuffix: string;
  jhiPrefix: string;
  jhipsterVersion: string;
  baseName: string;
  entitySuffix: string;
  skipClient?: boolean;
  skipServer?: boolean;
};

export type BaseApplication = {
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

  skipCommitHook: boolean;
  skipJhipsterDependencies: boolean;
  fakerSeed?: string;

  nodeVersion: string;
  nodePackageManager: string;
  nodeDependencies: Record<string, string>;

  monorepository?: boolean;

  /** Customize templates sourceFile and destinationFile */
  customizeTemplatePaths: ((
    this: CoreGenerator,
    file: {
      namespace: string;
      sourceFile: string;
      resolvedSourceFile: string;
      destinationFile: string;
      templatesRoots: string[];
    },
    context: any,
  ) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string; templatesRoots: string[] })[];
} & I18nApplication &
  PersistedBaseApplication;

/* ApplicationType Start */
type MicroservicesArchitectureApplication = {
  microfrontend: boolean;
  gatewayServerPort: number;
};

type GatewayApplication = MicroservicesArchitectureApplication & {
  microfrontends: string[];
};

type ApplicationType = DeterministicOptionWithDerivedProperties<
  'applicationType',
  ['monolith', 'gateway', 'microservice'],
  [Record<string, never>, GatewayApplication, MicroservicesArchitectureApplication]
>;

/* ApplicationType End */

/* AuthenticationType Start */
export type PersistedUserManagement = {
  skipUserManagement: boolean;
};

type UserManagement =
  | ({
      skipUserManagement: true;
      generateUserManagement: false;
      generateBuiltInUserEntity?: false;
      generateBuiltInAuthorityEntity: false;
    } & PersistedUserManagement)
  | ({
      skipUserManagement: false;
      generateBuiltInUserEntity?: boolean;
      generateUserManagement: true;
      user: any;
      userManagement: any;
      generateBuiltInAuthorityEntity: boolean;
      authority: any;
    } & PersistedUserManagement);

type JwtApplication = UserManagement & {
  jwtSecretKey: string;
};

type Oauth2Application = {
  generateBuiltInUserEntity?: boolean;
  user: any;
  generateBuiltInAuthorityEntity: false;
  generateUserManagement: false;
};

type SessionApplication = UserManagement & {
  rememberMeKey: string;
};

type AuthenticationType = DeterministicOptionWithDerivedProperties<
  'authenticationType',
  ['jwt', 'oauth2', 'session'],
  [JwtApplication, Oauth2Application, SessionApplication]
>;

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type PersistedServerApplication = {
  serverPort: number;
};

export type CommonClientServerApplication = BaseApplication &
  PersistedServerApplication &
  QuirksApplication &
  AuthenticationType &
  SpringBootApplication &
  ClientApplication &
  ApplicationType & {
    clientRootDir: string;
    clientSrcDir: string;
    clientTestDir?: string;
    clientDistDir?: string;
    devServerPort: number;
    pages: string[];

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
    prettierExtensions?: string;

    skipUserManagement?: boolean;
    syncUserWithIdp?: boolean;
  };

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type PlatformApplication = ServiceDiscoveryApplication & MonitoringApplication;
