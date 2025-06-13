import type { ArgumentSpec, CliOptionSpec } from 'yeoman-generator';
import type { EmptyObject, IsNever, Replace, RequireAtLeastOne, SetOptional, Simplify, TupleToUnion, ValueOf } from 'type-fest';
import type { JHipsterOptionDefinition } from '../jdl/core/types/parsing.js';
import type { MergeUnion } from './support/merge-union.js';

type NormalizeValue<Input extends string> = Replace<Input, '[]', '', { all: true }>;

export type DerivedPropertiesOnlyOf<Property extends string, Choices extends string> = Simplify<{
  [K in Choices as `${Property}${Capitalize<NormalizeValue<K>>}`]: boolean;
}>;

/*
 * @example
 * ```ts
 * DerivedPropertiesOf<'clientFramework', 'angular' | 'no'> =
 * { clientFrameworkAngular: boolean; clientFrameworkNo: boolean; clientFramework: 'angular' | 'no'; clientFrameworkAny: boolean; }
 * ```
 */
export type DerivedPropertiesOf<Property extends string, Choices extends string> = Simplify<
  {
    [K in Choices as `${Property}${Capitalize<NormalizeValue<K>>}`]: boolean;
  } & Record<Property, Choices | undefined> &
    Record<`${Property}Any`, boolean>
>;

/*
 * @example
 * ```ts
 * DerivedPropertiesWithInferenceOf<'clientFramework', 'angular', 'angular', 'no'> =
 * { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; }
 * ```
 */
type DerivedPropertiesWithInferenceOf<P extends string, V extends string, C extends string> = Simplify<
  {
    [K in C as `${P}${Capitalize<K>}`]: K extends V ? true : false;
  } & Record<P, V> &
    Record<`${P}Any`, V extends 'no' ? false : true>
>;

/**
 * ```ts
 * type ExplodedConfigChoices = ExplodeDerivedPropertiesWithInference<['angular', 'no'], 'clientFramework'>;
 * type ExplodedConfigChoices =
 *   | { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; }
 *   | { clientFrameworkAngular: false; clientFrameworkNo: true; clientFramework: 'no'; clientFrameworkAny: true; }
 * ```
 */
export type DerivedPropertiesWithInferenceUnion<Choices extends [...string[]], Property extends string> = ValueOf<{
  [Index in Exclude<keyof Choices, keyof any[]>]: Choices[Index] extends infer Choice
    ? Choice extends string
      ? DerivedPropertiesWithInferenceOf<Property, Choice, Choices[number]>
      : never
    : never;
}>;

type CommandConfigScope = 'storage' | 'blueprint' | 'generator' | 'context' | 'none';

export type CommandConfigType = typeof String | typeof Boolean | typeof Number | typeof Object | ((opt: string) => any);

export type CommandConfigDefault<ConfigContext> =
  | string
  | boolean
  | number
  | readonly string[]
  | ((this: ConfigContext | void, ctx: any) => string | boolean | number | readonly string[]);

export type ConfigScope = CommandConfigScope;
type CliSpecType = CliOptionSpec['type'] | typeof Object;

export type JHipsterNamedChoice = { value: string; name: string };

export type JHipsterChoices = readonly [...(string | JHipsterNamedChoice)[]];

export type PromptSpec = {
  readonly type: 'input' | 'list' | 'confirm' | 'checkbox';
  readonly message: string | ((any) => string);
  readonly when?: boolean | ((any) => boolean);
  readonly default?: any | ((any) => any);
  readonly filter?: any | ((any) => any);
  readonly transformer?: any | ((any) => any);
  readonly validate?: any | ((any) => any);
};

type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'> & { scope?: CommandConfigScope };

type CliSpec = Omit<SetOptional<CliOptionSpec, 'name'>, 'storage'> & {
  env?: string;
  /**
   * Imply other options.
   */
  implies?: Record<string, any>;
};

export type ConfigSpec<ConfigContext> = {
  readonly description?: string;
  readonly choices?: JHipsterChoices;
  readonly cli?: CliSpec;
  readonly argument?: JHipsterArgumentConfig;
  readonly internal?: { type: CommandConfigType };
  readonly prompt?:
    | PromptSpec
    | ((gen: ConfigContext & { jhipsterConfigWithDefaults: Record<string, any> }, config: ConfigSpec<ConfigContext>) => PromptSpec);
  readonly jdl?: Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>;
  readonly scope: CommandConfigScope;
  /**
   * The callback receives the generator as input for 'generator' scope.
   * The callback receives jhipsterConfigWithDefaults as input for 'storage' (default) scope.
   * The callback receives blueprintStorage contents as input for 'blueprint' scope.
   *
   * Default value will not be applied to generator (using 'generator' scope) in initializing priority. Use cli.default instead.
   * Default value will be application to templates context object (application) in loading priority.
   */
  readonly default?: CommandConfigDefault<ConfigContext>;
  /**
   * Configure the generator according to the selected configuration.
   */
  readonly configure?: (gen: ConfigContext, value: any) => void;
};

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterConfig<ConfigContext = any> = RequireAtLeastOne<
  ConfigSpec<ConfigContext>,
  'argument' | 'cli' | 'prompt' | 'jdl' | 'internal'
>;

export type JHipsterConfigs<ConfigContext = any> = Record<string, JHipsterConfig<ConfigContext>>;

export type JHipsterCommandDefinition<ConfigContext = any> = {
  readonly arguments?: JHipsterArguments;
  readonly configs?: JHipsterConfigs<ConfigContext>;
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
  readonly choices?: JHipsterChoices;
  readonly scope: ConfigScope;
};

