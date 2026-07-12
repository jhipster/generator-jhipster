/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, beforeEach, describe, expect, it } from 'esmocha';

import { createJHipsterLogger } from '../../lib/utils/index.ts';

import Base from './index.ts';
import { editPropertiesFileCallback } from './support/properties-file.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

const BaseGenerator: any = Base.prototype;

BaseGenerator.log = (msg: any) => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

BaseGenerator.logger = createJHipsterLogger();

describe('generator - base-core', () => {
  describe('passing arguments', () => {
    let Dummy: any;
    beforeEach(async () => {
      await helpers.prepareTemporaryDir();
      Dummy = helpers.createDummyGenerator(Base);
    });

    it('no argument', async () => {
      const base = new Dummy([], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      expect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy([], { positionalArguments: [], env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      expect(base.jdlFiles).toBe(undefined);
    });
    it('undefined argument', async () => {
      const base = new Dummy([undefined], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      expect(base.jdlFiles).toBe(undefined);
    });
    it('undefined positional arguments', async () => {
      const base = new Dummy([], { positionalArguments: [undefined], env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      expect(base.jdlFiles).toBe(undefined);
    });
    it('string arguments', async () => {
      const base = new Dummy(['foo'], { env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        jdlFiles: {
          type: String,
        },
      });
      expect(base.jdlFiles).toBe('foo');
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
      expect(base.first).toBe('bar');
      expect(base.jdlFiles).toHaveLength(1);
      expect(base.jdlFiles[0]).toMatch('foo');
    });
    it('vararg arguments using positionalArguments', async () => {
      const base = new Dummy([], { positionalArguments: ['bar', ['foo']], env: await helpers.createTestEnv() });
      base._parseJHipsterArguments({
        first: {
          type: String,
        },
        jdlFiles: {
          type: Array,
        },
      });
      expect(base.first).toBe('bar');
      expect(base.jdlFiles).toHaveLength(1);
      expect(base.jdlFiles[0]).toBe('foo');
    });
  });
  describe('editPropertiesFile', () => {
    it('supports callbacks', async () => {
      await helpers.run('dummy').withGenerators([
        [
          helpers.createDummyGenerator(Base, {
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
                  helpers.createDummyGenerator(Base, {
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
                helpers.createDummyGenerator(Base, {
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
                  helpers.createDummyGenerator(Base, {
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
