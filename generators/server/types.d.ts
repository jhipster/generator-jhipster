import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from '../../lib/command/index.ts';
import type { Entity as BaseApplicationEntity, Features as BaseApplicationFeatures } from '../base-application/types.ts';
import type {
  Application as CommonApplication,
  Entity as CommonEntity,
  Field as CommonField,
  Relationship as CommonRelationship,
} from '../common/types.d.ts';
import type {
  Application as JavaApplication,
  Config as JavaConfig,
  Entity as JavaEntity,
  Field as JavaField,
  Options as JavaOptions,
  Relationship as JavaRelationship,
  Source as JavaSource,
} from '../java/types.ts';
import type { Relationship as LanguagesRelationship } from '../languages/types.d.ts';
import type { DatabaseEntity } from '../liquibase/types.ts';

import type Command from './command.ts';

export { BaseApplicationFeatures as Features };

export type Config = JavaConfig & ExportStoragePropertiesFromCommand<typeof Command>;

export type Options = JavaOptions & ExportGeneratorOptionsFromCommand<typeof Command>;

export interface Field extends JavaField, CommonField {}

export interface Relationship extends JavaRelationship, LanguagesRelationship, CommonRelationship {
  relationshipApiDescription?: string;
}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends JavaEntity<F, R>,
    CommonEntity<F, R>,
    DatabaseEntity<F, R> {
  skipCheckLengthOfIdentifier?: boolean;
}

export type Application<E extends BaseApplicationEntity = Entity> = ExportApplicationPropertiesFromCommand<typeof Command> &
  CommonApplication<E> &
  JavaApplication<E>;

export type { JavaSource as Source };
