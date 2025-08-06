import { describe, expect, it } from 'esmocha';

import type { MutateDataParam } from './object.ts';
import { removeFieldsWithNullishValues } from './object.ts';

const _shouldAcceptOverride: MutateDataParam<{ str: string }> = {
  __override__: true,
};

const _shouldNotAcceptUnknownProperties: MutateDataParam<{ str: string }> = {
  // @ts-expect-error unknown properties should not be allowed
  str2: 'baz',
};

const _shouldAcceptStringProperties: MutateDataParam<{ str: string }> = {
  str: 'baz',
};

_shouldAcceptStringProperties.str satisfies string | ((ctx: { str: string }) => string) | undefined;

const _shouldAcceptNumberProperties: MutateDataParam<{ nr: number }> = {
  nr: 1,
};

_shouldAcceptNumberProperties.nr satisfies number | ((ctx: { nr: number }) => number) | undefined;

const _shouldNotAcceptFunction: MutateDataParam<{ fn: () => string }> = {
  // @ts-expect-error function properties should always use callbacks
  fn: () => '',
};

const _shouldAcceptFunctionGenerator: MutateDataParam<{ fn: () => string }> = {
  fn: () => () => '',
};

const _shouldAcceptReadonlyProperties: MutateDataParam<{ readonly readonly: string }> = {
  // @ts-expect-error readonly properties should be removed
  readonly: 'baz',
};

const _shouldAcceptReadonlyPropertiesOnCallbacks: MutateDataParam<{ readonly readonly: string; str: string }> = {
  str: ctx => ctx.readonly,
};

const _shouldNotAllowIndexSignature: MutateDataParam<Record<string, any>> = {
  // @ts-expect-error fails to build because index signatures should be removed
  str: ctx => ctx.readonly,
};

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
