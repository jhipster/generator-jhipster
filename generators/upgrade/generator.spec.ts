/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { before, describe, expect, fn, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { simpleGit } from 'simple-git';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/tests.js';

import Generator from './index.ts';
import { UPGRADE_BRANCH } from './support/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  it('should throw without config', async () => {
    await expect(helpers.runJHipster(generator)).rejects.toThrow(
      "Could not find a valid JHipster application configuration, check if the '.yo-rc.json' file exists and if the 'generator-jhipster' key exists inside it.",
    );
  });
  it('should throw without baseName', async () => {
    await expect(helpers.runJHipster(generator).withFiles({ '.yo-rc.json': { 'generator-jhipster': { foo: 'bar' } } })).rejects.toThrow(
      'Current directory does not contain a JHipster project.',
    );
  });
  it('should throw with JHipster less than 7.9.3', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.3' } },
        }),
    ).rejects.toThrow('Upgrade the project to JHipster 7.9.4 before upgrading to the latest version.');
  });
  it('should throw with dirty git', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .onEnvironment(async ctx => {
          await simpleGit(ctx.cwd).init().add('package.json').commit('project');
        }),
    ).rejects.toThrow('local changes found.');
  });
  it('should throw at upgrade branch', async () => {
    await expect(
      helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .onEnvironment(async ctx => {
          await simpleGit(ctx.cwd).init().add('.').commit('project', ['--no-verify']).checkoutLocalBranch(UPGRADE_BRANCH);
        }),
    ).rejects.toThrow('You are on the upgrade branch, please switch to another branch before upgrading.');
  });
  describe('with createEnvBuilder option', async () => {
    let createEnvBuilder: any;

    before(async () => {
      createEnvBuilder = fn().mockReturnValue({ getEnvironment: () => ({ run: () => {} }) });
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withSpawnMock()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .withOptions({
          programName: 'customProgramName',
          createEnvBuilder,
        });
    });
    it('should call createEnvBuilder', async () => {
      expect(createEnvBuilder).toHaveBeenCalledTimes(1);
    });
  });
  describe('with createEnvBuilder and applyConfig options', async () => {
    let createEnvBuilder: any;

    before(async () => {
      createEnvBuilder = fn().mockReturnValue({ getEnvironment: () => ({ run: () => {} }) });
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withSpawnMock()
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .withOptions({
          programName: 'customProgramName',
          applyConfig: true,
          createEnvBuilder,
        });
    });
    it('should call createEnvBuilder twice', async () => {
      expect(createEnvBuilder).toHaveBeenCalledTimes(2);
    });
  });
  describe('with programName option', async () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withSpawnMock({
          registerNodeMockDefaults: false,
          stub: fn(),
        })
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .withOptions({
          programName: 'customProgramName',
          createEnvBuilder: () => ({ getEnvironment: () => ({ run: () => {} }) }),
        });
    });
    it('should execute programName', async () => {
      expect(result.spawnStub).toHaveBeenLastCalledWith(
        'spawn',
        'npx',
        expect.arrayContaining(['--no', 'customProgramName']),
        expect.any(Object),
      );
    });
  });

  describe('with programName and executable options', async () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withSpawnMock({
          registerNodeMockDefaults: false,
          stub: fn(),
        })
        .withFiles({
          'package.json': { devDependencies: { 'generator-jhipster': '7.9.4' } },
        })
        .commitFiles()
        .withOptions({
          programName: 'customProgramName',
          executable: 'customExecutable',
          createEnvBuilder: () => ({ getEnvironment: () => ({ run: () => {} }) }),
        });
    });
    it('should execute executable', async () => {
      expect(result.spawnStub).toHaveBeenLastCalledWith(
        'spawn',
        'npx',
        expect.arrayContaining(['--no', 'customExecutable']),
        expect.any(Object),
      );
    });
  });
});
