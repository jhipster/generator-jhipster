import type { Entity } from '../base-application/index.mjs';

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type LiquibaseEntity = Entity & {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
};
