import { before, beforeEach, describe, expect, it, expect as jestExpect } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';

import { createJHipsterLogger } from '../../lib/utils/index.js';
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
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [], env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined argument', async () => {
      const base = new Dummy([undefined], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy({ positionalArguments: [undefined], env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe(undefined);
    });
    it('string arguments', async () => {
      const base = new Dummy(['foo'], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      jestExpect(base.jdlFiles).toBe('foo');
    });
    it('vararg arguments', async () => {
      const base = new Dummy(['bar', 'foo'], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
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
      base._parseJHipsterArguments({
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
  describe('editPropertiesFile', () => {
    describe('when properties file does not exist', () => {
      it('should throw by default', async () => {
        await expect(
          helpers.run('dummy').withGenerators([
            [
              helpers.createDummyGenerator(Base as any, {
                [Base.POST_WRITING]() {
                  this.editPropertyFile('dummy.properties', [{ key: 'new.property', value: 'newValue' }]);
                },
              }),
              { namespace: 'dummy' },
            ],
          ]),
        ).rejects.toThrow(/Unable to find(.*)dummy.properties./);
      });
      it('should optionally create the file', async () => {
        await helpers.run('dummy').withGenerators([
          [
            helpers.createDummyGenerator(Base as any, {
              [Base.POST_WRITING]() {
                this.editPropertyFile('dummy.properties', [{ key: 'new.property', value: 'newValue' }], { create: true });
              },
            }),
            { namespace: 'dummy' },
          ],
        ]);
        runResult.assertFileContent('dummy.properties', 'new.property = newValue');
      });
    });
    describe('when properties file exists', () => {
      before(async () => {
        await helpers
          .run('dummy')
          .withFiles({ 'dummy.properties': 'append.existing = existingValue\noverride.existing = existingValue' })
          .withGenerators([
            [
              helpers.createDummyGenerator(Base as any, {
                [Base.POST_WRITING]() {
                  this.editPropertyFile('dummy.properties', [{ key: 'new.property', value: 'newValue' }]);
                  this.editPropertyFile('dummy.properties', [{ key: 'override.existing', value: 'overriddenValue' }]);
                  this.editPropertyFile('dummy.properties', [
                    { key: 'append.existing', value: oldValue => `${oldValue ? `${oldValue}, ` : ''}appendedValue` },
                  ]);
                },
              }),
              { namespace: 'dummy' },
            ],
          ]);
      });

      it('should add new property', async () => {
        runResult.assertFileContent('dummy.properties', 'new.property = newValue');
      });
      it('should override an existing property', async () => {
        runResult.assertFileContent('dummy.properties', 'override.existing = overriddenValue');
      });
      it('should append to an existing property', async () => {
        runResult.assertFileContent('dummy.properties', 'append.existing = existingValue, appendedValue');
      });
    });
  });
});
