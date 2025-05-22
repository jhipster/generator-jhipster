import type { BaseFeatures as YeomanFeatures } from 'yeoman-generator';
import type CoreGenerator from '../base-core/index.js';
import type { ApplicationType } from '../../lib/types/application/application.js';
import type { Entity } from '../../lib/types/application/entity.js';
import type { ApplicationOptions } from '../../lib/types/application/options.js';
import type { Features as BaseFeatures, Options as BaseOptions } from '../base/types.d.ts';

export type ApplicationWithConfig = {
  config: Record<string, string | boolean | number | string[]>;
  entities: Record<string, unknown>;
};

export type JHipsterGeneratorOptions = BaseOptions &
  ApplicationOptions & {
    /** boostrap options */
    applyDefaults?: <const data = any>(data: data) => data;

    /* generate-blueprint options */
    localBlueprint?: boolean;

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

export type JHipsterGeneratorFeatures = YeomanFeatures & BaseFeatures;

export type NeedleCallback = (content: string) => string;

export type EditFileCallback<Generator = CoreGenerator> = (this: Generator, content: string, filePath: string) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean; autoCrlf?: boolean };

export type CascatedEditFileCallback<Generator = CoreGenerator> = (
  ...callbacks: EditFileCallback<Generator>[]
) => CascatedEditFileCallback<Generator>;

type DataCallback<Type, DataType = ApplicationType<Entity>, Generator = CoreGenerator> = Type | ((this: Generator, data: DataType) => Type);

export type WriteFileTemplate<DataType = ApplicationType<Entity>, Generator = CoreGenerator> =
  | string
  | ((this: Generator, data: DataType) => string)
  | {
      condition?: DataCallback<boolean, DataType, Generator>;
      /** source file */
      sourceFile?: DataCallback<string, DataType, Generator>;
      /** destination file */
      destinationFile?: DataCallback<string, DataType, Generator>;
      /** @deprecated, use sourceFile instead */
      file?: DataCallback<string, DataType, Generator>;
      /** @deprecated, use destinationFile instead */
      renameTo?: string | ((this: Generator, data: DataType, filePath: string) => string);
      /** transforms (files processing) to be applied */
      transform?: boolean | (() => string)[];
      /** binary files skips ejs render, ejs extension and file transform */
      binary?: boolean;
      /** ejs options. Refer to https://ejs.co/#docs */
      options?: Record<string, object>;
      override?: DataCallback<boolean, DataType, Generator>;
    };

export type WriteFileBlock<DataType = ApplicationType<Entity>, Generator = CoreGenerator> = {
  /** relative path were sources are placed */
  from?: ((this: Generator, data: DataType) => string) | string;
  /** relative path were the files should be written, fallbacks to from/path */
  to?: ((this: Generator, data: DataType, filePath: string) => string) | string;
  path?: ((this: Generator, data: DataType) => string) | string;
  /** generate destinationFile based on sourceFile */
  renameTo?: (this: Generator, data: DataType, filePath: string) => string;
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
      sections: WriteFileSection<DataType, Generator> & { _?: { transform?: (() => string)[] } };
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
