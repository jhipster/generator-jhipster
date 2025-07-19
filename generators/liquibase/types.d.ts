import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/types.d.ts';
import type {
  Entity as BaseEntityChangesEntity,
  Field as BaseEntityChangesField,
  Relationship as BaseEntityChangesRelationship,
  Source as BaseEntityChangesSource,
} from '../base-entity-changes/types.d.ts';
import type { Application as JavaApplication, Entity as JavaEntity, Field as JavaField, Source as JavaSource } from '../java/types.js';
import type { LiquibaseColumnType, LiquibaseLoadColumnType } from './support/prepare-field.ts';

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = BaseEntityChangesSource & {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type Source = LiquibaseSourceType & JavaSource;

export type DatabaseProperty = {
  columnName?: string;
  columnRequired?: boolean;
  nullable?: boolean;
};

export type DatabaseField = BaseApplicationField & DatabaseProperty;

export interface DatabaseRelationship extends BaseApplicationRelationship, DatabaseProperty {
  shouldWriteJoinTable?: boolean;

  joinTable?: {
    name: string;
    constraintName?: string;
    otherConstraintName?: string;
  };

  joinColumnNames?: string[];
}

export interface DatabaseEntity<F extends DatabaseField = DatabaseField, R extends DatabaseRelationship = DatabaseRelationship>
  extends BaseApplicationEntity<F, R> {
  entityTableName: string;
}
type Property = {
  liquibaseGenerateFakeData?: boolean;
} & DatabaseProperty;

export interface Relationship extends BaseEntityChangesRelationship, DatabaseRelationship, Property {
  columnDataType?: string;

  onDelete?: string;
  onUpdate?: string;

  shouldWriteRelationship?: boolean;

  unique?: boolean;
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

    uniqueConstraintName?: string;
  };

export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends BaseEntityChangesEntity<F, R>,
    JavaEntity<F, R>,
    DatabaseEntity<F, R> {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
}

export type Application<E extends Entity> = JavaApplication<E> & {
  liquibaseDefaultSchemaName: string;
  liquibaseAddH2Properties: boolean;
};
