import type { ArgumentSpec, BaseFeatures, BaseOptions, CliOptionSpec } from 'yeoman-generator';
import type { RequireAtLeastOne, SetOptional, TaggedUnion } from 'type-fest';
import type CoreGenerator from '../base-core/index.js';

type ConfigScope = 'storage' | 'blueprint' | 'control' | 'generator';
type CliSpecType = CliOptionSpec['type'];

export type ApplicationWithConfig = {
  config: Record<string, string | boolean | number | string[]>;
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

export type WriteFileTemplate<Generator = CoreGenerator, DataType = any> =
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

  /** @experimental Customize templates sourceFile and destinationFile */
  customizeTemplatePath?: (file: {
    sourceFile: string;
    resolvedSourceFile: string;
    destinationFile: string;
  }) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string };
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

export type JHispterChoices = readonly string[] | readonly { value: string; name: string }[];

export type JHipsterOption = SetOptional<CliOptionSpec, 'name'> & {
  readonly name?: string;
  readonly scope?: 'storage' | 'blueprint' | 'control' | 'generator';
  readonly env?: string;
  readonly choices?: JHispterChoices;
};

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};

export type PromptSpec = {
  readonly type: 'input' | 'list' | 'confirm' | 'checkbox';
  readonly message: string | ((any) => string);
  readonly when?: boolean | ((any) => boolean);
  readonly default?: any | ((any) => any);
  readonly filter?: any | ((any) => any);
  readonly transformer?: any | ((any) => any);
  readonly validate?: any | ((any) => any);
};

export type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'> & { scope?: 'storage' | 'blueprint' | 'generator' };

export type ConfigSpec = {
  readonly description?: string;
  readonly choices?: JHispterChoices;

  readonly cli?: SetOptional<CliOptionSpec, 'name'> & { env?: string };
  readonly argument?: JHipsterArgumentConfig;
  readonly prompt?:
    | PromptSpec
    | ((gen: CoreGenerator & { jhipsterConfigWithDefaults: Record<string, any> }, config: ConfigSpec) => PromptSpec);
  readonly scope?: 'storage' | 'blueprint' | 'generator';
  /**
   * The callback receives the generator as input for 'generator' scope.
   * The callback receives jhipsterConfigWithDefaults as input for 'storage' (default) scope.
   * The callback receives blueprintStorage contents as input for 'blueprint' scope.
   *
   * Default value will not be applied to generator (using 'generator' scope) in initializing priority. Use cli.default instead.
   * Default value will be application to templates context object (application) in loading priority.
   */
  readonly default?:
    | string
    | boolean
    | number
    | readonly string[]
    | ((this: CoreGenerator | void, ctx: any) => string | boolean | number | readonly string[]);
  /**
   * Configure the generator according to the selected configuration.
   */
  readonly configure?: (gen: CoreGenerator) => void;
};

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterConfigs = Record<string, RequireAtLeastOne<ConfigSpec, 'argument' | 'cli' | 'prompt'>>;

export type JHipsterCommandDefinition = {
  readonly arguments?: JHipsterArguments;
  readonly options?: JHipsterOptions;
  readonly configs?: JHipsterConfigs;
  /**
   * Import options from a generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  readonly import?: readonly string[];
  /**
   * @experimental
   * Compose with generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  readonly compose?: readonly string[];
  /**
   * Override options from the generator been blueprinted.
   */
  readonly override?: boolean;
  /**
   * Load old options definition (yeoman's `this.options()`) from the generator.
   */
  readonly loadGeneratorOptions?: boolean;
};

/**
 * A simplified version of the `JHipsterCommandDefinition` type for types parsing.
 */
type ParseableConfig = {
  type?: CliSpecType;
  cli?: {
    type: CliSpecType;
  };
  scope: ConfigScope;
};
type ParseableCommand = {
  readonly options?: Record<any, ParseableConfig>;
  readonly configs?: Record<any, ParseableConfig>;
};

/** Extract contructor return type, eg: Boolean, String */
type ConstructorReturn<T> = T extends new () => infer R ? R : any;
type FilteredConfigScope = ConfigScope | undefined;
/** Add name to Options/Configs */
type TaggedParseableConfigUnion<D> = D extends Record<string, any> ? TaggedUnion<'name', D> : never;
/** Get union of Options and Configs */
type CommandUnion<C extends ParseableCommand> = TaggedParseableConfigUnion<C['configs']> | TaggedParseableConfigUnion<C['options']>;
type GetType<C extends ParseableConfig> =
  C extends Record<'type', CliSpecType> ? C['type'] : C extends Record<'cli', Record<'type', CliSpecType>> ? C['cli']['type'] : never;
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
type WrapperToPrimitive<T> = T extends boolean ? Boolean : T extends String ? string : T extends Number ? number : T;

type UnionToObject<U extends { name: string; scope: ConfigScope }> = {
  [K in U as K['name']]?: WrapperToPrimitive<ConstructorReturn<GetType<K>>>;
};

/** Filter Options/Config by scope */
type FilterScope<D, S extends FilteredConfigScope> =
  D extends Record<'scope', S> ? D : D extends Record<'scope', ConfigScope> ? never : S extends undefined ? D : never;

export type ExportStoragePropertiesFromCommand<C extends ParseableCommand> = UnionToObject<FilterScope<CommandUnion<C>, 'storage'>>;

export type ExportGeneratorPropertiesFromCommand<C extends ParseableCommand> = UnionToObject<FilterScope<CommandUnion<C>, 'generator'>>;

export type ExportControlPropertiesFromCommand<C extends ParseableCommand> = UnionToObject<FilterScope<CommandUnion<C>, 'control'>>;

export type ExportBlueprintPropertiesFromCommand<C extends ParseableCommand> = UnionToObject<FilterScope<CommandUnion<C>, 'blueprint'>>;
