import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/index.js';
import type { Entity as BaseApplicationEntity } from '../base-application/types.js';
import type { Application as CommonApplication, Field as CommonField } from '../common/index.js';
import type {
  Application as JavaApplication,
  Config as JavaConfig,
  Entity as JavaEntity,
  Field as JavaField,
  Options as JavaOptions,
  Relationship as JavaRelationship,
  Source as JavaSource,
} from '../java/types.js';
import type { Relationship as LanguagesRelationship } from '../languages/index.js';
import type Command from './command.ts';

export type Config = JavaConfig & ExportStoragePropertiesFromCommand<typeof Command>;

export type Options = JavaOptions & ExportGeneratorOptionsFromCommand<typeof Command>;

export interface Field extends JavaField, CommonField {}

export interface Relationship extends JavaRelationship, LanguagesRelationship {}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends JavaEntity<F, R> {
  entityTableName: string;
}

export type Application<E extends BaseApplicationEntity = Entity> = ExportApplicationPropertiesFromCommand<typeof Command> &
  CommonApplication<E> &
  JavaApplication<E>;

export type { JavaSource as Source };
