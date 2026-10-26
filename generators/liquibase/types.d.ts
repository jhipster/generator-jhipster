import type { CommandTypeMap } from '../../lib/command/types.ts';
import type {
  DatabaseEntity,
  DatabaseField,
  DatabaseProperty,
  DatabaseRelationship,
} from '../base-application/generators/database-bootstrap/types.d.ts';
import type {
  Config as BaseEntityChangesConfig,
  Entity as BaseEntityChangesEntity,
  Features as BaseEntityChangesFeatures,
  Field as BaseEntityChangesField,
  Options as BaseEntityChangesOptions,
  Relationship as BaseEntityChangesRelationship,
  Source as BaseEntityChangesSource,
} from '../base-entity-changes/types.d.ts';
import type { Application as JavaApplication, Entity as JavaEntity, Field as JavaField, Source as JavaSource } from '../java/types.ts';

import type command from './command.ts';
import type { LiquibaseColumnType, LiquibaseLoadColumnType } from './support/prepare-field.ts';

export type Features = BaseEntityChangesFeatures;

type Command = CommandTypeMap<typeof command>;

export type Config = BaseEntityChangesConfig & Command['Config'];

export type Options = BaseEntityChangesOptions & Command['Options'];

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = BaseEntityChangesSource & {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type Source = LiquibaseSourceType & JavaSource;

/**
 * @deprecated moved to `jhipster:base-application:database-bootstrap`; import them from
 * `generators/base-application/generators/database-bootstrap/types.d.ts`.
 */
export type {
  DatabaseEntity,
  DatabaseField,
  DatabaseProperty,
  DatabaseRelationship,
} from '../base-application/generators/database-bootstrap/types.d.ts';

type Property = {
  liquibaseGenerateFakeData?: boolean;
} & DatabaseProperty;

export interface Relationship extends BaseEntityChangesRelationship, DatabaseRelationship, Property {
  columnDataType?: string;

  onDelete?: string;
  onUpdate?: string;

  shouldWriteRelationship?: boolean;

  unique?: boolean;

  /** The name of the foreign key constraint of a relationship written in the table of the entity. */
  liquibaseForeignKeyName?: string;
  /** The names of the unique constraints of a one-to-one relationship, by the column name of the id field it references. */
  liquibaseUniqueConstraintNames?: Record<string, string>;
}

export type Field = BaseEntityChangesField &
  DatabaseField &
  Property &
  JavaField & {
    columnType?: LiquibaseColumnType;
    loadColumnType?: LiquibaseLoadColumnType;

    shouldDropDefaultValue?: boolean;
    shouldCreateContentType?: boolean;

    liquibaseAutoIncrement?: boolean;
    liquibaseSequenceGeneratorName?: string;
    liquibaseCustomSequenceGenerator?: boolean;

    liquibaseDefaultValueAttributeValue?: string;
    liquibaseDefaultValueAttributeName?: string;
    /** The default value attribute of the column, like `defaultValue="value"`, empty without a default value. */
    liquibaseDefaultValueAttribute?: string;
    /** The attributes of the column after its type: the default value and the remarks, each with a leading space. */
    liquibaseColumnAttributes?: string;

    uniqueConstraintName?: string;
  };

export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends BaseEntityChangesEntity<F, R>, JavaEntity<F, R>, DatabaseEntity<F, R> {
  anyRelationshipIsOwnerSide: boolean;
  /** The remarks attribute of the table, with a leading space, empty without documentation. */
  liquibaseRemarksAttribute?: string;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
}

export type Application<E extends Entity> = JavaApplication<E> & {
  liquibaseDefaultSchemaName: string;
  liquibaseAddH2Properties: boolean;
  prodLiquibaseUrl: string;
  devLiquibaseUrl: string;
  incrementalChangelog: boolean;
};
