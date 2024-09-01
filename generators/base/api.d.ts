import type { ArgumentSpec, BaseFeatures, BaseOptions, CliOptionSpec } from 'yeoman-generator';
import type { RequireAtLeastOne, SetOptional, Simplify, TaggedUnion, TupleToUnion, ValueOf } from 'type-fest';
import type CoreGenerator from '../base-core/index.js';
import { MergeUnion } from './internal/merge-union.js';

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

export type JHispterChoices = readonly [...(string | { value: string; name: string })[]];

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
  readonly type?: CliSpecType;
  readonly cli?: {
    readonly type: CliSpecType;
  };
  readonly choices?: JHispterChoices;
  readonly scope: ConfigScope;
};

type ParseableConfigs = Record<string, ParseableConfig>;

type ParseableCommand = {
  readonly options?: ParseableConfigs;
  readonly configs?: ParseableConfigs;
};

/** Extract contructor return type, eg: Boolean, String */
type ConstructorReturn<T> = T extends new () => infer R ? R : undefined;
type FilteredConfigScope = ConfigScope | undefined;
/** Add name to Options/Configs */
type TaggedParseableConfigUnion<D> = D extends Record<string, any> ? Simplify<TaggedUnion<'name', D>> : never;

/**
 * @example
 * ```ts
 * type MergedConfigsOptions = MergeConfigsOptions<{
 *   configs: { clientFramework: { type: 'string'; scope: 'storage'; choices: ['angular', 'no'] } };
 *   options: { clientTestFramework: { type: 'string'; scope: 'storage'; choices: ['cypress', 'no'] } };
 * }>
 * ```
 */
type MergeConfigsOptions<D extends ParseableCommand> = Simplify<
  D extends { configs: ParseableConfigs }
    ? { [K in keyof D['configs']]: D['configs'][K] }
    : never & D extends { options: ParseableConfigs }
      ? { [K in keyof D['options']]: D['options'][K] }
      : never
>;

type GetType<C extends ParseableConfig> =
  C extends Record<'type', CliSpecType> ? C['type'] : C extends Record<'cli', Record<'type', CliSpecType>> ? C['cli']['type'] : undefined;
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
type WrapperToPrimitive<T> = T extends Boolean ? boolean : T extends String ? string : T extends Number ? number : T;

/*
 * @example
 * ```ts
 * DerivedPropertiesOf<'clientFramework', 'angular', 'angular', 'no'> =
 * { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; }
 * ```
 */
type DerivedPropertiesOf<P extends string, V extends string, C extends string> = Simplify<
  {
    [K in C as `${P}${Capitalize<K>}`]: K extends V ? true : false;
  } & Record<P, V> &
    Record<`${P}Any`, V extends 'no' ? false : true>
>;

type GetChoiceValue<Choice extends string | { value: string }> = Choice extends string
  ? Choice
  : Choice extends { value: string }
    ? Choice['value']
    : never;

/**
 * @example
 * type Normalized = NormalizeChoices<['angular', { value: 'no' }]>;
 * type Normalized = ['angular', 'no'];
 */
type NormalizeChoices<Choices extends readonly [...(string | { value: string })[]]> = {
  [Index in keyof Choices]: GetChoiceValue<Choices[Index]>;
};

/**
 * ```ts
 * type ExplodedConfigChoices = ExplodeConfigChoicesWithInference<['angular', 'no'], 'clientFramework'>;
 * type ExplodedConfigChoices =
 *   | { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; }
 *   | { clientFrameworkAngular: false; clientFrameworkNo: true; clientFramework: 'no'; clientFrameworkAny: true; }
 * ```
 */
type ExplodeConfigChoicesWithInference<Choices extends [...string[]], Property extends string> = ValueOf<{
  [Index in Exclude<keyof Choices, keyof any[]>]: Choices[Index] extends infer Choice
    ? Choice extends string
      ? DerivedPropertiesOf<Property, Choice, Choices[number]>
      : never
    : never;
}>;

/**
 * @example
 * ```ts
 * type ExplodedCommandChoices = ExplodeCommandChoicesWithInference<{ clientFramework: { choices: ['angular', 'no'] }, clientTestFramework: { choices: ['cypress', 'no'] } }>
 * {
 *   clientFramework:
 *     | { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; };
 *     | { clientFrameworkAngular: false; clientFrameworkNo: true; clientFramework: 'no'; clientFrameworkAny: false; }
 *   clientTestFramework:
 *     |{ clientTestFrameworkCypress: true; clientTestFrameworkNo: false; clientTestFramework: 'cypress'; clientTestFrameworkAny: true; };
 *     |{ clientTestFrameworkCypress: false; clientTestFrameworkNo: true; clientTestFramework: 'no'; clientTestFrameworkAny: false; };
 * }
 * ```
 */
