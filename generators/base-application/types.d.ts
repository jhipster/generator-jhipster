import { ClientApplication } from '../client/types.js';
import { I18nApplication } from '../languages/types.js';
import { SpringBootApplication } from '../server/types.js';
import { DeterministicOptionWithDerivedProperties, OptionWithDerivedProperties } from './application-options.js';

export type BaseApplication = {
  jhipsterVersion: string;
  baseName: string;
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
  entitySuffix: string;
  dtoSuffix: string;

  skipCommitHook: boolean;
  skipJhipsterDependencies: boolean;
  fakerSeed?: string;

  nodeVersion: string;
  nodePackageManager: string;
  nodeDependencies: Record<string, string>;

  skipClient?: boolean;
  skipServer?: boolean;
} & I18nApplication;

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

type JwtApplication = UserManagement & {
  jwtSecretKey: string;
};

type Oauth2Application = {
  jwtSecretKey: string;
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

export type CommonClientServerApplication = BaseApplication &
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

    serverPort: number;
    backendType?: string;
    backendTypeJavaAny?: boolean;
    backendTypeSpringBoot?: boolean;
    temporaryDir?: string;

    dockerServicesDir?: string;
    dockerServices?: string[];
    prettierExtensions?: string;

    skipUserManagement?: boolean;
    generateUserManagement?: boolean;
  };

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type PlatformApplication = ServiceDiscoveryApplication & MonitoringApplication;
