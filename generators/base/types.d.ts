import type { Entity } from '../base-application/index.js';
import type { ExportControlPropertiesFromCommand } from '../../lib/command/index.js';
import type { GetWebappTranslationCallback } from '../../lib/types/base/translation.js';
import type command from './command.ts';

type BaseApplicationControlProperties = ExportControlPropertiesFromCommand<typeof command>;

export type CleanupArgumentType = Record<string, (string | [boolean, ...string[]])[]>;

export type Control = BaseApplicationControlProperties & {
  existingProject: boolean;
  ignoreNeedlesError: boolean;
  jhipsterOldVersion: string | null;
  useVersionPlaceholders?: boolean;
  /**
   * Configure blueprints once per application.
   */
  blueprintConfigured?: boolean;
  reproducibleLiquibaseTimestamp?: Date;
  enviromentHasDockerCompose?: boolean;
  filterEntitiesForClient?: (entity: Entity[]) => Entity[];
  filterEntitiesAndPropertiesForClient?: (entity: Entity[]) => Entity[];
  filterEntityPropertiesForClient?: (entity: Entity) => Entity;
  customizeRemoveFiles: ((file: string) => string | undefined)[];
  removeFiles: (options: { removedInVersion: string } | string, ...files: string[]) => Promise<void>;
  /**
   * Cleanup files conditionally based on version and condition.
   * @example
   * cleanupFiles({ '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   * @example
   * cleanupFiles('4.0.0', { '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   */
  cleanupFiles: (cleanup: CleanupArgumentType) => Promise<void> | ((oldVersion: string, cleanup: CleanupArgumentType) => Promise<void>);
  getWebappTranslation?: GetWebappTranslationCallback;
};
