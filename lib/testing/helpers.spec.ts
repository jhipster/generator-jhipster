import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from './helpers.js';

const DUMMY_NAMESPACE = 'dummy';

describe('helpers', () => {
  describe('defaults', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE });
    });
    it('should not register jhipster generators namespaces', () => {
      expect(Object.keys(runResult.env.store._meta).filter(ns => ns !== DUMMY_NAMESPACE)).toHaveLength(0);
    });
  });
  describe('withJHipsterLookup', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }).withJHipsterLookup();
    });
    it('should register jhipster generators namespaces', () => {
      expect(Object.keys(runResult.env.store._meta).filter(ns => ns !== DUMMY_NAMESPACE)).toMatchSnapshot();
    });
  });
});
