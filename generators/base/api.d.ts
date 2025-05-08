import type { Simplify } from 'type-fest';
import type { ApplicationOptions } from '../../lib/types/application/options.js';
import type { JDLApplicationConfig } from '../../lib/jdl/core/types/parsing.js';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand, JHipsterConfigs } from '../../lib/command/types.js';
import type { CoreConfiguration, CoreFeatures, CoreOptions, EditFileCallback } from '../base-core/api.js';

export type ApplicationWithConfig = {
  config: Record<string, string | boolean | number | string[]>;
  entities: Record<string, unknown>;
};

export type BaseOptions = CoreOptions &
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  Simplify<ExportGeneratorOptionsFromCommand<typeof import('./command.js').default>> & {
    composeWithLocalBlueprint?: boolean;
  };

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type BaseConfiguration = CoreConfiguration & Simplify<ExportStoragePropertiesFromCommand<typeof import('./command.js').default>>;

export type JHipsterGeneratorOptions = BaseOptions &
  ApplicationOptions & {
    /* cli options */
    commandName: string;
    programName: string;
    createEnvBuilder?: any;
    devBlueprintEnabled?: boolean;

    /** @experimental */
    jdlDefinition?: JDLApplicationConfig;
    /** @experimental */
    commandsConfigs?: JHipsterConfigs;

    /* yeoman options */
    skipYoResolve?: boolean;
    force?: boolean;

    /* base options */
    applicationWithConfig?: ApplicationWithConfig;
    /**
     * @deprecated
     */
    applicationWithEntities?: any;
    skipWriting?: boolean;
    entities?: string[];

    /** boostrap options */
    applyDefaults?: <const data = any>(data: data) => data;

    /* generate-blueprint options */
    localBlueprint?: boolean;

    /* jdl generator options */
    jdlFile?: string;

    /* application options */
    db?: string;

    /* workspaces options */
    generateApplications?: boolean;
    generateWorkspaces?: boolean;
    generateWith?: string;
    monorepository?: boolean;
    workspaces?: boolean;
    workspacesFolders?: string[];
  };

export type JHipsterGeneratorFeatures = CoreFeatures & {
  priorityArgs?: boolean;
  /**
   * Wraps write context and shows removed fields and replacements if exists.
   */
  sbsBlueprint?: boolean;
  checkBlueprint?: boolean;
  /**
   * Disable skipPriorities flag.
   */
  disableSkipPriorities?: boolean;
  /**
   * Compose with bootstrap generator.
   *
   * Bootstrap generator adds support to:
   *  - multistep templates.
   *  - sort jhipster configuration json.
   *  - force jhipster configuration commit.
   *  - earlier prettier config commit for correct prettier.
   *  - prettier and eslint.
   */
  jhipsterBootstrap?: boolean;

  /**
   * Create transforms for commit.
   */
  commitTransformFactory?: () => any;

  /**
   * Queue tasks to handle command definitions.
   *  - parse options and configurations from cli.
   *  - prompt configurations.
   *  - configure configurations.
   *  - compose with generators defined in command.
   *  - load configurations.
   *
   * Defaults to true for built-in generator-jhipster generators and false for blueprints.
   */
  queueCommandTasks?: boolean;
};

export type NeedleCallback = (content: string) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean; autoCrlf?: boolean };

export type CascatedEditFileCallback<Generator> = (...callbacks: EditFileCallback<Generator>[]) => CascatedEditFileCallback<Generator>;

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};
