import type { IsNever, PascalCase, Replace, RequireAtLeastOne, SetOptional, Simplify, TupleToUnion, ValueOf } from 'type-fest';
import type { ArgumentSpec, CliOptionSpec } from 'yeoman-generator';

import type BaseCoreGenerator from '../../generators/base-core/generator.ts';
import type GeneratorsByNamespace from '../../generators/types.ts';
import type { JHipsterNamedChoice } from '../core/types.ts';
import type { JHipsterOptionDefinition } from '../jdl/core/types/parsing.ts';

import type { MergeUnion } from './support/merge-union.ts';

/** Strips `[]` and `.` from a choice string so it can be used as a `Capitalize`-compatible key fragment. */
type NormalizeChoiceKey<Input extends string> = Replace<Replace<Input, '[]', ''>, '.', ''>;

/**
 * Builds the camelCase property name derived from a property name and a choice value.
 * @example
 * ```ts
 * type P = DerivedProperty<'clientFramework', 'angular'>; // 'clientFrameworkAngular'
 * type Q = DerivedProperty<'clientFramework', 'no'>;      // 'clientFrameworkNo'
 * ```
 */
export type DerivedProperty<
  Property extends string,
  Value extends string,
> = `${Property}${Uppercase<Value> extends Value ? Value : PascalCase<NormalizeChoiceKey<Value>>}`;

/**
 * Produces an object type where each choice in `Choices` maps to a `boolean` flag
 * named `${Property}${Capitalize<Choice>}`. Does not include the base value property or the `*Any` flag.
 * @example
 * ```ts
 * type F = DerivedBooleanPropertiesOf<'fieldType', 'string' | 'integer'>;
 * // { fieldTypeString: boolean; fieldTypeInteger: boolean }
 * ```
 */
export type DerivedBooleanPropertiesOf<Property extends string, Choices extends string> = Simplify<{
  [K in Choices as `${Property}${Capitalize<NormalizeChoiceKey<K>>}`]: boolean;
}>;

/**
 * Like `DerivedBooleanPropertiesOf` but also adds the base value property (`Property: Choices | undefined`)
 * and the aggregate boolean flag `${Property}Any`.
 * @example
 * ```ts
 * type F = DerivedPropertiesOf<'clientFramework', 'angular' | 'no'>;
 * // { clientFrameworkAngular: boolean; clientFrameworkNo: boolean; clientFramework: 'angular' | 'no'; clientFrameworkAny: boolean }
 * ```
 */
export type DerivedPropertiesOf<Property extends string, Choices extends string, IsArray extends boolean = false> = Simplify<
  {
    [K in Choices as `${Property}${Capitalize<NormalizeChoiceKey<K>>}`]: boolean;
  } & Record<Property, IsArray extends true ? Choices[] | undefined : Choices | undefined> &
    Record<`${Property}Any`, boolean>
>;

/**
 * Like `DerivedPropertiesOf` but with narrowed literal types: flags for the current value `V` are `true`,
 * all other choice flags are `false`, and `${P}Any` is inferred as `true | false` based on whether `V` is `'no'`.
 * @example
 * ```ts
 * type F = DerivedPropertiesWithChoice<'clientFramework', 'angular', 'angular' | 'no'>;
 * // { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true }
 * ```
 */
type DerivedPropertiesWithChoice<P extends string, V extends string, C extends string> = Simplify<
  {
    [K in C as `${P}${Capitalize<K>}`]: K extends V ? true : false;
  } & Record<P, V> &
    Record<`${P}Any`, V extends 'no' ? false : true>
>;

/**
 * Expands a tuple of choice strings into a discriminated union of `DerivedPropertiesWithChoice` objects,
 * one member per choice value. Useful for exhaustive type narrowing on a derived-property object.
 * @example
 * ```ts
 * type U = InferredDerivedPropertiesUnion<['angular', 'no'], 'clientFramework'>;
 * // equals:
 * type ExplodedConfigChoices =
 *   | { clientFrameworkAngular: true; clientFrameworkNo: false; clientFramework: 'angular'; clientFrameworkAny: true; }
 *   | { clientFrameworkAngular: false; clientFrameworkNo: true; clientFramework: 'no'; clientFrameworkAny: true; }
 * ```
 */
export type InferredDerivedPropertiesUnion<Choices extends [...string[]], Property extends string> = ValueOf<{
  [Index in Exclude<keyof Choices, keyof any[]>]: Choices[Index] extends infer Choice ?
    Choice extends string ?
      DerivedPropertiesWithChoice<Property, Choice, Choices[number]>
    : never
  : never;
}>;

