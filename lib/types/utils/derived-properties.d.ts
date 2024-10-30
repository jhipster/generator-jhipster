import type { Simplify, ValueOf } from 'type-fest';

export type DerivedPropertiesOnlyOf<Property extends string, Choices extends string> = Simplify<{
  [K in Choices as `${Property}${Capitalize<K>}`]: boolean;
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
    [K in Choices as `${Property}${Capitalize<K>}`]: boolean;
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
