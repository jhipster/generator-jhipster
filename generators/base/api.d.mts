import type { BaseOptions, BaseFeatures, ArgumentSpec, CliOptionSpec } from 'yeoman-generator';
import { SetOptional } from 'type-fest';
import type CoreGenerator from '../base-core/index.mjs';

export type ApplicationWithConfig = {
  config: {
    [key: string]: string | boolean | number | string[];
  };
  entities: Record<string, unknown>;
};

export type JHipsterGeneratorOptions = BaseOptions & {
  applicationWithConfig?: ApplicationWithConfig;
  positionalArguments: unknown[];
  jhipsterContext?: any;
  skipYoResolve?: boolean;
  ignoreErrors?: boolean;
  commandName: string;
  applicationWithEntities?: any;
  blueprints?: string;
  blueprint?: any;
  configOptions: any;
  reproducible?: boolean;
  applicationId?: string;
  sharedData: any;
  ignoreNeedlesError?: boolean;
  skipPriorities?: string[];
  skipWriting?: boolean;
  entities?: string[];
  localBlueprint?: boolean;
  baseName?: string;
  db?: string;
  applicationType?: string;
  skipUserManagement?: boolean;
  force?: boolean;
  skipDbChangelog?: boolean;
  jdlFile?: string;
  recreateInitialChangelog?: boolean;
  monorepository?: boolean;
};

export type JHipsterGeneratorFeatures = BaseFeatures & {
  priorityArgs?: boolean;
  jhipster7Migration?: boolean;
  sbsBlueprint?: boolean;
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
      transform?: (() => string)[];
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
  transform?: (() => string)[];
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

export type JHipsterOption = SetOptional<CliOptionSpec, 'name'> & {
  name?: string;
  scope?: 'storage' | 'blueprint' | 'control' | 'generator';
  env?: string;
};

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};

export type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'>;

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterCommandDefinition = {
  arguments?: JHipsterArguments;
  options: JHipsterOptions;
  import?: string[];
  loadGeneratorOptions?: boolean;
};
