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
import type { Application as LanguagesApplication, Entity as LanguagesEntity } from '../languages/types.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type Field = JavascriptField & {
  fieldTypeTemporal?: boolean;
  fieldTypeCharSequence?: boolean;
  fieldTypeNumeric?: boolean;
};

export type Config = BaseApplicationConfig &
  Command['Config'] & {
    applicationIndex?: number;
    testFrameworks?: string[];
  };

export type Options = BaseApplicationOptions & Command['Options'];

export interface Entity<F extends Field = Field, R extends JavascriptRelationship = JavascriptRelationship>
  extends LanguagesEntity<F, R>,
    JavascriptEntity<F, R> {}

export type Application<E extends BaseApplicationEntity = Entity> = JavascriptApplication<E> &
  DockerApplication &
  LanguagesApplication<E> &
  Command['Application'] & {
    srcMain: string;
    srcTest: string;
    documentationUrl: string;
    anyEntityHasRelationshipWithUser: boolean;
  };

export type { JavascriptRelationship as Relationship, BaseApplicationSource as Source };
