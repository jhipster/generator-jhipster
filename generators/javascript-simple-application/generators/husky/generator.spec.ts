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
import { before, describe, expect, it } from 'expect-node';
import { basename, resolve } from 'node:path';

import Generator from './index.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, fromMatrix, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  for (const [name, config] of Object.entries(fromMatrix({ skipCommitHook: [true, false] }))) {
    describe(name, () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withMockedSource()
          .withMockedNodeDependencies()
          .withSharedApplication({ prettierExtensions: ['PRETTIER_EXTENSIONS'], prettierFolders: ['PRETTIER_FOLDERS'] })
          .withJHipsterConfig(config);
      });

      it('should match files snapshot', () => {
        expect(result.getSnapshot()).toMatchSnapshot({ '.yo-rc.json': expect.objectContaining({ contents: expect.any(String) }) });
      });

      it('should call source snapshot', () => {
        expect(result.sourceCallsArg).toMatchSnapshot();
      });

      it('should compose with generators', () => {
        expect(result.getComposedGenerators()).toMatchObject(['jhipster:javascript-simple-application:prettier']);
      });
    });
  }

  describe('skipCommitHook in a project with the commit hook', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withMockedNodeDependencies()
        .withSharedApplication({ prettierExtensions: ['PRETTIER_EXTENSIONS'], prettierFolders: ['PRETTIER_FOLDERS'] })
        .withFiles({
          '.lintstagedrc.cjs': 'module.exports = {};\n',
          '.husky/pre-commit': 'lint-staged\n',
          'package.json': {
            scripts: { prepare: 'husky', test: 'test' },
            devDependencies: { husky: '1.0.0', 'lint-staged': '1.0.0', other: '1.0.0' },
          },
        })
        .commitFiles()
        .withJHipsterConfig({ skipCommitHook: true });
    });

    it('should remove the files of the commit hook', () => {
      result.assertNoFile(['.lintstagedrc.cjs', '.husky/pre-commit']);
    });

    it('should remove its script and its dependencies only', () => {
      result.assertJsonFileContent('package.json', { scripts: { test: 'test' }, devDependencies: { other: '1.0.0' } });
      result.assertNoJsonFileContent('package.json', { scripts: { prepare: 'husky' } });
      result.assertNoJsonFileContent('package.json', { devDependencies: { husky: '1.0.0' } });
      result.assertNoJsonFileContent('package.json', { devDependencies: { 'lint-staged': '1.0.0' } });
    });
  });
});
