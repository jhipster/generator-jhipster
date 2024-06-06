import type { Entity } from '../base-application/index.ts';

export type Control = {
  existingProject: boolean;
  ignoreNeedlesError: boolean;
  jhipsterOldVersion: string | null;
  useVersionPlaceholders?: boolean;
  reproducible?: boolean;
  /**
   * Configure blueprints once per application.
   */
  blueprintConfigured?: boolean;
  reproducibleLiquibaseTimestamp?: Date;
  filterEntitiesForClient?: (entity: Entity[]) => Entity[];
  filterEntitiesAndPropertiesForClient?: (entity: Entity[]) => Entity[];
};
