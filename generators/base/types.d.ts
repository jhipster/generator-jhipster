/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ExportGeneratorOptionsFromCommand } from '../../lib/command/types.js';
import type { Config as CoreConfig, Features as CoreFeatures, Options as CoreOptions } from '../base-core/types.js';
import type { ApplicationWithConfig } from './api.js';

export type CleanupArgumentType = Record<string, (string | [boolean, ...string[]])[]>;

export type Control = {
  readonly existingProject: boolean;
  readonly jhipsterOldVersion: string | null;
  readonly enviromentHasDockerCompose?: boolean;
  readonly customizeRemoveFiles: ((file: string) => string | undefined)[];
  /**
   * Check if the JHipster version used to generate an existing project is less than the passed version argument
   *
   * @param {string} version - A valid semver version string
   */
  isJhipsterVersionLessThan(version: string): boolean;
  removeFiles: (options: { oldVersion?: string; removedInVersion: string } | string, ...files: string[]) => Promise<void>;
  /**
   * Cleanup files conditionally based on version and condition.
   * @example
   * cleanupFiles({ '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   * @example
   * cleanupFiles('4.0.0', { '6.0.0': ['file1', 'file2', [application.shouldRemove, 'file3']] })
   */
  cleanupFiles: (cleanup: CleanupArgumentType) => Promise<void> | ((oldVersion: string, cleanup: CleanupArgumentType) => Promise<void>);
};

export type Config = CoreConfig & {
  jhipsterVersion?: string;
  lastLiquibaseTimestamp?: number;
  blueprints?: { name: string; version?: string }[];
};

export type Options = CoreOptions &
  ExportGeneratorOptionsFromCommand<typeof import('./command.js').default> & {
    /* base options */
    applicationWithConfig?: ApplicationWithConfig;
    /**
     * @deprecated
     */
    applicationWithEntities?: any;
    reproducibleTests?: boolean;
    skipWriting?: boolean;
    entities?: string[];

    jhipsterContext?: any;
    composeWithLocalBlueprint?: boolean;
  };

export type Features = CoreFeatures & {
  /**
   * Indicates if the generator is a side-by-side blueprint.
   */
  sbsBlueprint?: boolean;
  /**
   * Check if the generator is composed as a blueprint.
   */
  checkBlueprint?: boolean;

  /**
   * Store current version at .yo-rc.json.
   * Defaults to true.
   */
  storeJHipsterVersion?: boolean;

  /**
   * Store current version at .yo-rc.json.
   * Defaults to true.
   */
  storeBlueprintVersion?: boolean;
};
