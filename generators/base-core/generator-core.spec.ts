import { before, beforeEach, describe, expect, expect as jestExpect, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { createJHipsterLogger } from '../../lib/utils/index.ts';

import Base from './index.ts';
import { editPropertiesFileCallback } from './support/properties-file.ts';

const BaseGenerator: any = Base.prototype;

BaseGenerator.log = (msg: any) => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

BaseGenerator.logger = createJHipsterLogger();

describe('generator - base-core', () => {
  describe('passing arguments', () => {
    let Dummy: typeof BaseGenerator;
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
    it('supports callbacks', async () => {
      await helpers.run('dummy').withGenerators([
        [
          helpers.createDummyGenerator(Base as any, {
            [Base.POST_WRITING]() {
              this.editFile(
                'dummy.properties',
                { create: true },
                editPropertiesFileCallback(() => [['key', 'value']]),
              );
            },
          }),
          { namespace: 'dummy' },
        ],
      ]);
      runResult.assertFileContent('dummy.properties', 'key = value');
    });
    for (const sortFile of [true, false]) {
      describe(`passing sortFile option as ${sortFile}`, () => {
        describe('when properties file does not exist', () => {
          it('should throw by default', async () => {
            await expect(
              helpers.run('dummy').withGenerators([
                [
                  helpers.createDummyGenerator(Base as any, {
                    [Base.POST_WRITING]() {
                      this.editFile(
                        'dummy.properties',
                        editPropertiesFileCallback([{ key: 'new.property', value: 'newValue' }], { sortFile }),
                      );
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
                    this.editFile(
                      'dummy.properties',
                      { create: true },
                      editPropertiesFileCallback([{ key: 'new.property', value: 'newValue' }], { sortFile }),
                    );
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
              .withFiles({
                'dummy.properties': `append.existing = existingValue
# comment will be kept for no sortFile
override.existing = existingValue`,
              })
              .withGenerators([
                [
                  helpers.createDummyGenerator(Base as any, {
                    [Base.POST_WRITING]() {
                      this.editFile(
                        'dummy.properties',
                        editPropertiesFileCallback([{ key: 'new.property', value: 'newValue' }], { sortFile }),
                      );
                      this.editFile(
                        'dummy.properties',
                        editPropertiesFileCallback([{ key: 'override.existing', value: 'overriddenValue' }], { sortFile }),
                      );
                      this.editFile(
                        'dummy.properties',
                        editPropertiesFileCallback(
                          [{ key: 'append.existing', value: oldValue => `${oldValue ? `${oldValue}, ` : ''}appendedValueUsingFunction` }],
                          { sortFile },
                        ),
                      );
                      this.editFile(
                        'dummy.properties',
                        editPropertiesFileCallback(
                          [
                            { key: 'append.separator', value: 'firstSeparator', valueSep: ', ', comment: 'comment added' },
                            { key: 'append.separator', value: 'firstSeparator', valueSep: ', ', comment: 'comment ignored' },
                            { key: 'append.separator', value: 'secondSeparator', valueSep: ', ', comment: 'comment ignored' },
                          ],
                          { sortFile },
                        ),
                      );
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
          it('should append to an existing property', async () => {
            expect(runResult.getSnapshot('**/dummy.properties')).toMatchSnapshot();
          });
        });
      });
    }
  });
});
