import { before, describe, expect, it } from 'esmocha';

import type { DelayedMutation, MutateDataParam } from './object.ts';
import { createDelayedMutationContext, finalizeMutations, mutateData, removeFieldsWithNullishValues } from './object.ts';

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

_shouldAcceptStringProperties.str satisfies
  | string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | typeof DelayedMutation
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | ((ctx: { str: string }, opts: { delayMarker: typeof DelayedMutation; defaults: boolean }) => string | typeof DelayedMutation)
  | undefined;

const _shouldAcceptNumberProperties: MutateDataParam<{ nr: number }> = {
  nr: 1,
};

_shouldAcceptNumberProperties.nr satisfies
  | number
  | ((ctx: { nr: number }, opts: { delayMarker: typeof DelayedMutation; defaults: boolean }) => number | typeof DelayedMutation)
  | undefined;

({
  // @ts-expect-error function properties should always use callbacks
  fn: () => '',
}) satisfies MutateDataParam<{ fn: () => string }>;

// MutateDataParam accepts function properties that use callbacks
({
  fn: () => () => '',
}) satisfies MutateDataParam<{ fn: () => string }>;

({
  // @ts-expect-error readonly properties should be removed
  readonly: 'baz',
}) satisfies MutateDataParam<{ readonly readonly: string }>;

// Readonly properties should be accessible in the callback context
({
  str: ctx => ctx.readonly,
}) satisfies MutateDataParam<{ readonly readonly: string; str: string }>;

({
  // @ts-expect-error fails to build because index signatures should be removed
  str: ctx => ctx.readonly,
}) satisfies MutateDataParam<Record<string, any>>;

describe('utils - object', () => {
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
  describe('mutateData', () => {
    describe('with a simple mutation', () => {
      const mutatedData: { prop?: string } = {};

      before(() => {
        mutateData(mutatedData, { prop: 'foo' });
      });

      it('should mutate the data', () => {
        expect(mutatedData).toEqual({ prop: 'foo' });
      });
    });

    describe('with multiple mutations', () => {
      const mutatedData: { prop: string; prop2: string } = { prop: 'foo', prop2: 'foo2' };

      before(() => {
        mutateData(mutatedData, { prop: ctx => `${ctx.prop}-bar` }, { prop2: ctx => ctx.prop + 2 });
      });

      it('should mutate the data', () => {
        expect(mutatedData).toEqual({ prop: 'foo-bar', prop2: 'foo-bar2' });
      });
    });
    describe('with delayed mutations', () => {
      const mutatedData: { prop?: string; prop2?: string } = createDelayedMutationContext();

      before(() => {
        mutateData(
          mutatedData,
          { prop2: (ctx, { delayMarker }) => (ctx.prop === undefined ? delayMarker : ctx.prop + 2) },
          { prop: 'bar' },
        );
        finalizeMutations(mutatedData);
      });

      it('should mutate the data', () => {
        expect(mutatedData).toEqual({ prop: 'bar', prop2: 'bar2' });
      });
    });
    describe('with auto-delayed mutations', () => {
      const mutatedData: { prop?: string; prop2?: string } = createDelayedMutationContext({ autoDelay: true });

      it('should mutate the data', () => {
        mutateData(mutatedData, { prop2: ctx => (ctx.prop ? 'delayed' : 'not-delayed') });
        expect(mutatedData.prop2).toBeUndefined();
        mutateData(mutatedData, { prop: 'bar' });
        finalizeMutations(mutatedData);
        expect(mutatedData).toEqual({ prop: 'bar', prop2: 'delayed' });
      });
    });
    describe('with auto-delayed mutations disabled', () => {
      const mutatedData: { prop?: string; prop2?: string } = createDelayedMutationContext({ autoDelay: false });

      it('should mutate the data', () => {
        mutateData(mutatedData, { prop2: ctx => (ctx.prop ? 'delayed' : 'not-delayed') });
        finalizeMutations(mutatedData);
        expect(mutatedData).toEqual({ prop2: 'not-delayed' });
      });
    });
    describe('delayed mutations can return undefined', () => {
      const mutatedData: { prop?: string; prop2?: string } = createDelayedMutationContext();

      before(() => {
        mutateData(mutatedData, { prop2: (ctx, { delayMarker }) => (ctx.prop === undefined ? delayMarker : undefined) }, { prop: 'bar' });
        finalizeMutations(mutatedData);
      });

      it('should mutate the data', () => {
        expect(mutatedData).toEqual({ prop: 'bar', prop2: undefined });
      });
    });
    describe('with overridden delayed mutations', () => {
      const mutatedData: { prop?: string; prop2?: string } = createDelayedMutationContext();

      before(() => {
        mutateData(
          mutatedData,
          { prop2: (ctx, { delayMarker }) => (ctx.prop === undefined ? delayMarker : ctx.prop + 1) },
          { prop2: (ctx, { delayMarker }) => (ctx.prop === undefined ? delayMarker : ctx.prop + 2) },
          { prop: 'bar' },
        );
        finalizeMutations(mutatedData);
      });

      it('should mutate the data', () => {
        expect(mutatedData).toEqual({ prop: 'bar', prop2: 'bar2' });
      });
    });
  });
});
