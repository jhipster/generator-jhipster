import type { ArgumentSpec, CliOptionSpec } from 'yeoman-generator';
import type { IsNever, RequireAtLeastOne, SetOptional, Simplify, TupleToUnion, ValueOf } from 'type-fest';
import type { JHipsterOptionDefinition } from '../jdl/core/types/parsing.js';
import type { DerivedPropertiesOf } from '../types/utils/derived-properties.js';
import type { MergeUnion } from './support/merge-union.js';

type CommandConfigScope = 'storage' | 'blueprint' | 'generator' | 'context' | 'none';

export type ConfigScope = CommandConfigScope | 'control';
type CliSpecType = CliOptionSpec['type'];

export type JHipsterNamedChoice = { value: string; name: string };

export type JHipsterChoices = readonly [...(string | JHipsterNamedChoice)[]];

export type JHipsterOption = SetOptional<CliOptionSpec, 'name'> & {
  readonly name?: string;
  readonly scope?: ConfigScope;
  readonly env?: string;
  readonly choices?: JHipsterChoices;
  readonly commandName?: string;
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
  readonly internal?: true;
  readonly prompt?:
    | PromptSpec
    | ((gen: ConfigContext & { jhipsterConfigWithDefaults: Record<string, any> }, config: ConfigSpec<ConfigContext>) => PromptSpec);
  readonly jdl?: Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>;
  readonly scope?: CommandConfigScope;
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
    | ((this: ConfigContext | void, ctx: any) => string | boolean | number | readonly string[]);
  /**
   * Configure the generator according to the selected configuration.
   */
  readonly configure?: (gen: ConfigContext) => void;
};

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterConfig<ConfigContext = any> = RequireAtLeastOne<
  ConfigSpec<ConfigContext>,
  'argument' | 'cli' | 'prompt' | 'jdl' | 'internal'
>;

export type JHipsterConfigs<ConfigContext = any> = Record<string, JHipsterConfig<ConfigContext>>;

export type JHipsterCommandDefinition<ConfigContext = any> = {
  readonly arguments?: JHipsterArguments;
  readonly options?: JHipsterOptions;
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

type ParseableCommand = {
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
  (D extends { configs: ParseableConfigs } ? { [K in keyof FilterCommandScope<D['configs'], S>]: D['configs'][K] } : object) &
    (D extends { options: ParseableConfigs } ? { [K in keyof FilterCommandScope<D['options'], S>]: D['options'][K] } : object)
>;

type GetType<C extends ParseableConfig> =
  C extends Record<'type', CliSpecType> ? C['type'] : C extends Record<'cli', Record<'type', CliSpecType>> ? C['cli']['type'] : undefined;

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
  MergeConfigsOptions<C, 'storage'> extends infer Merged
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
  MergeConfigsOptions<C, S> extends infer Merged ? (Merged extends ParseableConfigs ? PrepareConfigsWithType<Merged> : never) : never;

export type ExportStoragePropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'storage'>;

export type ExportGeneratorOptionsFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, any>;

export type ExportControlPropertiesFromCommand<C extends ParseableCommand> = ExportScopedPropertiesFromCommand<C, 'control'>;
