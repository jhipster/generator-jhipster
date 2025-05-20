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
