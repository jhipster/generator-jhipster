import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/index.ts';
import type {
  Entity as BaseEntityChangesEntity,
  Field as BaseEntityChangesField,
  Relationship as BaseEntityChangesRelationship,
  Source as BaseEntityChangesSource,
} from '../base-entity-changes/index.js';
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

export interface DatabaseEntity<
  F extends BaseApplicationField = BaseApplicationField,
  R extends BaseApplicationRelationship = BaseApplicationRelationship,
> extends BaseApplicationEntity<F, R> {
  entityTableName: string;
}

type Property = {
  columnRequired?: boolean;
  liquibaseGenerateFakeData?: boolean;
  nullable?: boolean;
};

export interface Relationship extends BaseEntityChangesRelationship, Property {
  columnName?: string;
  columnDataType?: string;

  onDelete?: boolean;
  onUpdate?: boolean;

  shouldWriteRelationship?: boolean;
  shouldWriteJoinTable?: boolean;

  joinTable?: {
    name: string;
    constraintName?: string;
    otherConstraintName?: string;
  };
}

export type Field = BaseEntityChangesField &
  Property &
  JavaField & {
    columnType?: LiquibaseColumnType;
    loadColumnType?: LiquibaseLoadColumnType;

    defaultValue: any;
    defaultValueComputed: any;

    shouldDropDefaultValue?: boolean;
    shouldCreateContentType?: boolean;

    liquibaseDefaultValueAttributeValue?: string;
    liquibaseDefaultValueAttributeName?: string;
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
};
