import type { Entity } from '../base-application/index.js';
import type { ExportControlPropertiesFromCommand } from '../../lib/command/index.js';
import type command from './command.ts';

type BaseApplicationControlProperties = ExportControlPropertiesFromCommand<typeof command>;

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
  filterEntitiesForClient?: (entity: Entity[]) => Entity[];
  filterEntitiesAndPropertiesForClient?: (entity: Entity[]) => Entity[];
  customizeRemoveFiles: ((file: string) => string | undefined)[];
  removeFiles: (options: { removedInVersion: string } | string, ...files: string[]) => Promise<void>;
  /**
   * Cleanup files conditionally based on version and condition.
   * @example
   * cleanupFiles({ '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   */
  cleanupFiles: (cleanup: Record<string, (string | [boolean, ...string[]])[]>) => Promise<void>;
  getWebappTranslation?: (s: string, data?: Record<string, any>) => string;
};