/** Union of all valid scopes for a command configuration entry. */
type CommandConfigScope = 'storage' | 'blueprint' | 'generator' | 'context' | 'none';

type ScopedConfig = {
  /**
   * Command configuration scope
   * - `storage`: Used for storing configuration in `jhipsterConfig`.
   * - `blueprint`: Used for storing blueprint-specific configurations in `blueprintConfig`.
   * - `generator`: Used for generator options, will be inserted as a generator property, may conflict with existing properties.
   * - `context`: Used for options that are specific to the template context, will be inserted in `context`.
   * - `none`: Used for options that will be handled manually, such as options that are stored differently than they are received.
   */
  readonly scope: CommandConfigScope;
};

/**
 * Allowed type constructors (or a converter function) for a command config value.
 * Used to declare how a raw CLI string should be coerced.
 */
export type CommandConfigType = typeof String | typeof Boolean | typeof Number | typeof Object | ((opt: string) => any);

/**
 * Default value for a command config entry.
 * Can be a literal value or a callback that receives the config context and returns a literal value.
 */
export type CommandConfigDefault<ConfigContext> =
  | string
  | boolean
  | number
  | readonly string[]
  | ((this: ConfigContext | void, ctx: any) => string | boolean | number | readonly string[]);

/** Raw CLI option type accepted by yeoman-generator, extended with `Object` support. */
type CliSpecType = CliOptionSpec['type'] | typeof Object | typeof Array;

/**
 * Ordered tuple of choices for a config property.
 * Each entry is either a plain string value or a `JHipsterNamedChoice` `{ name, value }` object.
 */
export type JHipsterChoices = readonly [...(string | JHipsterNamedChoice)[]];

/**
 * Describes the interactive Inquirer prompt shown to the user for a config property.
 */
export type PromptSpec = {
  readonly type: 'input' | 'select' | 'confirm' | 'checkbox';
  readonly message: string | ((arg: any) => string);
  readonly when?: boolean | ((arg: any) => boolean);
  readonly default?: any;
  readonly filter?: any;
  readonly transformer?: any;
  readonly validate?: any;
};

/** Positional argument specification for a JHipster command config entry. */
type JHipsterArgumentConfig = SetOptional<ArgumentSpec, 'name'> & Partial<ScopedConfig>;

/**
 * CLI option specification for a JHipster command config entry.
 * Extends yeoman-generator's `CliOptionSpec`, omitting the internal `storage` field and
 * adding `env` (environment variable alias) and `implies` (option co-activation).
 */
export type CliSpec = Omit<SetOptional<CliOptionSpec, 'name'>, 'storage'> & {
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
  readonly internal?: { alias?: string; type: CommandConfigType };
  readonly prompt?: PromptSpec | ((gen: ConfigContext, config: ConfigSpec<ConfigContext>) => PromptSpec);
  readonly jdl?: Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>;
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
} & ScopedConfig;

/** Map of positional argument definitions for a command, keyed by argument name. */
export type JHipsterArguments = Record<string, JHipsterArgumentConfig>;
/** Like `JHipsterArguments` but each argument may also declare a `choices` list. */
export type JHipsterArgumentsWithChoices = Record<string, JHipsterArgumentConfig & { choices?: JHipsterChoices }>;

/**
 * Full specification for a single JHipster config property.
 * At least one of `argument`, `cli`, `prompt`, `jdl`, or `internal` must be provided.
 */
export type JHipsterConfig<ConfigContext = any> = RequireAtLeastOne<
  ConfigSpec<ConfigContext>,
  'argument' | 'cli' | 'prompt' | 'jdl' | 'internal'
>;

/** Map of named config specifications for a command, keyed by config property name. */
export type JHipsterConfigs<ConfigContext = any> = Record<string, JHipsterConfig<ConfigContext>>;

export type JHipsterCommandDefinition<ConfigContext = BaseCoreGenerator> = {
  readonly arguments?: JHipsterArguments;
  readonly configs?: JHipsterConfigs<ConfigContext>;
  /**
   * Import options from a generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  readonly import?: readonly (keyof GeneratorsByNamespace | 'base')[];
  /**
   * @experimental
   * Compose with generator.
   * @example ['server', 'jhipster-blueprint:server']
   */
  readonly compose?: readonly (keyof GeneratorsByNamespace | 'base')[];
  /**
   * Override options from the generator been blueprinted.
   */
  readonly override?: boolean;
};

/**
 * A simplified version of the `JHipsterCommandDefinition` type for types parsing.
 */
type ParsableConfig = {
  readonly type?: CliSpecType;
  readonly cli?: {
    readonly type: CliSpecType;
  };
  readonly internal?: {
    readonly type: CliSpecType;
  };
  readonly choices?: JHipsterChoices;
} & ScopedConfig;

