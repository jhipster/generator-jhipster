import type { ArgumentSpec, CliOptionSpec } from 'yeoman-generator';
import type { RequireAtLeastOne, SetOptional, Simplify, TaggedUnion, TupleToUnion, ValueOf } from 'type-fest';
import type { JHipsterOptionDefinition } from '../../jdl/types/types.js';
import type { DerivedPropertiesOf, DerivedPropertiesWithInferenceUnion } from '../types/utils/derived-properties.js';
import type { MergeUnion } from './support/merge-union.js';

type ConfigScope = 'storage' | 'blueprint' | 'control' | 'generator';
type CliSpecType = CliOptionSpec['type'];

export type JHispterChoices = readonly [...(string | { value: string; name: string })[]];

export type JHipsterOption = SetOptional<CliOptionSpec, 'name'> & {
  readonly name?: string;
  readonly scope?: 'storage' | 'blueprint' | 'control' | 'generator';
  readonly env?: string;
  readonly choices?: JHispterChoices;
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

type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'> & { scope?: 'storage' | 'blueprint' | 'generator' };

export type ConfigSpec<Generator> = {
  readonly description?: string;
  readonly choices?: JHispterChoices;

  readonly cli?: SetOptional<CliOptionSpec, 'name'> & { env?: string };
  readonly argument?: JHipsterArgumentConfig;
  readonly prompt?:
    | PromptSpec
    | ((gen: Generator & { jhipsterConfigWithDefaults: Record<string, any> }, config: ConfigSpec<Generator>) => PromptSpec);
  readonly jdl?: Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>;
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
    | ((this: Generator | void, ctx: any) => string | boolean | number | readonly string[]);
  /**
   * Configure the generator according to the selected configuration.
   */
  readonly configure?: (gen: Generator) => void;
};

export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;

export type JHipsterOptions = Record<string, JHipsterOption>;

export type JHipsterConfigs<Generator = any> = Record<string, RequireAtLeastOne<ConfigSpec<Generator>, 'argument' | 'cli' | 'prompt'>>;

export type JHipsterCommandDefinition<Generator = any> = {
  readonly arguments?: JHipsterArguments;
  readonly options?: JHipsterOptions;
  readonly configs?: JHipsterConfigs<Generator>;
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
type DerivedPropertiesWithInferenceUnionFromParseableConfigs<U extends ParseableConfigs> = {
  [K in keyof U]: U[K] extends infer RequiredChoices
    ? RequiredChoices extends { choices: JHispterChoices }
      ? K extends infer StringKey
        ? StringKey extends string
          ? NormalizeChoices<RequiredChoices['choices']> extends infer NormalizedChoices
            ? // @ts-expect-error Mapped typle type is loosy https://github.com/microsoft/TypeScript/issues/27995
              Simplify<DerivedPropertiesWithInferenceUnion<NormalizedChoices, StringKey>>
            : never
          : never
        : never
      : never
    : never;
};

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
  -readonly [K in keyof U]?: U[K] extends Record<'choices', JHispterChoices>
    ? TupleToUnion<NormalizeChoices<U[K]['choices']>>
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
