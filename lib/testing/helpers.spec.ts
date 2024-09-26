import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from './helpers.js';

const DUMMY_NAMESPACE = 'dummy';

describe('helpers', () => {
  describe('defaults', () => {
    before(async () => {
      await helpers.runJHipster('info');
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys(runResult.env.store._meta)
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
});
