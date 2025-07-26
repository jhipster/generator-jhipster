import type { HandleCommandTypes } from '../../lib/command/types.js';
import type {
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from '../base-application/types.js';
import type { Application as DockerApplication } from '../docker/types.js';
import type {
  Application as JavascriptApplication,
  Entity as JavascriptEntity,
  Field as JavascriptField,
  Relationship as JavascriptRelationship,
} from '../javascript/types.js';
import type { Application as GitApplication, Config as GitConfig, Options as GitOptions } from '../git/types.js';
import type {
  Application as LanguagesApplication,
  Config as LanguagesConfig,
  Entity as LanguagesEntity,
  Options as LanguagesOptions,
} from '../languages/types.js';
import type huskyCommand from '../javascript/generators/husky/command.js';
import type prettierCommand from '../javascript/generators/prettier/command.js';
import type appCommand from '../app/command.ts';
import type { PropertiesFileKeyUpdate } from '../base-core/api.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;
type AppCommand = HandleCommandTypes<typeof appCommand>;
type HuskyCommand = HandleCommandTypes<typeof huskyCommand>;
type PrettierCommand = HandleCommandTypes<typeof prettierCommand>;

export type Field = JavascriptField & {
  fieldTypeTemporal?: boolean;
  fieldTypeCharSequence?: boolean;
  fieldTypeNumeric?: boolean;
  fieldSupportsSortBy?: boolean;
};

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

export interface Entity<F extends Field = Field, R extends JavascriptRelationship = JavascriptRelationship>
  extends LanguagesEntity<F, R>,
    JavascriptEntity<F, R> {
  entityApiUrl: string;
  entityApi: string;

  restProperties?: (F | R)[];

  uniqueEnums?: F[];
}

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
    documentationUrl: string;
    anyEntityHasRelationshipWithUser: boolean;

    gatewayServicesApiAvailable?: boolean;
    generateAuthenticationApi?: boolean;
    generateInMemoryUserCredentials?: boolean;

    endpointPrefix?: string;
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

export type { JavascriptRelationship as Relationship };
