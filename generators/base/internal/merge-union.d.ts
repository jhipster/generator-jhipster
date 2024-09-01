type Compute<T> = { [K in keyof T]: T[K] } | never;
type AllKeys<T> = T extends any ? keyof T : never;
/**
 * Based on https://github.com/sindresorhus/type-fest/issues/610
 */
export type MergeUnion<T, Keys extends keyof T = keyof T> = Compute<
  { [K in Keys]: T[Keys] } & { [K in AllKeys<T>]?: T extends any ? (K extends keyof T ? T[K] : never) : never }
>;
