import type { GenericDerivedProperty } from '../../types/application';
import type { BaseApplication } from '../bootstrap-application/types';

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

export type ClientServerApplication = BaseApplication &
  (JwtApplication | Oauth2Application | SessionApplication) &
  (MonolithApplication | GatewayApplication | MicroserviceApplication) & {
    clientSrcDir: string;
    serverPort: number;
    devServerPort: number;
    pages: string[];
  };
