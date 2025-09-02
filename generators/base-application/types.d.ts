import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
} from '../base-simple-application/types.ts';

import type { BaseApplicationAddedApplicationProperties } from './application.ts';
import type { Entity } from './entity.ts';
import type bootstrapCommand from './generators/bootstrap/command.ts';
import type { OptionWithDerivedProperties } from './internal/types/application-options.ts';

export type * from './entity.ts';

type Command = HandleCommandTypes<typeof bootstrapCommand>;

export type Config = BaseSimpleApplicationConfig &
  Command['Config'] & {
    entities?: string[];
    backendType?: string;
  };

export type Options = BaseSimpleApplicationOptions & Command['Options'];

export type { Features } from '../base-simple-application/types.ts';
export type { Source } from '../base-simple-application/types.ts';

/* ApplicationType Start */
type MicroservicesArchitectureApplication = {
  microfrontend: boolean;
  gatewayServerPort: number;
};

type GatewayApplication = MicroservicesArchitectureApplication & {
  microfrontends: { baseName: string; lowercaseBaseName?: string; capitalizedBaseName?: string; endpointPrefix?: string }[];
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
type AuthenticationProperties = OptionWithDerivedProperties<'authenticationType', ['jwt', 'oauth2', 'session']> &
  JwtApplication &
  Oauth2Application &
  SessionApplication;

export type Application<E extends Entity> = Command['Application'] &
  BaseApplicationAddedApplicationProperties<E> &
  BaseSimpleApplicationApplication &
  ApplicationProperties &
  AuthenticationProperties & {};
