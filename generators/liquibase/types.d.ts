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

export { BaseEntityChangesRelationship as Relationship };

export type Field = BaseEntityChangesField &
  JavaField & {
    columnRequired?: boolean;
    columnType?: LiquibaseColumnType;
    loadColumnType?: LiquibaseLoadColumnType;

    defaultValue: any;
    defaultValueComputed: any;

    shouldDropDefaultValue?: boolean;
    shouldCreateContentType?: boolean;

    liquibaseDefaultValueAttributeValue?: string;
    liquibaseDefaultValueAttributeName?: string;
    liquibaseGenerateFakeData?: boolean;

    nullable?: boolean;
  };

export interface Entity<F extends Field = Field, R extends BaseEntityChangesRelationship = BaseEntityChangesRelationship>
  extends BaseEntityChangesEntity<F, R>,
    JavaEntity<F, R> {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
}

export type Application<E extends Entity> = JavaApplication<E> & {
  liquibaseDefaultSchemaName: string;
};
