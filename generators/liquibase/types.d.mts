export type LiquibaseChangelog = { changelogName: string };

export type LiquibaseSourceType = {
  addLiquibaseChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseIncrementalChangelog?(changelog: LiquibaseChangelog): void;
  addLiquibaseConstraintsChangelog?(changelog: LiquibaseChangelog): void;
};
