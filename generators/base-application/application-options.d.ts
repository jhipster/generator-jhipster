import type { StringKeyOf, UnionToIntersection } from 'type-fest';

// Values<{ a: string, b: number }> = string | number
type Values<T> = T[keyof T];

// ArrayKeys<[string, string, string]> = 0 | 1 | 2
type ArrayKeys<T extends string[]> = Exclude<keyof T, keyof []>;

// ArrayToUnion<['foo', 'bar']> = 'foo' | 'bar
type ArrayToUnion<T extends string[]> = T[number];

type NoUndefined<T extends string | undefined> = T extends undefined ? never : T;

// BoxArrayByName<N, [1, 2]> = { 0: { [N]: 1 }, 1: { [N]: 2 } }
type DeterministicBoxArrayByName<N extends string, T extends string[], A extends any[]> = {
  [K in ArrayKeys<T>]: Record<N, T[K] | undefined> &
    (T[K] extends string ? Record<`${N}${Capitalize<T[K]>}`, true> : Record<string, never>) &
    Record<`${N}${Capitalize<Exclude<ArrayToUnion<T>, T[K]>>}`, false> &
    (K extends keyof A ? A[K] : Record<string, never>);
};

/*
 * OptionWithDerivedProperties<'aProperty', ['foo', 'bar']> = { aProperty: 'foo'; aPropertyFoo: true; aPropertyBar: false; } | { aProperty: 'bar'; aPropertyFoo: false; aPropertyBar: true; }
 * Deterministic derived options causes too much union and cannot be used as it is for the entire application.
 * Can be used selectively
 */
export type DeterministicOptionWithDerivedProperties<N extends string, T extends string[], A extends any[] = []> = Values<
  DeterministicBoxArrayByName<N, T, A>
>;

// OptionWithDerivedProperties<'aProperty', ['foo', 'bar']> = { aProperty: 'foo' | 'bar'; aPropertyFoo: boolean; aPropertyBar: boolean;  }
export type OptionWithDerivedProperties<N extends string, T extends string[]> = Record<N, Exclude<ArrayToUnion<T>, 'any'> | undefined> &
  Record<`${N}${Capitalize<ArrayToUnion<T>>}`, boolean> &
  ('no' extends ArrayToUnion<T> ? Record<`${N}Any`, boolean> : Record<string, never>);

// KeyToArray<{ foo: 1, foo2: 2 }> = [{foo: 1}, {foo2: 2}]
// type KeyToArray

// KeyToArray<{ foo: ['foo'], foo2: ['foo'] }> = [{foo: { foo: 'foo', fooFoo: true }}, {foo2: { foo2: 'foo', foo2Foo: true }}]
type OptionBoxByName<D extends Record<string, string[]>> = {
  [K in StringKeyOf<D>]: OptionWithDerivedProperties<K, D[K]>;
};

// OptionsWithDerivedProperties<{ aProperty: ['foo', 'bar'], oProperty: ['foo', 'bar'] }> =  { aProperty: 'foo' | 'bar'; aPropertyFoo: boolean; aPropertyBar: boolean;  } &  { oProperty: 'foo' | 'bar'; oPropertyFoo: boolean; oPropertyBar: boolean;  }
export type OptionsWithDerivedProperties<D extends Record<string, string[]>> = UnionToIntersection<Values<OptionBoxByName<D>>>;

/*
some samples to test

type DatabaseTypeApplication = DeterministicOptionWithDerivedProperties<
  'databaseType',
  ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j'],
  [{ foo: 'test ' }, { foo2: 'test ' }]
>;
const foo: DatabaseTypeApplication;
if (foo.databaseTypeCassandra) {
  foo.foo;
}
if (foo.databaseTypeSql) {
  // $ExpectType void
  foo.databaseType
  foo.foo;
}

type DatabaseTypeApplication2 = OptionWithDerivedProperties<'databaseType', ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j']>;
const foo2: DatabaseTypeApplication2;
if (foo2.databaseTypeCassandra) {
  foo2.databaseType;
  foo2.
}
if (foo2.databaseTypeSql) {
  // $ExpectType void
  foo2.databaseType;
}

const foo3: OptionsWithDerivedProperties<{
  databaseType: ['sql', 'no', 'cassandra', 'couchbase', 'mongodb', 'neo4j'],
  messageBroker: ['no', 'kafka', 'pular'],
}>;
foo3.databaseTypeSql
 */