/** Minimal configs map used purely for type-level inference (no generator dependencies). */
type ParsableConfigs = Record<string, ParsableConfig>;

/** Minimal command shape accepted by the type-extraction utilities (`Export*FromCommand`, `CommandTypeMap`). */
export type ParsableCommand = {
  readonly configs?: ParsableConfigs;
};

/** Unwrap constructor return type, e.g. `typeof Boolean` → `boolean` */
type UnwrapConstructor<T> = T extends new () => infer R ? R : undefined;
type ScopeOrUndefined = CommandConfigScope | undefined;

/** Filter a single config entry by scope */
type FilterScope<D extends ParsableConfig, S extends ScopeOrUndefined> = D extends Record<'scope', S> ? D : never;

/** Narrows a `ParsableConfigs` map to entries whose scope matches `S`. */
type FilterCommandScope<D extends ParsableConfigs, S extends ScopeOrUndefined> = {
  [K in keyof D as IsNever<FilterScope<D[K], S>> extends true ? never : K]: D[K];
};

/**
 * @example
 * ```ts
 * type Configs = ScopedCommandConfigs<{
 *   configs: { clientFramework: { type: 'string'; scope: 'storage'; choices: ['angular', 'no'] } };
 *   options: { clientTestFramework: { type: 'string'; scope: 'storage'; choices: ['cypress', 'no'] } };
 * }>
 * ```
 */
type ScopedCommandConfigs<D extends ParsableCommand, S extends ScopeOrUndefined> = Simplify<
  D extends { configs: ParsableConfigs } ? { [K in keyof FilterCommandScope<D['configs'], S>]: D['configs'][K] } : object
>;

/**
 * Resolves the raw `CliSpecType` from a config entry by checking `type`, `cli.type`,
 * and `internal.type` in priority order. Returns `undefined` if none is set.
 */
type ExtractConfigType<C extends ParsableConfig> =
  C extends Record<'type', CliSpecType> ? C['type']
  : C extends Record<'cli', Record<'type', CliSpecType>> ? C['cli']['type']
  : C extends Record<'internal', Record<'type', CliSpecType>> ? C['internal']['type']
  : undefined;

/** Converts wrapper types (`Boolean`, `String`, `Number`) to their primitive equivalents. */
type UnwrapPrimitive<T> =
  T extends Boolean ? boolean
  : T extends String ? string
  : T extends Number ? number
  : T;

/** Extracts the string value from a choice entry that is either a bare string or a `{ value: string }` object. */
type ExtractChoiceValue<Choice extends string | { value: string }> =
  Choice extends string ? Choice
  : Choice extends { value: string } ? Choice['value']
  : never;

/**
 * Normalises a choices tuple so that every element is a plain string value.
 * Named-choice objects (`{ name, value }`) are unwrapped to just their `value`.
 * @example
 * ```ts
 * type Normalized = NormalizeChoices<['angular', { value: 'no' }]>; // ['angular', 'no']
 * ```
 */
type NormalizeChoices<Choices extends readonly [...(string | { value: string })[]]> = {
  [Index in keyof Choices]: ExtractChoiceValue<Choices[Index]>;
};

/**
 * For each config entry in `U` that has a `choices` list, produces the corresponding
 * `DerivedPropertiesOf` object type (normalised boolean-flag map with base value and `*Any` flag).
 * @example
 * ```ts
 * type Result = ExplodeChoicesToDerivedProperties<{ clientFramework: { choices: ['angular', 'no'], scope: 'storage' } }>;
 * // { clientFramework: { clientFrameworkAngular: boolean; clientFrameworkNo: boolean; clientFramework: 'angular' | 'no'; clientFrameworkAny: boolean } }
 * ```
 */
type ExplodeChoicesToDerivedProperties<U extends ParsableConfigs> = {
  [K in keyof U]: U[K] extends infer RequiredChoices ?
    RequiredChoices extends { choices: any } ?
      K extends infer StringKey ?
        StringKey extends string ?
          NormalizeChoices<RequiredChoices['choices']> extends infer NormalizedChoices ?
            Simplify<
              DerivedPropertiesOf<
                StringKey,
                // @ts-expect-error Mapped tuple type is loose https://github.com/microsoft/TypeScript/issues/27995
                NormalizedChoices[number],
                ExtractConfigType<U[K]> extends ArrayConstructor ? true : false
              >
            >
          : never
        : never
      : never
    : never
  : never;
};