type ExplodeCommandChoicesWithInference<U extends ParseableConfigs> = {
  [K in keyof U]: U[K] extends infer RequiredChoices
    ? RequiredChoices extends { choices: JHispterChoices }
      ? K extends infer StringKey
        ? StringKey extends string
          ? NormalizeChoices<RequiredChoices['choices']> extends infer NormalizedChoices
            ? // @ts-expect-error Mapped typle type is loosy https://github.com/microsoft/TypeScript/issues/27995
              Simplify<ExplodeConfigChoicesWithInference<NormalizedChoices, StringKey>>
            : never
          : never
        : never
      : never
    : never;
};

type DerivedPropertiesNoInferenceOf<Property extends string, Choices extends string> = Simplify<
  {
    [K in Choices as `${Property}${Capitalize<K>}`]: boolean;
  } & Record<Property, Choices[number] | undefined> &
    Record<`${Property}Any`, boolean>
>;

type ExplodeCommandChoicesNoInference<U extends ParseableConfigs> = {
  [K in keyof U]: U[K] extends infer RequiredChoices
    ? RequiredChoices extends { choices: any }
      ? K extends infer StringKey
        ? StringKey extends string
          ? NormalizeChoices<RequiredChoices['choices']> extends infer NormalizedChoices
            ? // @ts-expect-error Mapped typle type is loosy https://github.com/microsoft/TypeScript/issues/27995
              Simplify<DerivedPropertiesNoInferenceOf<StringKey, NormalizedChoices[number]>>
            : never
          : never
        : never
      : never
    : never;
};

type PrepareConfigsWithType<U extends ParseableConfigs> = Simplify<{
  [K in keyof U]?: U[K] extends Record<'choices', JHispterChoices>
    ? TupleToUnion<U[K]['choices']>
    : WrapperToPrimitive<ConstructorReturn<GetType<U[K]>>> extends infer T
      ? T extends undefined
        ? string
        : T
      : never;
}>;

/** Filter Options/Config by scope */
type FilterScope<D extends ParseableConfig, S extends FilteredConfigScope> =
  D extends Record<'scope', S> ? D : D extends Record<'scope', ConfigScope> ? never : S extends undefined ? D : never;

type FilterCommandScope<D extends ParseableConfigs, S extends FilteredConfigScope> = {
  [K in keyof D as FilterScope<D[K], S> extends D[K] ? K : never]: D[K];
};

/** Keep Options/Config filtered by choices */
type OnlyChoices<D, C extends boolean> = D extends { choices: JHispterChoices } ? (C extends true ? D : never) : C extends true ? never : D;

/** Keep Options/Config filtered by choices */
type OnlyCofigsWithChoice<D extends ParseableConfigs, C extends boolean> = {
  [K in keyof D as OnlyChoices<D[K], C> extends never ? never : K]: D[K];
};

export type ExportApplicationPropertiesFromCommand<C extends ParseableCommand> =
  MergeConfigsOptions<C> extends infer Merged
    ? Merged extends ParseableConfigs
      ? FilterCommandScope<Merged, 'storage'> extends infer F
        ? F extends ParseableConfigs
          ? // Add value inference to properties with choices
            // ? PrepareConfigsWithType<OnlyCofigsWithChoice<F, false>> & ValueOf<ExplodeCommandChoicesWithInference<OnlyCofigsWithChoice<F, true>>>
            Simplify<
              PrepareConfigsWithType<OnlyCofigsWithChoice<F, false>> &
                MergeUnion<ValueOf<ExplodeCommandChoicesNoInference<OnlyCofigsWithChoice<F, true>>>>
            >
          : never
        : never
      : never
    : never;

type ExportScopedPropertiesFromCommand<C extends ParseableCommand, S extends FilteredConfigScope> =
  MergeConfigsOptions<C> extends infer Merged
    ? Merged extends ParseableConfigs
      ? PrepareConfigsWithType<FilterCommandScope<Merged, S>>
      : never
    : never;

export type ExportStoragePropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'storage'>;

export type ExportGeneratorPropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'generator'>;

export type ExportControlPropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'control'>;

export type ExportBlueprintPropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'blueprint'>;
