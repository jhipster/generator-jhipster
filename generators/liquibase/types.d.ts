import type { Source as BaseApplicationSource, Entity } from '../base-entity-changes/index.js';
import type { Source as GradleSource } from '../gradle/types.js';
import type { Source as MavenSource } from '../maven/types.js';
import type { SpringBootSource } from '../server/types.js';

export type LiquibaseChangelog = { changelogName: string };
export type LiquibaseChangelogSection = LiquibaseChangelog & { section?: 'base' | 'incremental' | 'constraints' };

export type LiquibaseSourceType = BaseApplicationSource & {
  addLiquibaseChangelog?(changelog: LiquibaseChangelogSection): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};

export type Source = LiquibaseSourceType & SpringBootSource & GradleSource & MavenSource;

export type LiquibaseEntity = Entity & {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
};
