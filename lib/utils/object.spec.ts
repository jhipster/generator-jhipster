import { describe, expect, it } from 'esmocha';

import type { MutateDataParam } from './object.ts';
import { removeFieldsWithNullishValues } from './object.ts';

// __override__ field should be accepted.
({
  __override__: true,
}) satisfies MutateDataParam<{ str: string }>;

({
  // @ts-expect-error unknown properties should not be allowed
  str2: 'baz',
}) satisfies MutateDataParam<{ str: string }>;

const _shouldAcceptStringProperties: MutateDataParam<{ str: string }> = {
  str: 'baz',
};

_shouldAcceptStringProperties.str satisfies string | ((ctx: { str: string }) => string) | undefined;

const _shouldAcceptNumberProperties: MutateDataParam<{ nr: number }> = {
  nr: 1,
};

_shouldAcceptNumberProperties.nr satisfies number | ((ctx: { nr: number }) => number) | undefined;

({
  // @ts-expect-error function properties should always use callbacks
  fn: () => '',
}) satisfies MutateDataParam<{ fn: () => string }>;

({
  fn: () => () => '',
}) satisfies MutateDataParam<{ fn: () => string }>;

({
  // @ts-expect-error readonly properties should be removed
  readonly: 'baz',
}) satisfies MutateDataParam<{ readonly readonly: string }>;

({
  str: ctx => ctx.readonly,
}) satisfies MutateDataParam<{ readonly readonly: string; str: string }>;

({
  // @ts-expect-error fails to build because index signatures should be removed
  str: ctx => ctx.readonly,
}) satisfies MutateDataParam<Record<string, any>>;

describe('generator - base - support - config', () => {
  describe('deepCleanup', () => {
    it('should cleanup objects', () => {
      expect(removeFieldsWithNullishValues({ foo: 'bar', foo2: undefined, foo3: null })).toMatchObject({ foo: 'bar' });
    });
    it('should cleanup property objects', () => {
      expect(removeFieldsWithNullishValues({ nested: { foo: 'bar', foo2: undefined, foo3: null } })).toMatchObject({
        nested: { foo: 'bar' },
      });
    });
    it('should cleanup property arrays', () => {
      expect(removeFieldsWithNullishValues({ foo: ['bar', undefined, null] })).toMatchObject({ foo: ['bar'] });
    });
  });
});
