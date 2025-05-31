import type { BaseEntityChangesSource, Entity } from '../base-entity-changes/index.js';
import type { GradleSourceType } from '../gradle/types.js';
import type { MavenSourceType } from '../maven/types.js';
import type { SpringBootSource } from '../server/types.js';

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = BaseEntityChangesSource & {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type Source = LiquibaseSourceType & SpringBootSource & GradleSourceType & MavenSourceType;

export type LiquibaseEntity = Entity & {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
};
