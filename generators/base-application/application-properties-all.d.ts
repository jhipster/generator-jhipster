/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type { ClientApplication } from '../client/types.js';
import type { SpringBootApplication } from '../server/types.js';
import type { I18nApplication } from '../languages/types.js';
import { EntityAll } from './entity-all.js';
import type { OptionWithDerivedProperties } from './internal/types/application-options.js';
import type { Application as BaseApplication } from './types.js';

/* ApplicationType Start */
type MicroservicesArchitectureApplication = {
  microfrontend: boolean;
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
type UserManagement<Entity> = {
  skipUserManagement: boolean;
  generateUserManagement: boolean;
  generateBuiltInUserEntity?: boolean;
  generateBuiltInAuthorityEntity: boolean;
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
type AuthenticationProperties<Entity> = OptionWithDerivedProperties<'authenticationType', ['jwt', 'oauth2', 'session']> &
  UserManagement<Entity> &
  JwtApplication &
  Oauth2Application &
  SessionApplication;

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type ApplicationAll<E = EntityAll> = BaseApplication &
  QuirksApplication &
  I18nApplication &
  AuthenticationProperties<E> &
  SpringBootApplication &
  ClientApplication &
  ExportApplicationPropertiesFromCommand<typeof import('../docker/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../git/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../gradle/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../project-name/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../spring-boot/command.ts').default> &
  import('../docker/types.js').DockerApplicationType &
  ApplicationProperties;

export { Options as AllOptions, Config as AllConfig } from './types.js';
