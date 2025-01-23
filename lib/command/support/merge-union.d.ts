/**
 * Based on https://github.com/sindresorhus/type-fest/issues/610#issuecomment-2398118998
 */
import type { EmptyObject, IsNever, KeysOfUnion, Simplify } from 'type-fest';

type _MergeUnionKnownKeys<BaseType, Keys extends keyof BaseType = keyof BaseType> = {
  [K in Keys]: Keys extends K ? BaseType[Keys] : never;
};

export type MergeUnion<BaseType> =
  IsNever<BaseType> extends false
    ? Simplify<
        _MergeUnionKnownKeys<BaseType> & {
          [K in KeysOfUnion<BaseType>]?: BaseType extends object ? (K extends keyof BaseType ? BaseType[K] : never) : never;
        }
      >
    : EmptyObject;
