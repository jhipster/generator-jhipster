export type GenericDerivedProperty<T extends Record<string, string>, V extends string, Value extends boolean = true> = Record<keyof T, V> &
  Record<`${keyof T}${Capitalize<V>}`, Value> &
  Record<`${keyof T}${Capitalize<Exclude<T[keyof T], V>>}`, false>;

type NoValue = false | 'no' | 'none';

export type OptionalGenericDerivedProperty<T extends Record<string, string>, V extends string> = GenericDerivedProperty<
  T,
  V extends NoValue ? 'no' : V,
  boolean
> &
  Record<`${keyof T}Any`, V extends NoValue ? false : true>;
