// eslint-disable-next-line no-use-before-define
export type EditFileCallback<Generator> = (this: Generator, content: string, filePath: string) => CascatedEditFileCallback<Generator>;

export type CascatedEditFileCallback<Generator> = (...callbacks: EditFileCallback<Generator>) => CascatedEditFileCallback<Generator>;

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
  condition?: (this: Generator, data: DataType) => boolean | boolean;
  /** transforms (files processing) to be applied */
  transform?: (() => string)[];
  templates: WriteFileTemplate<Generator, DataType>[];
};

export type WriteFileSection<Generator, DataType> = Record<string, WriteFileBlock<Generator, DataType>[]> & {
  _?: {
    transform?: EditFileCallback<Generator>[];
  };
};

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
      blocks: WriteFileBlock<Generator, DataType>;
    }
);