/**
 * Converts a `ParsableConfigs` map into a mutable partial object type where each key is typed
 * as the union of its choices (if declared) or the primitive equivalent of its constructor type.
 * Properties without a resolvable type become `unknown`.
 */
type ResolveConfigTypes<U extends ParsableConfigs> = Simplify<{
  -readonly [K in keyof U]?: U[K] extends Record<'choices', JHipsterChoices> ?
    ExtractConfigType<U[K]> extends ArrayConstructor ?
      TupleToUnion<NormalizeChoices<U[K]['choices']>>[]
    : TupleToUnion<NormalizeChoices<U[K]['choices']>>
  : UnwrapPrimitive<UnwrapConstructor<ExtractConfigType<U[K]>>> extends infer T ?
    T extends undefined ?
      unknown
    : T
  : never;
}>;

/** Returns D if its `choices` presence matches C, otherwise `never` */
type FilterByHasChoices<D, C extends boolean> =
  D extends { choices: JHipsterChoices } ?
    C extends true ?
      D
    : never
  : C extends true ? never
  : D;

/**
 * Filter configs map keeping only entries that do (C=true) or do not (C=false) have choices
 *
 * @example
 * ```ts
 * type ConfigsWithChoice = FilterConfigsByChoices<{ clientFramework: { choices: ['angular', 'no'], scope: 'storage' }, clientTestFramework: { choices: ['cypress', 'no'], scope: 'storage' } }, true>
 * ```
 */
type FilterConfigsByChoices<D extends ParsableConfigs, C extends boolean> = {
  [K in keyof D as FilterByHasChoices<D[K], C> extends never ? never : K]: D[K];
};

/**
 * @example
 * ```
 * type Prop = ExportApplicationPropertiesFromCommand<{ configs: { clientFramework: { choices: ['angular', 'no'], scope: 'storage' }, bar: { scope: 'storage' } } }>;
 * ```
 */
export type ExportApplicationPropertiesFromCommand<C extends ParsableCommand> =
  ScopedCommandConfigs<C, 'storage' | 'context'> extends infer Merged ?
    Merged extends ParsableConfigs ?
      // Add value inference to properties with choices
      // ? ResolveConfigTypes<FilterConfigsByChoices<F, false>> & ValueOf<ExplodeChoicesToDerivedPropertiesWithInference<FilterConfigsByChoices<F, true>>>
      Simplify<
        ResolveConfigTypes<FilterConfigsByChoices<Merged, false>> &
          MergeUnion<ValueOf<ExplodeChoicesToDerivedProperties<FilterConfigsByChoices<Merged, true>>>>
      >
    : never
  : never;

/**
 * Extracts config properties from command `C` filtered to scope `S`, resolving each entry to its
 * TypeScript type via `ResolveConfigTypes`. Returns `Record<string, never>` when no matching configs exist.
 */
type ExportScopedPropertiesFromCommand<C extends ParsableCommand, S extends ScopeOrUndefined> =
  ScopedCommandConfigs<C, S> extends infer Merged ?
    Merged extends ParsableConfigs ?
      ResolveConfigTypes<Merged>
    : Record<string, never>
  : Record<string, never>;

/** Extracts `storage`-scoped config properties from command `C` as a typed object. */
export type ExportStoragePropertiesFromCommand<C extends ParsableCommand> = ExportScopedPropertiesFromCommand<C, 'storage'>;

/** Extracts all scoped config properties from command `C` as generator option types (any scope). */
export type ExportGeneratorOptionsFromCommand<C extends ParsableCommand> = ExportScopedPropertiesFromCommand<C, any>;

/** Extracts `generator`-scoped config properties from command `C` as a `Readonly` typed object. */
export type ExportGeneratorPropertiesFromCommand<C extends ParsableCommand> = Readonly<ExportScopedPropertiesFromCommand<C, 'generator'>>;

/**
 * Bundles all derived type views for a command into a single record with four keys:
 * - `Config` — `storage`-scoped config properties
 * - `Options` — all generator option types
 * - `Generator` — `generator`-scoped properties (readonly)
 * - `Application` — combined `storage` + `context` application properties with choice inference
 *
 * @example
 * ```ts
 * type Command = CommandTypeMap<typeof command>;
 * export type Config = Command['Config'];
 * export type Options = Command['Options'];
 * ```
 */
export type CommandTypeMap<C1 extends ParsableCommand> = Record<'Config', ExportStoragePropertiesFromCommand<C1>> &
  Record<'Options', ExportGeneratorOptionsFromCommand<C1>> &
  Record<'Generator', ExportGeneratorPropertiesFromCommand<C1>> &
  Record<'Application', ExportApplicationPropertiesFromCommand<C1>>;
