import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from './helpers.ts';

const DUMMY_NAMESPACE = 'jhipster:dummy';

describe('helpers', () => {
  describe('run defaults', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE });
    });
    it('should register not jhipster generators namespaces', () => {
      expect(
        Object.keys((runResult.env as any).store._meta)
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toHaveLength(0);
    });
  });
  describe('runJHipster defaults', () => {
    before(async () => {
      await helpers.runJHipster('dummy').withGenerators([[helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }]]);
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys((runResult.env as any).store._meta)
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
  describe('run using withJHipsterGenerators', () => {
    before(async () => {
      await helpers.run(helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }).withJHipsterGenerators();
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys((runResult.env as any).store._meta)
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
  describe('runJHipster with useDefaultMocks', () => {
    before(async () => {
      await helpers
        .runJHipster('dummy', { useDefaultMocks: true })
        .withGenerators([[helpers.createDummyGenerator(), { namespace: DUMMY_NAMESPACE }]]);
    });
    it('should register jhipster generators namespaces', () => {
      expect(
        Object.keys((runResult.env as any).store._meta)
          .filter(ns => ns !== DUMMY_NAMESPACE)
          .sort(),
      ).toMatchSnapshot();
    });
  });
});
