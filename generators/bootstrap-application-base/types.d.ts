import type { GenericDerivedProperty, OptionalGenericDerivedProperty } from '../base/application';

export type BaseApplication = {
  jhipsterVersion: string;
  baseName: string;
  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;

  projectVersion: string;
  projectDescription: string;

  jhiPrefix: string;
  entitySuffix: string;
  dtoSuffix: string;

  skipCommitHook: boolean;
  skipJhipsterDependencies: boolean;
  skipUserManagement: boolean;

  nodePackageManager: string;
  nodeDestinationVersion: string;
};

/* ApplicationType Start */
type ApplicationType = {
  applicationType: 'monolith' | 'microservice' | 'gateway';
};

type MicroservicesArchitectureApplication = {
  microfrontend: boolean;
  gatewayServerPort: number;
};

type MicroserviceApplication = GenericDerivedProperty<ApplicationType, 'microservice'> & MicroservicesArchitectureApplication;

type GatewayApplication = GenericDerivedProperty<ApplicationType, 'gateway'> &
  MicroservicesArchitectureApplication & {
    microfrontends: string[];
  };

type MonolithApplication = GenericDerivedProperty<ApplicationType, 'monolith'>;
/* ApplicationType End */

/* AuthenticationType Start */
type AuthenticationType = {
  authenticationType: 'jwt' | 'oauth2' | 'session';
};

type JwtApplication = GenericDerivedProperty<AuthenticationType, 'jwt'> & {
  jwtSecretKey: string;
};

type Oauth2Application = GenericDerivedProperty<AuthenticationType, 'oauth2'> & {
  jwtSecretKey: string;
};

type SessionApplication = GenericDerivedProperty<AuthenticationType, 'session'> & {
  rememberMeKey: string;
};
/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type CommonClientServerApplication = BaseApplication &
  QuirksApplication &
  (JwtApplication | Oauth2Application | SessionApplication) &
  (MonolithApplication | GatewayApplication | MicroserviceApplication) & {
    clientSrcDir: string;
    clientTestDir?: string;
    clientDistDir?: string;
    serverPort: number;
    devServerPort: number;
    pages: string[];
    temporaryDir?: string;
  };

type ServiceDiscoveryType = 'no' | 'eureka' | 'consul';

declare const SERVICE_DISCOVERY_TYPE = 'serviceDiscoveryType';

type ServiceDiscovery = {
  [SERVICE_DISCOVERY_TYPE]: ServiceDiscoveryType;
};

type ServiceDiscoveryApplication = OptionalGenericDerivedProperty<ServiceDiscovery, ServiceDiscovery[typeof SERVICE_DISCOVERY_TYPE]>;

type MonitoringType = 'no' | 'elk' | 'prometheus';

declare const MONITORING_TYPE = 'monitoring';

type Monitoring = {
  [MONITORING_TYPE]: MonitoringType;
};

type MonitoringApplication = OptionalGenericDerivedProperty<Monitoring, Monitoring[typeof MONITORING_TYPE]>;

export type PlatformApplication = ServiceDiscoveryApplication & MonitoringApplication;
