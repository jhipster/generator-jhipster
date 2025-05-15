import { beforeEach, describe, it, expect as jestExpect } from 'esmocha';
import { defaultHelpers as helpers } from '../../lib/testing/index.js';

import { createJHipsterLogger } from '../base/support/index.js';
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
      Dummy = helpers.createDummyGenerator(Base as any);
    });

    it('no argument', async () => {
      const base = new Dummy([], { env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [], env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined argument', async () => {
      const base = new Dummy([undefined], { env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [undefined], env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('string arguments', async () => {
      const base = new Dummy(['foo'], { env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe('foo');
    });
    it('vararg arguments', async () => {
      const base = new Dummy(['bar', 'foo'], { env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        first: {
          type: String,
        },
        jdlFiles: {
          type: Array,
        },
      });
      jestExpect(base.first).toBe('bar');
      jestExpect(base.jdlFiles).toHaveLength(1);
      jestExpect(base.jdlFiles[0]).toMatch('foo');
    });
    it('vararg arguments using positionalArguments', async () => {
      const base = new Dummy({ positionalArguments: ['bar', ['foo']], env: await helpers.createTestEnv() });
      base.parseJHipsterArguments({
        first: {
          type: String,
        },
        jdlFiles: {
          type: Array,
        },
      });
      jestExpect(base.first).toBe('bar');
      jestExpect(base.jdlFiles).toHaveLength(1);
      jestExpect(base.jdlFiles[0]).toBe('foo');
    });
  });
});
