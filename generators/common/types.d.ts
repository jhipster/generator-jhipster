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
import type { Application as LanguagesApplication, Entity as LanguagesEntity } from '../languages/types.js';
import type huskyCommand from '../javascript/generators/husky/command.js';
import type prettierCommand from '../javascript/generators/prettier/command.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;
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
  HuskyCommand['Config'] &
  PrettierCommand['Config'] &
  GitConfig & {
    applicationIndex?: number;
    testFrameworks?: string[];
  };

export type Options = BaseApplicationOptions & Command['Options'] & HuskyCommand['Options'] & PrettierCommand['Options'] & GitOptions;

export interface Entity<F extends Field = Field, R extends JavascriptRelationship = JavascriptRelationship>
  extends LanguagesEntity<F, R>,
    JavascriptEntity<F, R> {
  entityApiUrl: string;
  entityApi: string;
}

export type Application<E extends BaseApplicationEntity = Entity> = JavascriptApplication<E> &
  Command['Application'] &
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
  };

export type { JavascriptRelationship as Relationship, BaseApplicationSource as Source };
