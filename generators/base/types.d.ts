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
  customizeRemoveFiles: Array<(file: string) => string | undefined>;
  removeFiles: (options: { removedInVersion: string } | string, ...files: string[]) => Promise<void>;
  cleanupFiles: (cleanup: Record<string, string[]>) => Promise<void>;
};
