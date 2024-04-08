import type { BaseOptions, BaseFeatures, ArgumentSpec, CliOptionSpec } from 'yeoman-generator';
import type { SetOptional } from 'type-fest';
import type CoreGenerator from '../base-core/index.js';

export type ApplicationWithConfig = {
  config: {
    [key: string]: string | boolean | number | string[];
  };
  entities: Record<string, unknown>;
};

export type JHipsterGeneratorOptions = BaseOptions & {
  /* cli options */
  commandName: string;
  positionalArguments?: unknown[];

  /* yeoman options */
  skipYoResolve?: boolean;
  sharedData: any;
  force?: boolean;

  /* base options */
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
  jhipster7Migration?: boolean;
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
};

// eslint-disable-next-line no-use-before-define
export type EditFileCallback<Generator = CoreGenerator> = (this: Generator, content: string, filePath: string) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean };

export type CascatedEditFileCallback<Generator = CoreGenerator> = (
  ...callbacks: EditFileCallback<Generator>[]
) => CascatedEditFileCallback<Generator>;

export type WriteFileTemplate<Generator = CoreGenerator, DataType = any> =
  | string
  | ((this: Generator, data: DataType, filePath: string) => string)
  | {
      /** source file */
      sourceFile?: ((this: Generator, data: DataType) => string) | string;
      /** destination file */
      destinationFile?: (this: Generator, destinationFile: DataType) => string | string;
      /** @deprecated, use sourceFile instead */
      file?: ((this: Generator, data: DataType) => string) | string;
      /** @deprecated, use destinationFile instead */
      renameTo?: ((this: Generator, data: DataType, filePath: string) => string) | string;
      /** transforms (files processing) to be applied */
      transform?: boolean | (() => string)[];
      /** binary files skips ejs render, ejs extension and file transform */
      binary?: boolean;
      /** ejs options. Refer to https://ejs.co/#docs */
      options?: Record<string, object>;
      override?: (this: Generator, data: DataType) => boolean;
    };

export type WriteFileBlock<Generator = CoreGenerator, DataType = any> = {
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
  templates: WriteFileTemplate<Generator, DataType>[];
};

export type WriteFileSection<Generator = CoreGenerator, DataType = any> = Record<string, WriteFileBlock<Generator, DataType>[]>;

export type WriteFileOptions<Generator = CoreGenerator, DataType = any> = {
  /** transforms (files processing) to be applied */
  transform?: EditFileCallback<Generator>[];
  /** context to be used as template data */
  context?: DataType;
  /** config passed to render methods */
  renderOptions?: Record<string, object>;
  /**
   * path(s) to look for templates.
   * Single absolute path or relative path(s) between the templates folder and template path.
   */
  rootTemplatesPath?: string | string[];
} & (
  | {
      sections: WriteFileSection<Generator, DataType>;
    }
  | {
      /** templates to be written */
      templates: WriteFileTemplate<Generator, DataType>;
    }
  | {
      /** blocks to be written */
      blocks: WriteFileBlock<Generator, DataType>[];
    }
);

export type JHispterChoices = string[] | { value: string; name: string }[];

export type JHipsterOption = SetOptional<CliOptionSpec, 'name'> & {
  name?: string;
  scope?: 'storage' | 'blueprint' | 'control' | 'generator';
  env?: string;
  choices?: JHispterChoices;
};

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};

export type PromptSpec = {
  type: 'input' | 'list' | 'confirm' | 'checkbox';
  message: string | ((any) => string);
  when?: boolean | ((any) => boolean);
  default?: any | ((any) => any);
  filter?: any | ((any) => any);
  transformer?: any | ((any) => any);
  validate?: any | ((any) => any);
};

export type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'> & { scope?: 'storage' | 'blueprint' | 'generator' };

export type ConfigSpec = {
  description?: string;
  choices?: JHispterChoices;

  cli?: SetOptional<CliOptionSpec, 'name'>;
  argument?: JHipsterArgumentConfig;
  prompt?: PromptSpec | ((CoreGenerator) => PromptSpec);
  scope?: 'storage' | 'blueprint' | 'generator';
  /**
   * The callback receives the generator as input for 'generator' scope.
   * The callback receives jhipsterConfigWithDefaults as input for 'storage' (default) scope.
   * The callback receives blueprintStorage contents as input for 'blueprint' scope.
   */
  default?: string | boolean | string[] | ((any) => string | boolean | string[]);
};

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterConfigs = Record<string, ConfigSpec>;

export type JHipsterCommandDefinition = {
  arguments?: JHipsterArguments;
  options?: JHipsterOptions;
  configs?: JHipsterConfigs;
  /**
   * Import options from a generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  import?: string[];
  /**
   * @experimental
   * Compose with generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  compose?: string[];
  /**
   * Override options from the generator been blueprinted.
   */
  override?: boolean;
  /**
   * Load old options definition (yeoman's `this.options()`) from the generator.
   */
  loadGeneratorOptions?: boolean;
};