type ParseableConfigs = Record<string, ParseableConfig>;

export type ParseableCommand = {
  readonly options?: ParseableConfigs;
  readonly configs?: ParseableConfigs;
};

/** Extract contructor return type, eg: Boolean, String */
type ConstructorReturn<T> = T extends new () => infer R ? R : undefined;
type FilteredConfigScope = ConfigScope | undefined;

/** Filter Options/Config by scope */
type FilterScope<D extends ParseableConfig, S extends FilteredConfigScope> = D extends Record<'scope', S> ? D : never;

type FilterCommandScope<D extends ParseableConfigs, S extends FilteredConfigScope> = {
  [K in keyof D as IsNever<FilterScope<D[K], S>> extends true ? never : K]: D[K];
};

/**
 * @example
 * ```ts
 * type MergedConfigsOptions = MergeConfigsOptions<{
 *   configs: { clientFramework: { type: 'string'; scope: 'storage'; choices: ['angular', 'no'] } };
 *   options: { clientTestFramework: { type: 'string'; scope: 'storage'; choices: ['cypress', 'no'] } };
 * }>
 * ```
 */
type MergeConfigsOptions<D extends ParseableCommand, S extends FilteredConfigScope> = Simplify<
  D extends { configs: ParseableConfigs } ? { [K in keyof FilterCommandScope<D['configs'], S>]: D['configs'][K] } : object
>;

type GetType<C extends ParseableConfig> =
  C extends Record<'type', CliSpecType>
    ? C['type']
    : C extends Record<'cli', Record<'type', CliSpecType>>
      ? C['cli']['type']
      : C extends Record<'internal', Record<'type', CliSpecType>>
        ? C['internal']['type']
        : undefined;

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
type WrapperToPrimitive<T> = T extends Boolean ? boolean : T extends String ? string : T extends Number ? number : T;

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
 * @example
 * ```ts
 * type ExplodedCommandChoices = ExplodeCommandChoicesNoInference<{ clientFramework: { choices: ['angular', 'no'], scope: 'storage' }, clientTestFramework: { choices: ['cypress', 'no'], scope: 'storage' } }>
 * ```
 */
type ExplodeCommandChoicesNoInference<U extends ParseableConfigs> = {
  [K in keyof U]: U[K] extends infer RequiredChoices
    ? RequiredChoices extends { choices: any }
      ? K extends infer StringKey
        ? StringKey extends string
          ? NormalizeChoices<RequiredChoices['choices']> extends infer NormalizedChoices
            ? // @ts-expect-error Mapped typle type is loosy https://github.com/microsoft/TypeScript/issues/27995
              Simplify<DerivedPropertiesOf<StringKey, NormalizedChoices[number]>>
            : never
          : never
        : never
      : never
    : never;
};

type PrepareConfigsWithType<U extends ParseableConfigs> = Simplify<{
  -readonly [K in keyof U]?: U[K] extends Record<'choices', JHipsterChoices>
    ? TupleToUnion<NormalizeChoices<U[K]['choices']>>
    : WrapperToPrimitive<ConstructorReturn<GetType<U[K]>>> extends infer T
      ? T extends undefined
        ? unknown
        : T
      : never;
}>;

/** Keep Options/Config filtered by choices */
type OnlyChoices<D, C extends boolean> = D extends { choices: JHipsterChoices } ? (C extends true ? D : never) : C extends true ? never : D;

/**
 * Keep Options/Config filtered by choices
 *
 * @example
 * ```ts
 * type ConfigsWithChoice = OnlyConfigsWithChoice<{ clientFramework: { choices: ['angular', 'no'], scope: 'storage' }, clientTestFramework: { choices: ['cypress', 'no'], scope: 'storage' } }>
 * ```
 */
type OnlyConfigsWithChoice<D extends ParseableConfigs, C extends boolean> = {
  [K in keyof D as OnlyChoices<D[K], C> extends never ? never : K]: D[K];
};

/**
 * @example
 * ```
 * type Prop = ExportApplicationPropertiesFromCommand<{ configs: { clientFramework: { choices: ['angular', 'no'], scope: 'storage' }, bar: { scope: 'storage' } } }>;
 * ```
 */
export type ExportApplicationPropertiesFromCommand<C extends ParseableCommand> =
  MergeConfigsOptions<C, 'storage' | 'context'> extends infer Merged
    ? Merged extends ParseableConfigs
      ? // Add value inference to properties with choices
        // ? PrepareConfigsWithType<OnlyConfigsWithChoice<F, false>> & ValueOf<ExplodeCommandChoicesWithInference<OnlyConfigsWithChoice<F, true>>>
        Simplify<
          PrepareConfigsWithType<OnlyConfigsWithChoice<Merged, false>> &
            MergeUnion<ValueOf<ExplodeCommandChoicesNoInference<OnlyConfigsWithChoice<Merged, true>>>>
        >
      : never
    : never;

type ExportScopedPropertiesFromCommand<C extends ParseableCommand, S extends FilteredConfigScope> =
  MergeConfigsOptions<C, S> extends infer Merged
    ? Merged extends ParseableConfigs
      ? PrepareConfigsWithType<Merged>
      : EmptyObject
    : EmptyObject;

export type ExportStoragePropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'storage'>;

export type ExportGeneratorOptionsFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, any>;

export type HandleCommandTypes<C1 extends ParseableCommand> = Record<'Config', ExportStoragePropertiesFromCommand<C1>> &
  Record<'Options', ExportGeneratorOptionsFromCommand<C1>> &
  Record<'Application', ExportApplicationPropertiesFromCommand<C1>>;
