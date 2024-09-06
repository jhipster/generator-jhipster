import type { BaseFeatures, BaseOptions, CliOptionSpec } from 'yeoman-generator';
import type CoreGenerator from '../base-core/index.js';
import type { ApplicationType } from '../../lib/types/application/application.js';
import type { Entity } from '../../lib/types/application/entity.js';

type ConfigScope = 'storage' | 'blueprint' | 'control' | 'generator';
type CliSpecType = CliOptionSpec['type'];

export type ApplicationWithConfig = {
  config: Record<string, string | boolean | number | string[]>;
  entities: Record<string, unknown>;
};

export type JHipsterGeneratorOptions = BaseOptions & {
  /* cli options */
  commandName: string;
  programName: string;
  positionalArguments?: unknown[];
  createEnvBuilder?: any;

  /* yeoman options */
  skipYoResolve?: boolean;
  sharedData: any;
  force?: boolean;

  /* base options */
  defaults?: boolean;
  applicationId?: string;
  applicationWithConfig?: ApplicationWithConfig;
  /**
   * @deprecated
   */
  applicationWithEntities?: any;
  creationTimestamp?: string;
  ignoreErrors?: boolean;
  ignoreNeedlesError?: boolean;
  reproducible?: boolean;
  reproducibleTests?: boolean;
  skipPriorities?: string[];
  skipWriting?: boolean;
  entities?: string[];
  disableBlueprints?: boolean;

  /* Init based application */
  fromInit?: boolean;

  /* blueprint options */
  blueprints?: string;
  blueprint?: any;
  jhipsterContext?: any;
  composeWithLocalBlueprint?: boolean;

  /* generate-blueprint options */
  localBlueprint?: boolean;

  /* jdl generator options */
  jdlFile?: string;

  /* application options */
  baseName?: string;
  db?: string;
  applicationType?: string;
  skipUserManagement?: boolean;
  skipDbChangelog?: boolean;
  recreateInitialChangelog?: boolean;

  /* workspaces options */
  generateApplications?: boolean;
  generateWorkspaces?: boolean;
  generateWith?: string;
  monorepository?: boolean;
  workspaces?: boolean;
  workspacesFolders?: string[];
};

export type JHipsterGeneratorFeatures = BaseFeatures & {
  priorityArgs?: boolean;
  /**
   * Wraps write context and shows removed fields and replacements if exists.
   */
  jhipster7Migration?: boolean | 'verbose' | 'silent';
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
   * Store current version at .yo-rc.json.
   * Defaults to true.
   */
  storeJHipsterVersion?: boolean;

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

export type EditFileCallback<Generator = CoreGenerator> = (this: Generator, content: string, filePath: string) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean };

export type CascatedEditFileCallback<Generator = CoreGenerator> = (
  ...callbacks: EditFileCallback<Generator>[]
) => CascatedEditFileCallback<Generator>;

export type WriteFileTemplate<DataType = ApplicationType<Entity>, Generator = CoreGenerator> =
  | string
  | ((this: Generator, data: DataType, filePath: string) => string)
  | {
      /** source file */
      sourceFile?: string | ((this: Generator, data: DataType) => string);
      /** destination file */
      destinationFile?: string | ((this: Generator, destinationFile: DataType) => string);
      /** @deprecated, use sourceFile instead */
      file?: string | ((this: Generator, data: DataType) => string);
      /** @deprecated, use destinationFile instead */
      renameTo?: string | ((this: Generator, data: DataType, filePath: string) => string);
      /** transforms (files processing) to be applied */
      transform?: boolean | (() => string)[];
      /** binary files skips ejs render, ejs extension and file transform */
      binary?: boolean;
      /** ejs options. Refer to https://ejs.co/#docs */
      options?: Record<string, object>;
      override?: boolean | ((this: Generator, data: DataType) => boolean);
    };

export type WriteFileBlock<DataType = ApplicationType<Entity>, Generator = CoreGenerator> = {
  /** relative path were sources are placed */
  from?: ((this: Generator, data: DataType) => string) | string;
  /** relative path were the files should be written, fallbacks to from/path */
  to?: ((this: Generator, data: DataType, filePath: string) => string) | string;
  path?: ((this: Generator, data: DataType) => string) | string;
  /** generate destinationFile based on sourceFile */
  renameTo?: ((this: Generator, data: DataType, filePath: string) => string) | string;
  /** condition to enable to write the block */
  condition?: (this: Generator, data: DataType) => boolean | undefined;
  /** transforms (files processing) to be applied */
  transform?: boolean | (() => string)[];
  templates: WriteFileTemplate<DataType, Generator>[];
};

export type WriteFileSection<DataType = ApplicationType<Entity>, Generator = CoreGenerator> = Record<
  string,
  WriteFileBlock<DataType, Generator>[]
>;

export type WriteFileOptions<DataType = ApplicationType<Entity>, Generator = CoreGenerator> = {
  /** transforms (files processing) to be applied */
  transform?: EditFileCallback<Generator>[];
  /** context to be used as template data */
  context?: any;
  /** config passed to render methods */
  renderOptions?: Record<string, object>;
  /**
   * path(s) to look for templates.
   * Single absolute path or relative path(s) between the templates folder and template path.
   */
  rootTemplatesPath?: string | string[];

  /** @experimental Customize templates sourceFile and destinationFile */
  customizeTemplatePath?: (file: {
    sourceFile: string;
    resolvedSourceFile: string;
    destinationFile: string;
  }) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string };
} & (
  | {
      sections: WriteFileSection<DataType, Generator>;
    }
  | {
      /** templates to be written */
      templates: WriteFileTemplate<DataType, Generator>[];
    }
  | {
      /** blocks to be written */
      blocks: WriteFileBlock<DataType, Generator>[];
    }
);

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};
