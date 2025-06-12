import type { Entity as BaseEntityChangesEntity, Source as BaseEntityChangesSource } from '../base-entity-changes/index.js';
import type { Source as JavaSource } from '../java/types.js';

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = BaseEntityChangesSource & {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type Source = LiquibaseSourceType & JavaSource;

export type Entity = BaseEntityChangesEntity & {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
};
