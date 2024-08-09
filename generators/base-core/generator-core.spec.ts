import { beforeEach, describe, it, expect as jestExpect } from 'esmocha';
import { basicHelpers as helpers } from '../../testing/index.js';

import { createJHipsterLogger } from '../base/support/logger.js';
import Base from './index.js';

const BaseGenerator: any = Base.prototype;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

BaseGenerator.logger = createJHipsterLogger();

describe('generator - base-core', () => {
  describe('passing arguments', () => {
    let Dummy;
    beforeEach(async () => {
      await helpers.prepareTemporaryDir();
      Dummy = helpers.createDummyGenerator(Base);
    });

    it('no argument', async () => {
      const base = new Dummy([], { sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [], sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined argument', async () => {
      const base = new Dummy([undefined], { sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [undefined], sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('string arguments', async () => {
      const base = new Dummy(['foo'], { sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe('foo');
    });
    it('vararg arguments', async () => {
      const base = new Dummy(['bar', 'foo'], { sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        first: {
          type: String,
        },
        jdlFiles: {
          type: Array,
        },
      });
      jestExpect(base.first).toBe('bar');
      jestExpect(base.jdlFiles).toMatchObject(['foo']);
    });
    it('vararg arguments using positionalArguments', async () => {
      const base = new Dummy({ positionalArguments: ['bar', ['foo']], sharedData: {}, env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        first: {
          type: String,
        },
        jdlFiles: {
          type: Array,
        },
      });
      jestExpect(base.first).toBe('bar');
      jestExpect(base.jdlFiles).toMatchObject(['foo']);
    });
  });
});
