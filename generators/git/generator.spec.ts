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
import { after, before, describe, expect, it } from 'esmocha';
import { access, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { simpleGit } from 'simple-git';

import { testBlueprintSupport } from '../../test/support/tests.ts';

import { runResult, skipPrettierHelpers as helpers } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator);
      });
      it('should write files and match snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('git feature', () => {
    describe('with default option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: false });
      });
      it('should create .git', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).resolves.toBeUndefined();
      });
      it('should attach the git root to written files', () => {
        const { generator } = runResult;
        expect(runResult.memFs.get(generator.destinationPath('.gitignore')).editorMetadata).toEqual({
          gitRoot: generator.destinationPath(),
        });
      });
      it('should create 1 commit', async () => {
        const git = runResult.generator.createGit();
        await expect(git.log()).resolves.toMatchObject({
          total: 1,
          latest: { message: expect.stringMatching(/^Initial version of/) },
        });
      });
    });
    describe('with exportApplication', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: false, exportApplication: true });
      });
      it('should not create .git, the application is exported as an archive', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).rejects.toThrow();
      });
    });

    describe('with deferCommit, the child of an exported workspace', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: false, deferCommit: true });
      });
      it('should not create .git, the parent generator writes the archive', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).rejects.toThrow();
      });
    });

    describe('inside an existing repository at a parent folder', () => {
      let parentDir: string;

      before(async () => {
        // Created outside the yeoman-test lifecycle: starting the run context would drop a prepared temporary dir.
        parentDir = await mkdtemp(join(tmpdir(), 'jhipster-git-parent-'));
        await simpleGit({ baseDir: parentDir }).init();
        await mkdir(resolve(parentDir, 'child'));
        await helpers.runJHipster(generator).cd(resolve(parentDir, 'child')).withOptions({ skipGit: false });
      });
      after(async () => {
        await rm(parentDir, { recursive: true, force: true });
      });
      it('should not create a nested .git', async () => {
        await expect(access(resolve(parentDir, 'child', '.git'))).rejects.toMatchObject({ code: 'ENOENT' });
      });
      it('should attach the parent repository root to written files', async () => {
        const { generator } = runResult;
        expect(runResult.memFs.get(generator.destinationPath('.gitignore')).editorMetadata).toEqual({
          gitRoot: await realpath(parentDir),
        });
      });
    });
    describe('with skipGit option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: true });
      });
      it('should not create .git', async () => {
        await expect(access(resolve(runResult.cwd, '.git'))).rejects.toMatchObject({ code: 'ENOENT' });
      });
      it('should not attach a git root to written files', () => {
        const { generator } = runResult;
        expect(runResult.memFs.get(generator.destinationPath('.gitignore')).editorMetadata).toEqual({});
      });
    });
    describe('regenerating', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: false });
        await helpers.runJHipsterInApplication(generator).withOptions({ skipGit: false, baseName: 'changed' });
      });
      it('should create a single commit', async () => {
        const git = runResult.generator.createGit();
        await expect(git.log()).resolves.toMatchObject({ total: 1 });
      });
    });
    describe('regenerating with --force-git', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({ skipGit: false });
        await helpers.runJHipsterInApplication(generator).withOptions({ skipGit: false, forceGit: true, baseName: 'changed' });
      });
      it('should create 2 commits', async () => {
        const git = runResult.generator.createGit();
        await expect(git.log()).resolves.toMatchObject({ total: 2 });
      });
    });
  });
});
