import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type appCommand from '../app/command.ts';
import type {
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Features as BaseApplicationFeatures,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from '../base-application/types.ts';
import type { PropertiesFileKeyUpdate } from '../base-core/support/index.ts';
import type { Application as DockerApplication } from '../docker/types.ts';
import type { Application as GitApplication, Config as GitConfig, Options as GitOptions } from '../git/types.ts';
import type huskyCommand from '../javascript/generators/husky/command.ts';
import type prettierCommand from '../javascript/generators/prettier/command.ts';
import type { Application as JavascriptApplication } from '../javascript/types.ts';
import type { Application as LanguagesApplication, Config as LanguagesConfig, Options as LanguagesOptions } from '../languages/types.ts';

import type command from './command.ts';
import type { Entity } from './entity.ts';

export * from './entity.ts';
export type { BaseApplicationFeatures as Features };

type Command = HandleCommandTypes<typeof command>;
type AppCommand = HandleCommandTypes<typeof appCommand>;
type HuskyCommand = HandleCommandTypes<typeof huskyCommand>;
type PrettierCommand = HandleCommandTypes<typeof prettierCommand>;

export type Config = BaseApplicationConfig &
  Command['Config'] &
  AppCommand['Config'] &
  HuskyCommand['Config'] &
  PrettierCommand['Config'] &
  LanguagesConfig &
  GitConfig & {
    applicationIndex?: number;
    testFrameworks?: string[];
  };

export type Options = BaseApplicationOptions &
  Command['Options'] &
  AppCommand['Options'] &
  HuskyCommand['Options'] &
  PrettierCommand['Options'] &
  LanguagesOptions &
  GitOptions;

export type Application<E extends BaseApplicationEntity = Entity> = JavascriptApplication<E> &
  Command['Application'] &
  AppCommand['Application'] &
  HuskyCommand['Application'] &
  PrettierCommand['Application'] &
  GitApplication<E> &
  DockerApplication &
  LanguagesApplication<E> & {
    srcMain: string;
    srcTest: string;
    anyEntityHasRelationshipWithUser: boolean;

    gatewayServicesApiAvailable?: boolean;
    generateAuthenticationApi?: boolean;
    generateInMemoryUserCredentials?: boolean;

    endpointPrefix?: string;
    authenticationUsesCsrf: boolean;
    gatewayRoutes?: { route: string; host: string; serverPort: string }[];
  };

type SonarRule = {
  /** Custom rule ID */
  ruleId: string;
  /** SonarQube rule key */
  ruleKey: string;
  /** SonarQube resource pattern */
  resourceKey: string;
  comment?: string;
};

export type Source = BaseApplicationSource & {
  ignoreSonarRule?: (rule: SonarRule) => void;
  addSonarProperties?: (properties: PropertiesFileKeyUpdate[]) => void;
};
