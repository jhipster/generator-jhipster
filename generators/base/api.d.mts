import type { OptionConfig, GeneratorOptions, GeneratorFeatures, ArgumentConfig } from 'yeoman-generator';

export type ApplicationWithConfig = {
  config: {
    [key: string]: string | boolean | number | string[];
  };
  entities: Record<string, unknown>;
};

export interface JHipsterGeneratorOptions extends GeneratorOptions {
  applicationWithConfig?: ApplicationWithConfig;
}

export interface JHipsterGeneratorFeatures extends GeneratorFeatures {
  priorityArgs?: boolean;
}

// eslint-disable-next-line no-use-before-define
export type EditFileCallback<Generator> = (this: Generator, content: string, filePath: string) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean };

export type CascatedEditFileCallback<Generator> = (...callbacks: EditFileCallback<Generator>[]) => CascatedEditFileCallback<Generator>;

export type WriteFileTemplate<Generator, DataType> =
  | string
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

export type WriteFileBlock<Generator, DataType> = {
  /** relative path were sources are placed */
  from?: ((this: Generator, data: DataType) => string) | string;
  /** relative path were the files should be written, fallbacks to from/path */
  to?: ((this: Generator, data: DataType) => string) | string;
  path?: ((this: Generator, data: DataType) => string) | string;
  /** generate destinationFile based on sourceFile */
  renameTo?: ((this: Generator, data: DataType, filePath: string) => string) | string;
  /** condition to enable to write the block */
  condition?: (this: Generator, data: DataType) => boolean | undefined;
  /** transforms (files processing) to be applied */
  transform?: (() => string)[];
  templates: WriteFileTemplate<Generator, DataType>[];
};

export type WriteFileSection<Generator, DataType> = Record<string, WriteFileBlock<Generator, DataType>[]>;

export type WriteFileOptions<Generator, DataType> = {
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

export type JHipsterOption = OptionConfig & {
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

export type JHipsterArgumentConfig = ArgumentConfig;

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterCommandDefinition = {
  arguments?: JHipsterArguments;
  options: JHipsterOptions;
  import?: string[];
  loadGeneratorOptions?: boolean;
};
