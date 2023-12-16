/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { access } from 'fs/promises';
import { before, it, describe, expect } from 'esmocha';
import { testBlueprintSupport } from '../../test/support/tests.js';
import { skipPrettierHelpers as helpers } from '../../test/support/index.js';
import { GENERATOR_GIT } from '../generator-list.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);
const generatorPath = join(__dirname, 'index.ts');

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', () => {
    expect(GENERATOR_GIT).toBe(generator);
  });
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with', () => {
    describe('default config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('git feature', () => {
    describe('with default option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
      });
      it('should create .git', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).resolves.toBeUndefined();
      });
      it('should create 1 commit', async () => {
        const git = runResult.generator.createGit();
        await expect(git.log()).resolves.toMatchObject({
          total: 1,
          latest: { message: expect.stringMatching(/^Initial version of/) },
        });
      });
    });
    describe('with skipGit option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath).withOptions({ skipGit: true });
      });
      it('should not create .git', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).rejects.toMatchObject({ code: 'ENOENT' });
      });
    });
    describe('regenerating', () => {
      let runResult;
      before(async () => {
        runResult = await helpers.run(generatorPath);
        runResult = await runResult.create(generatorPath).withOptions({ baseName: 'changed' }).run();
      });
      it('should have 1 commit', async () => {
        const git = runResult.generator.createGit();
        await expect(git.log()).resolves.toMatchObject({ total: 1 });
      });
    });
  });
});
