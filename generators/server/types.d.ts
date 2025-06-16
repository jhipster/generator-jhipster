import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/index.js';
import type {
  Application as JavaApplication,
  Config as JavaConfig,
  Entity as JavaEntity,
  Field as JavaField,
  Options as JavaOptions,
  Relationship as JavaRelationship,
  Source as JavaSource,
} from '../java/types.js';
import type {
  Application as LanguageApplication,
  Entity as LanguagesEntity,
  Field as LanguagesField,
  Relationship as LanguagesRelationship,
} from '../languages/index.js';
import type Command from './command.ts';

export type Config = JavaConfig & ExportStoragePropertiesFromCommand<typeof Command>;

export type Options = JavaOptions & ExportGeneratorOptionsFromCommand<typeof Command>;

export interface Field extends JavaField, LanguagesField {}

export interface Relationship extends JavaRelationship, LanguagesRelationship {}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends JavaEntity<F, R>, LanguagesEntity<F, R> {
  entityTableName: string;
}

export type Application<E extends Entity = Entity> = ExportApplicationPropertiesFromCommand<typeof Command> &
  LanguageApplication<E> &
  JavaApplication<E>;

export type { JavaSource as Source };
