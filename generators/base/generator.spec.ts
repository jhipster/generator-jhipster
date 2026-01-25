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
import { before, describe, esmocha, expect, it } from 'esmocha';
import { basename } from 'node:path';

import EnvironmentBuilder from '../../cli/environment-builder.ts';
import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { getCommandHelpOutput, shouldSupportFeatures } from '../../test/support/tests.ts';

import BaseGenerator from './index.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(BaseGenerator);
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await getCommandHelpOutput()).toMatchSnapshot();
    });
  });

  describe('EnvironmentBuilder', () => {
    let envBuilder: EnvironmentBuilder;
    before(async () => {
      envBuilder = await EnvironmentBuilder.createDefaultBuilder();
    });
    it(`should be registered as jhipster:${generator} at yeoman-environment`, async () => {
      expect(await envBuilder.getEnvironment().get(`jhipster:${generator}`)).toBe(BaseGenerator);
    });
  });

  describe('skipPriorities', () => {
    const initializing = esmocha.fn();
    const prompting = esmocha.fn();
    const writing = esmocha.fn();
    const postWriting = esmocha.fn();

    class CustomGenerator extends BaseGenerator {
      get [BaseGenerator.INITIALIZING]() {
        initializing();
        return {};
      }

      get [BaseGenerator.PROMPTING]() {
        prompting();
        return {};
      }

      get [BaseGenerator.WRITING]() {
        writing();
        return {};
      }

      get [BaseGenerator.POST_WRITING]() {
        postWriting();
        return {};
      }
    }

    before(async () => {
      await helpers
        .run(CustomGenerator)
        .withJHipsterGenerators({ useDefaultMocks: true })
        .withOptions({
          skipPriorities: ['prompting', 'writing', 'postWriting'],
        });
    });

    it('should skip priorities', async () => {
      expect(initializing).toHaveBeenCalled();
      expect(prompting).not.toHaveBeenCalled();
      expect(writing).not.toHaveBeenCalled();
      expect(postWriting).not.toHaveBeenCalled();
    });
  });

  describe('control', () => {
    class CustomGenerator extends BaseGenerator {
      beforeQueue() {
        this.customLifecycle = true;
      }
    }

    describe('.jhipsterOldVersion', () => {
      let jhipsterOldVersion: string | undefined;

      before(async () => {
        await helpers
          .run(CustomGenerator)
          .withJHipsterConfig({ jhipsterVersion: '1.0.0' })
          .commitFiles()
          .withJHipsterGenerators({ useDefaultMocks: true })
          .withTask('postWriting', async function (this, { control }) {
            jhipsterOldVersion = control.jhipsterOldVersion;
          });
      });

      it('have jhipsterOldVersion set correctly', async () => {
        expect(jhipsterOldVersion).toBe('1.0.0');
      });
    });

    describe('.cleanupFiles', () => {
      let removeFiles: ReturnType<typeof esmocha.fn>;

      before(async () => {
        removeFiles = esmocha.fn();

        await helpers
          .run(CustomGenerator)
          .withJHipsterConfig({ jhipsterVersion: '1.0.0' })
          .commitFiles()
          .withJHipsterGenerators({ useDefaultMocks: true })
          .withTask('postWriting', async function (this, { control }) {
            control.removeFiles = removeFiles;
            await control.cleanupFiles({
              '1.0.1': [
                '1.0.1-file.txt',
                [true, '1.0.1-conditional-truthy-file1.txt', '1.0.1-conditional-truthy-file2.txt'],
                [false, '1.0.1-conditional-falsy-file1.txt'],
              ],
            });
          });
      });

      it('should call removeFiles', async () => {
        expect(removeFiles.mock.lastCall).toMatchInlineSnapshot(`
[
  {
    "oldVersion": "1.0.0",
    "removedInVersion": "1.0.1",
  },
  "1.0.1-file.txt",
  "1.0.1-conditional-truthy-file1.txt",
  "1.0.1-conditional-truthy-file2.txt",
]
`);
      });
    });

    describe('.removeFiles', () => {
      before(async () => {
        await helpers
          .run(CustomGenerator)
          .withJHipsterConfig({ jhipsterVersion: '1.0.0' })
          .withFiles({ 'diskFileToBeRemoved1.txt': 'foo', 'diskFileToBeRemoved2.txt': 'foo', 'diskFileNotToBeRemoved1.txt': 'foo' })
          .commitFiles()
          .withFiles({ 'memFsFileToBeRemoved1.txt': 'foo' })
          .withJHipsterGenerators({ useDefaultMocks: true })
          .withTask('postWriting', async function (this, { control }) {
            await control.removeFiles({ removedInVersion: '1.0.0' }, 'diskFileNotToBeRemoved1.txt');
            await control.removeFiles({ removedInVersion: '1.0.1' }, 'diskFileToBeRemoved1.txt', 'memFsFileToBeRemoved1.txt');
            await control.removeFiles({ oldVersion: '0.1.0', removedInVersion: '1.0.0' }, 'diskFileToBeRemoved2.txt');
          });
      });

      it('should remove files', () => {
        result.assertNoFile('diskFileToBeRemoved1.txt');
        result.assertNoFile('diskFileToBeRemoved2.txt');
        result.assertNoFile('memFsFileToBeRemoved1.txt');
      });
      it('should not remove files', () => {
        result.assertFile('diskFileNotToBeRemoved1.txt');
      });
      it('should match state snapshot', async () => {
        expect(result.getStateSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "stateCleared": "modified",
  },
  "diskFileNotToBeRemoved1.txt": {
    "stateCleared": "modified",
  },
  "diskFileToBeRemoved1.txt": {
    "state": "deleted",
    "stateCleared": "modified",
  },
  "diskFileToBeRemoved2.txt": {
    "state": "deleted",
    "stateCleared": "modified",
  },
  "memFsFileToBeRemoved1.txt": {
    "state": "deleted",
  },
}
`);
      });
    });
  });
});
